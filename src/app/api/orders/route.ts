import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import {
  createOrder,
  getStoreSettings,
  updateOrder,
  validateCartItemsForCheckout,
} from "@/lib/repository";
import { calculateArgentineShippingQuotes } from "@/lib/shipping-argentina";
import type { PaymentMethod } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      buyer_name,
      buyer_email,
      buyer_phone,
      buyer_dni = "",
      shipping_zone_id,
      shipping_address = "",
      shipping_city = "",
      shipping_province = "",
      shipping_postal_code = "",
      notes = "",
      payment_method,
      items,
    } = body as {
      buyer_name: string;
      buyer_email: string;
      buyer_phone: string;
      buyer_dni?: string;
      shipping_zone_id: string;
      shipping_address?: string;
      shipping_city?: string;
      shipping_province?: string;
      shipping_postal_code?: string;
      notes?: string;
      payment_method: PaymentMethod;
      items: Array<{
        item_type: "card" | "product";
        ref_id: string;
        quantity: number;
      }>;
    };

    if (!buyer_name?.trim() || !buyer_email?.trim() || !buyer_phone?.trim()) {
      return NextResponse.json(
        { error: "Completá tu nombre, email y teléfono para continuar." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    const settings = await getStoreSettings();
    const validatedItems = await validateCartItemsForCheckout(items);

    const subtotal = validatedItems.reduce(
      (sum, it) => sum + it.unit_price_ars * it.quantity,
      0
    );

    const qualifiesFreeShipping =
      settings.free_shipping_threshold_ars > 0 &&
      subtotal >= settings.free_shipping_threshold_ars;

    let resolvedShippingMethod = "";
    let resolvedShippingCost = 0;

    if (
      shipping_zone_id.startsWith("andreani_") ||
      shipping_zone_id.startsWith("correo_")
    ) {
      const quoteRes = calculateArgentineShippingQuotes({
        postalCode: shipping_postal_code,
        items: validatedItems.map((it) => ({
          item_type: it.item_type,
          quantity: it.quantity,
          title: it.title,
        })),
        subtotal,
        settings,
      });

      if (!quoteRes.cpInfo) {
        return NextResponse.json(
          {
            error:
              "Ingresá un Código Postal argentino válido (4 dígitos) para calcular el envío.",
          },
          { status: 400 }
        );
      }

      const matchedQuote = quoteRes.quotes.find(
        (q) => q.id === shipping_zone_id
      );
      if (!matchedQuote) {
        return NextResponse.json(
          { error: "El servicio de envío seleccionado no está disponible." },
          { status: 400 }
        );
      }

      resolvedShippingMethod = `${matchedQuote.service_name} (${quoteRes.cpInfo.zoneLabel})`;
      resolvedShippingCost = matchedQuote.price_ars;
    } else {
      const zone =
        settings.shipping_zones.find(
          (z) => z.id === shipping_zone_id && z.enabled
        ) || settings.shipping_zones.find((z) => z.enabled);

      if (!zone) {
        return NextResponse.json(
          { error: "Método de envío no válido." },
          { status: 400 }
        );
      }

      resolvedShippingMethod = zone.name;
      resolvedShippingCost = qualifiesFreeShipping
        ? 0
        : Number(zone.price_ars || 0);
    }

    const shippingCost = resolvedShippingCost;

    let discountArs = 0;
    if (
      payment_method === "transfer" &&
      settings.transfer_enabled &&
      settings.transfer_discount_percent > 0
    ) {
      discountArs = Math.round(
        (subtotal * settings.transfer_discount_percent) / 100
      );
    }

    const totalArs = Math.max(0, subtotal - discountArs + shippingCost);

    const order = await createOrder({
      buyer_name: buyer_name.trim(),
      buyer_email: buyer_email.trim(),
      buyer_phone: buyer_phone.trim(),
      buyer_dni: buyer_dni.trim(),
      shipping_zone_id,
      shipping_method: resolvedShippingMethod,
      shipping_address: shipping_address.trim(),
      shipping_city: shipping_city.trim(),
      shipping_province: shipping_province.trim(),
      shipping_postal_code: shipping_postal_code.trim(),
      notes: notes.trim(),
      payment_method,
      subtotal_ars: subtotal,
      discount_ars: discountArs,
      shipping_ars: shippingCost,
      total_ars: totalArs,
      items: validatedItems,
    });

    let mpInitPoint: string | null = null;
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (payment_method === "mercadopago") {
      if (!settings.mercadopago_enabled) {
        return NextResponse.json(
          { error: "Mercado Pago está deshabilitado temporalmente." },
          { status: 400 }
        );
      }
      if (mpToken) {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const mpClient = new MercadoPagoConfig({ accessToken: mpToken });
        const preferenceClient = new Preference(mpClient);

        const mpItems = validatedItems.map((it) => ({
          id: it.ref_id,
          title: it.title,
          unit_price: it.unit_price_ars,
          quantity: it.quantity,
          currency_id: "ARS",
        }));

        if (shippingCost > 0) {
          mpItems.push({
            id: "shipping",
            title: `Envío: ${resolvedShippingMethod}`,
            unit_price: shippingCost,
            quantity: 1,
            currency_id: "ARS",
          });
        }

        const prefResult = await preferenceClient.create({
          body: {
            items: mpItems,
            payer: {
              name: buyer_name.trim(),
              email: buyer_email.trim(),
            },
            external_reference: order.id,
            back_urls: {
              success: `${siteUrl}/checkout?status=success&order=${order.order_number}`,
              failure: `${siteUrl}/checkout?status=failure&order=${order.order_number}`,
              pending: `${siteUrl}/checkout?status=pending&order=${order.order_number}`,
            },
            auto_return: siteUrl.startsWith("https://")
              ? "approved"
              : undefined,
            notification_url: siteUrl.startsWith("https://")
              ? `${siteUrl}/api/webhooks/mercadopago`
              : undefined,
          },
        });

        await updateOrder(order.id, {
          mp_preference_id: prefResult.id || null,
        });
        mpInitPoint =
          prefResult.init_point || prefResult.sandbox_init_point || null;
      }
    }

    return NextResponse.json({
      order,
      mp_init_point: mpInitPoint,
      mp_configured: Boolean(mpToken),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Error al procesar el pedido" },
      { status: 400 }
    );
  }
}
