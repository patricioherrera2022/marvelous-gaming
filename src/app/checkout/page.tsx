"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  MessageCircle,
  Printer,
  Truck,
  Wallet,
} from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { PurchaseTicketView } from "@/components/print/PurchaseTicketView";
import { buildWhatsAppUrl, formatARS } from "@/lib/format";
import type {
  Order,
  PaymentMethod,
  ShippingQuoteOption,
  StoreSettings,
} from "@/types";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const mpStatus = searchParams.get("status");
  const mpOrderParam = searchParams.get("order");

  const { items, subtotal, clearCart } = useCart();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [returnedOrder, setReturnedOrder] = useState<Order | null>(null);
  const [loadingReturnOrder, setLoadingReturnOrder] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerDni, setBuyerDni] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("transfer");

  // Live CP Quote state
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [cpProvince, setCpProvince] = useState("");
  const [cpZoneLabel, setCpZoneLabel] = useState("");
  const [weightGrams, setWeightGrams] = useState<number>(0);
  const [dynamicQuotes, setDynamicQuotes] = useState<ShippingQuoteOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [mpConfigured, setMpConfigured] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings as StoreSettings;
        setSettings(s);
        const firstZone = s.shipping_zones.find((z) => z.enabled);
        if (firstZone) setZoneId(firstZone.id);
        if (s.transfer_enabled) setPaymentMethod("transfer");
        else if (s.mercadopago_enabled) setPaymentMethod("mercadopago");
        else if (s.cash_enabled) setPaymentMethod("cash");
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    if (!mpStatus || !mpOrderParam) return;
    setLoadingReturnOrder(true);
    fetch(`/api/orders/lookup?order=${encodeURIComponent(mpOrderParam)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.order) setReturnedOrder(data.order as Order);
      })
      .finally(() => setLoadingReturnOrder(false));
  }, [mpStatus, mpOrderParam]);

  const fetchShippingQuotes = useCallback(
    async (cpValue: string) => {
      const trimmed = cpValue.trim();
      setQuoteError("");
      setQuoting(true);
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postal_code: trimmed,
            subtotal,
            items: items.map((it) => ({
              item_type: it.item_type,
              quantity: it.quantity,
              title: it.title,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setQuoteError(data.error || "Código Postal inválido.");
          setCpProvince("");
          setCpZoneLabel("");
        } else if (data.cpInfo) {
          setCpProvince(data.cpInfo.province);
          setCpZoneLabel(data.cpInfo.zoneLabel);
          setProvince(data.cpInfo.province);
        }
        setWeightGrams(data.weightGrams || 0);
        const quotes = (data.quotes || []) as ShippingQuoteOption[];
        setDynamicQuotes(quotes);

        if (quotes.length > 0 && trimmed) {
          setZoneId((prev) => {
            const exists = quotes.some((q) => q.id === prev);
            if (!exists || prev === "retiro") {
              return quotes[0].id;
            }
            return prev;
          });
        }
      } catch {
        setQuoteError("No se pudo calcular el envío en este momento.");
      } finally {
        setQuoting(false);
      }
    },
    [items, subtotal]
  );

  // Auto-quote when 4 digits are present in postalCode
  useEffect(() => {
    if (!settings) return;
    const digits = postalCode.replace(/\D/g, "");
    if (digits.length === 4) {
      const t = setTimeout(() => {
        fetchShippingQuotes(postalCode);
      }, 280);
      return () => clearTimeout(t);
    }
  }, [postalCode, settings, fetchShippingQuotes]);

  if (loadingSettings || !settings || loadingReturnOrder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
      </div>
    );
  }

  // Mercado Pago return screen
  if (mpStatus && mpOrderParam) {
    const isSuccess = mpStatus === "success";
    const isPending = mpStatus === "pending";
    const whatsappMsg = `Hola Marvelous Gaming! Te escribo por mi pedido *${mpOrderParam}* (estado Mercado Pago: ${mpStatus}).`;

    return (
      <>
        <div className="no-print mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div
            className={`rounded-3xl border bg-obsidian-850 p-8 shadow-2xl ${
              isSuccess
                ? "border-emerald-500/40"
                : isPending
                ? "border-amber-500/40"
                : "border-crimson-500/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              ) : isPending ? (
                <Clock className="h-10 w-10 text-amber-400" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-crimson-400" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Retorno de Mercado Pago
                </span>
                <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
                  {isSuccess
                    ? "¡Pago aprobado con éxito!"
                    : isPending
                    ? "Pago pendiente de acreditación"
                    : "El pago no pudo completarse"}
                </h1>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-obsidian-950 p-4 text-sm sm:grid-cols-3">
              <div>
                <span className="block text-xs text-slate-400">N° de Pedido</span>
                <span className="font-mono font-bold text-white">
                  {mpOrderParam}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Envío</span>
                <span className="font-semibold text-white">
                  {returnedOrder?.shipping_method || "A coordinar"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Total</span>
                <span className="font-display text-lg font-extrabold text-crimson-400">
                  {returnedOrder ? formatARS(returnedOrder.total_ars) : "—"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              {isSuccess
                ? "Recibimos la confirmación de tu pedido. Te contactaremos para coordinar el despacho y enviarte el seguimiento."
                : isPending
                ? "Apenas se acredite el pago en Mercado Pago, confirmaremos tu pedido automáticamente."
                : "Podés reintentar la compra o coordinar el pago por transferencia bancaria directamente con nuestro equipo."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {returnedOrder && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full bg-crimson-scale px-6 py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Ticket de Compra
                </button>
              )}
              <a
                href={buildWhatsAppUrl(settings.whatsapp_number, whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
              <Link
                href="/expansiones"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-crimson-500"
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>

        {returnedOrder && (
          <div className="print-only">
            <PurchaseTicketView
              order={returnedOrder}
              settings={settings}
              embedded
            />
          </div>
        )}
      </>
    );
  }

  // Direct order confirmation screen
  if (confirmedOrder) {
    const whatsappMsg = `Hola Marvelous Gaming! Acabo de realizar el pedido *${confirmedOrder.order_number}* por un total de *${formatARS(confirmedOrder.total_ars)}* (${confirmedOrder.payment_method}). Adjunto comprobante / coordino entrega.`;

    return (
      <>
        <div className="no-print mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-emerald-500/30 bg-obsidian-850 p-8 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pedido registrado
                </span>
                <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
                  ¡Gracias por tu compra, {confirmedOrder.buyer_name}!
                </h1>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-obsidian-950 p-4 text-sm sm:grid-cols-3">
              <div>
                <span className="block text-xs text-slate-400">N° de Pedido</span>
                <span className="font-mono font-bold text-white">
                  {confirmedOrder.order_number}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Envío</span>
                <span className="font-semibold text-white">
                  {confirmedOrder.shipping_method}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Total</span>
                <span className="font-display text-lg font-extrabold text-crimson-400">
                  {formatARS(confirmedOrder.total_ars)}
                </span>
              </div>
            </div>

            {confirmedOrder.payment_method === "transfer" && (
              <div className="mt-6 rounded-2xl border border-crimson-500/30 bg-crimson-950/20 p-5">
                <h2 className="font-display text-base font-bold text-white">
                  Datos para Transferencia Bancaria
                </h2>
                <div className="mt-3 space-y-1.5 text-sm text-slate-300">
                  <p>
                    <strong className="text-white">Banco:</strong>{" "}
                    {settings.bank_name}
                  </p>
                  <p>
                    <strong className="text-white">Titular:</strong>{" "}
                    {settings.bank_holder}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p>
                      <strong className="text-white">Alias:</strong>{" "}
                      <span className="font-mono text-crimson-300">
                        {settings.bank_alias}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.bank_alias);
                        setCopiedAlias(true);
                        setTimeout(() => setCopiedAlias(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white hover:bg-white/20"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedAlias ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <p>
                    <strong className="text-white">CBU/CVU:</strong>{" "}
                    <span className="font-mono">{settings.bank_cbu}</span>
                  </p>
                </div>
              </div>
            )}

            {confirmedOrder.payment_method === "mercadopago" && !mpConfigured && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
                Tu pedido quedó registrado. El token de Mercado Pago aún no está
                configurado en el servidor, por lo que podés coordinar el link
                de pago directamente por WhatsApp.
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-crimson-scale px-6 py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110"
              >
                <Printer className="h-4 w-4" />
                Imprimir Ticket de Compra
              </button>
              <a
                href={buildWhatsAppUrl(settings.whatsapp_number, whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar comprobante / coordinar por WhatsApp
              </a>
              <Link
                href="/expansiones"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-crimson-500"
              >
                Seguir explorando
              </Link>
            </div>
          </div>
        </div>

        <div className="print-only">
          <PurchaseTicketView
            order={confirmedOrder}
            settings={settings}
            embedded
          />
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-black text-white">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Agregá cartas, sellados o accesorios antes de ir al checkout.
        </p>
        <Link
          href="/expansiones"
          className="mt-6 inline-block rounded-full bg-crimson-scale px-6 py-3 text-sm font-bold text-white shadow-crimson"
        >
          Explorar Expansiones
        </Link>
      </div>
    );
  }

  const qualifiesFree =
    settings.free_shipping_threshold_ars > 0 &&
    subtotal >= settings.free_shipping_threshold_ars;

  // Build unified list of shipping choices: dynamic CP quotes (Andreani + Correo Argentino) + fallback custom zones
  const enabledCustomZones = settings.shipping_zones.filter(
    (z) => z.enabled && (dynamicQuotes.length === 0 || z.id !== "retiro")
  );

  const selectedDynamic = dynamicQuotes.find((q) => q.id === zoneId);
  const selectedCustom = enabledCustomZones.find((z) => z.id === zoneId);

  const selectedShippingLabel = selectedDynamic
    ? selectedDynamic.service_name
    : selectedCustom?.name || "Envío";

  const shippingCost = selectedDynamic
    ? selectedDynamic.price_ars
    : qualifiesFree
    ? 0
    : selectedCustom?.price_ars || 0;

  const needsAddress = selectedDynamic
    ? selectedDynamic.requires_address
    : (selectedCustom?.id || zoneId) !== "retiro";

  const discountArs =
    paymentMethod === "transfer" && settings.transfer_discount_percent > 0
      ? Math.round((subtotal * settings.transfer_discount_percent) / 100)
      : 0;
  const total = Math.max(0, subtotal - discountArs + shippingCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          buyer_dni: buyerDni,
          shipping_zone_id: zoneId || "retiro",
          shipping_address: address,
          shipping_city: city,
          shipping_province: province,
          shipping_postal_code: postalCode,
          notes,
          payment_method: paymentMethod,
          items: items.map((it) => ({
            item_type: it.item_type,
            ref_id: it.ref_id,
            quantity: it.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo completar el pedido.");
        return;
      }

      clearCart();
      setMpConfigured(Boolean(data.mp_configured));

      if (data.mp_init_point) {
        window.location.href = data.mp_init_point;
        return;
      }
      setConfirmedOrder(data.order);
    } catch {
      setError("Error de conexión al crear el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-black text-white">
        Finalizar Compra
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Calculá tu envío con Andreani o Correo Argentino usando tu Código Postal
        y elegí tu forma de pago en ARS.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-7">
          {/* Buyer info */}
          <div className="rounded-3xl border border-white/10 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              1. Datos del Comprador
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Nombre y Apellido *"
                className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
              />
              <input
                required
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="Email *"
                className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
              />
              <input
                required
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="WhatsApp / Teléfono *"
                className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
              />
              <input
                type="text"
                value={buyerDni}
                onChange={(e) => setBuyerDni(e.target.value)}
                placeholder="DNI (para envío / factura)"
                className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
              />
            </div>
          </div>

          {/* Shipping with CP Calculator */}
          <div className="rounded-3xl border border-white/10 bg-obsidian-850 p-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-crimson-500" />
              <h2 className="font-display text-lg font-bold text-white">
                2. Calculador de Envío (Andreani &amp; Correo Argentino)
              </h2>
            </div>

            {/* CP Box */}
            <div className="mt-4 rounded-2xl border border-crimson-500/30 bg-obsidian-950 p-4">
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Ingresá tu Código Postal argentino (4 dígitos, ej: 1425, 5000,
                8400)
              </label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-crimson-400" />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Código Postal (ej: 1425 o C1425ABC)"
                    className="w-full rounded-xl border border-white/10 bg-obsidian-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-crimson-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={quoting || !postalCode.trim()}
                  onClick={() => fetchShippingQuotes(postalCode)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-crimson-scale px-5 py-2.5 text-xs font-bold text-white shadow-crimson transition hover:brightness-110 disabled:opacity-40"
                >
                  {quoting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4" />
                  )}
                  Calcular envío
                </button>
              </div>

              {quoteError && (
                <p className="mt-2 text-xs text-crimson-400">{quoteError}</p>
              )}

              {cpProvince && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                    Destino: {cpProvince} ({cpZoneLabel})
                  </span>
                  {weightGrams > 0 && (
                    <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
                      Peso estimado del paquete: ~{weightGrams} g
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Carrier Quotes */}
            <div className="mt-4 space-y-2.5">
              {dynamicQuotes.map((q) => {
                const selected = zoneId === q.id;
                const carrierColors =
                  q.carrier === "andreani"
                    ? "bg-red-600/20 text-red-300 border-red-500/40"
                    : q.carrier === "correo_argentino"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

                return (
                  <label
                    key={q.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                      selected
                        ? "border-crimson-500 bg-crimson-950/25"
                        : "border-white/10 bg-obsidian-950 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping_zone"
                        checked={selected}
                        onChange={() => setZoneId(q.id)}
                        className="mt-1 accent-crimson-600"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${carrierColors}`}
                          >
                            {q.carrier_label}
                          </span>
                          <p className="text-sm font-bold text-white">
                            {q.service_name}
                          </p>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {q.zone_label} • Demora estimada: {q.estimated_days}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {q.is_free && q.original_price_ars > 0 && (
                        <span className="block text-[11px] text-slate-500 line-through">
                          {formatARS(q.original_price_ars)}
                        </span>
                      )}
                      <span
                        className={`text-sm font-bold ${
                          q.price_ars === 0 ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {q.price_ars === 0 ? "Gratis" : formatARS(q.price_ars)}
                      </span>
                    </div>
                  </label>
                );
              })}

              {/* Fallback or additional custom zones */}
              {enabledCustomZones.map((zone) => {
                const selected = zoneId === zone.id;
                return (
                  <label
                    key={zone.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                      selected
                        ? "border-crimson-500 bg-crimson-950/25"
                        : "border-white/10 bg-obsidian-950 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping_zone"
                        checked={selected}
                        onChange={() => setZoneId(zone.id)}
                        className="mt-1 accent-crimson-600"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">
                          {zone.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {zone.description} • {zone.estimated_days}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {qualifiesFree || zone.price_ars === 0
                        ? "Gratis"
                        : formatARS(zone.price_ars)}
                    </span>
                  </label>
                );
              })}
            </div>

            {needsAddress && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dirección completa (o Sucursal elegida) *"
                  className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500 sm:col-span-2"
                />
                <input
                  required
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Localidad / Barrio *"
                  className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Provincia *"
                    className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
                  />
                  <input
                    required
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="CP *"
                    className="rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
                  />
                </div>
              </div>
            )}

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales (ej: horario de entrega, sucursal preferida, piso/depto)"
              className="mt-4 w-full rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
            />
          </div>

          {/* Payment */}
          <div className="rounded-3xl border border-white/10 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              3. Forma de Pago
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {settings.transfer_enabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "transfer"
                      ? "border-crimson-500 bg-crimson-950/25"
                      : "border-white/10 bg-obsidian-950 hover:border-white/25"
                  }`}
                >
                  <Landmark className="h-5 w-5 text-emerald-400" />
                  <span className="mt-2 text-sm font-bold text-white">
                    Transferencia
                  </span>
                  {settings.transfer_discount_percent > 0 && (
                    <span className="mt-0.5 text-xs font-semibold text-emerald-400">
                      {settings.transfer_discount_percent}% OFF
                    </span>
                  )}
                </button>
              )}

              {settings.mercadopago_enabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mercadopago")}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "mercadopago"
                      ? "border-crimson-500 bg-crimson-950/25"
                      : "border-white/10 bg-obsidian-950 hover:border-white/25"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-sky-400" />
                  <span className="mt-2 text-sm font-bold text-white">
                    Mercado Pago
                  </span>
                  <span className="mt-0.5 text-xs text-slate-400">
                    Tarjetas y dinero en cuenta
                  </span>
                </button>
              )}

              {settings.cash_enabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "cash"
                      ? "border-crimson-500 bg-crimson-950/25"
                      : "border-white/10 bg-obsidian-950 hover:border-white/25"
                  }`}
                >
                  <Wallet className="h-5 w-5 text-amber-400" />
                  <span className="mt-2 text-sm font-bold text-white">
                    Efectivo / Retiro
                  </span>
                  <span className="mt-0.5 text-xs text-slate-400">
                    Al retirar o recibir
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-white/10 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Resumen de Compra
            </h2>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((it) => (
                <div
                  key={it.key}
                  className="flex items-center justify-between gap-3 rounded-xl bg-obsidian-950 p-3 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={it.image_url}
                      alt={it.title}
                      className="h-12 w-10 rounded object-contain"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {it.title}
                      </p>
                      <p className="truncate text-slate-400">
                        {it.quantity} x {formatARS(it.unit_price_ars)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-bold text-white">
                    {formatARS(it.unit_price_ars * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{formatARS(subtotal)}</span>
              </div>
              {discountArs > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>
                    Descuento Transferencia (
                    {settings.transfer_discount_percent}%)
                  </span>
                  <span>-{formatARS(discountArs)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Envío ({selectedShippingLabel})</span>
                <span>
                  {shippingCost === 0 ? "Gratis" : formatARS(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-display text-xl font-black text-white">
                <span>Total</span>
                <span className="text-crimson-400">{formatARS(total)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-crimson-500/40 bg-crimson-950/40 p-3 text-xs text-crimson-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-crimson-scale py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-crimson transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {paymentMethod === "mercadopago"
                ? "Continuar a Mercado Pago"
                : "Confirmar Pedido"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
