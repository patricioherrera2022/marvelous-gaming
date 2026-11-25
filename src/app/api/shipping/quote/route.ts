import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/repository";
import { calculateArgentineShippingQuotes } from "@/lib/shipping-argentina";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      postal_code?: string;
      subtotal?: number;
      items?: Array<{
        item_type: "card" | "product";
        quantity: number;
        title?: string;
      }>;
    };

    const postalCode = (body.postal_code || "").trim();
    const subtotal = Number(body.subtotal || 0);
    const items = Array.isArray(body.items) ? body.items : [];
    const settings = await getStoreSettings();

    const result = calculateArgentineShippingQuotes({
      postalCode,
      items,
      subtotal,
      settings,
    });

    if (postalCode && !result.cpInfo) {
      return NextResponse.json(
        {
          error:
            "Código Postal argentino inválido. Ingresá 4 dígitos (ej: 1425, 5000, 8400).",
          ...result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ...result,
      freeShippingThreshold: settings.free_shipping_threshold_ars,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
