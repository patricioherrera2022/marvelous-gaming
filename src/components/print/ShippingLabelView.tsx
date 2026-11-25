"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Package, Printer, Truck } from "lucide-react";
import { BarcodeSvg } from "./BarcodeSvg";
import { estimatePackageWeightGrams } from "@/lib/shipping-argentina";
import type { Order, StoreSettings } from "@/types";

function detectCarrierBadge(order: Order): {
  title: string;
  subtitle: string;
  accentClass: string;
} {
  const id = (order.shipping_zone_id || "").toLowerCase();
  const method = (order.shipping_method || "").toLowerCase();
  if (id.startsWith("andreani") || method.includes("andreani")) {
    return {
      title: "ANDREANI",
      subtitle: id.includes("sucursal")
        ? "RETIRO EN SUCURSAL"
        : "ENTREGA A DOMICILIO",
      accentClass: "bg-red-700 text-white",
    };
  }
  if (id.startsWith("correo") || method.includes("correo")) {
    return {
      title: "CORREO ARGENTINO",
      subtitle: id.includes("sucursal")
        ? "RETIRO EN SUCURSAL"
        : id.includes("expreso")
          ? "PAQ.AR EXPRESO"
          : "PAQ.AR CLÁSICO",
      accentClass: "bg-amber-400 text-black",
    };
  }
  return {
    title: "DESPACHO / ENVÍO",
    subtitle: order.shipping_method.toUpperCase(),
    accentClass: "bg-black text-white",
  };
}

export function ShippingLabelView({
  order,
  settings,
  backHref,
}: {
  order: Order;
  settings: StoreSettings;
  backHref?: string;
}) {
  const [size, setSize] = useState<"label" | "a4">("label");
  const carrier = detectCarrierBadge(order);
  const weightGrams = estimatePackageWeightGrams(order.items);
  const totalUnits = order.items.reduce((s, it) => s + it.quantity, 0);
  const barcodeCode = order.tracking_code?.trim() || order.order_number;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-black print:bg-white print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </Link>
          )}
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Truck className="h-4 w-4 text-red-600" />
            Etiqueta de Envío {order.order_number}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSize("label")}
              className={`rounded-lg px-3 py-1.5 transition ${size === "label"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Etiqueta 10×15 cm
            </button>
            <button
              type="button"
              onClick={() => setSize("a4")}
              className={`rounded-lg px-3 py-1.5 transition ${size === "a4"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Hoja A4
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir Etiqueta / PDF
          </button>
        </div>
      </div>

      {/* Printable Label */}
      <div
        className={`mx-auto border-2 border-black bg-white text-black shadow-xl print:shadow-none ${size === "label" ? "max-w-[410px] p-4" : "max-w-2xl p-6"
          }`}
      >
        {/* Carrier Top Banner */}
        <div className="flex items-stretch justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/marvelous-logo.jpg"
              alt={settings.store_name}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div>
              <p className="font-display text-sm font-black uppercase leading-tight">
                {settings.store_name}
              </p>
              <p className="text-[10px] font-bold uppercase text-slate-600">
                Rótulo de Despacho
              </p>
            </div>
          </div>

          <div
            className={`flex flex-col justify-center rounded px-3 py-1.5 text-right ${carrier.accentClass}`}
          >
            <span className="font-display text-xs font-black tracking-wider">
              {carrier.title}
            </span>
            <span className="text-[9px] font-bold tracking-wide opacity-90">
              {carrier.subtitle}
            </span>
          </div>
        </div>

        {/* CP Highlight Box + Package Info */}
        <div className="mt-3 grid grid-cols-12 gap-2 border-b-2 border-black pb-3">
          <div className="col-span-5 flex flex-col items-center justify-center border-2 border-black bg-slate-50 p-2 text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
              CP DESTINO
            </span>
            <span className="font-mono text-3xl font-black tracking-tight text-black">
              {order.shipping_postal_code || "RETIRO"}
            </span>
          </div>

          <div className="col-span-7 flex flex-col justify-between rounded border border-slate-400 p-2 text-xs">
            <div>
              <span className="block text-[9px] font-bold uppercase text-slate-500">
                Servicio
              </span>
              <span className="font-bold leading-tight">
                {order.shipping_method}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Package className="h-3 w-3" /> {totalUnits} unid.
              </span>
              <span className="font-mono font-bold">~{weightGrams} g</span>
            </div>
          </div>
        </div>

        {/* DESTINATARIO */}
        <div className="mt-3 border-b-2 border-black pb-3">
          <span className="inline-block bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            DESTINATARIO
          </span>
          <p className="mt-1.5 font-display text-lg font-black uppercase leading-snug text-black">
            {order.buyer_name}
          </p>
          {order.shipping_address ? (
            <>
              <p className="text-sm font-bold text-black">
                {order.shipping_address}
              </p>
              <p className="text-xs font-semibold text-slate-800">
                {order.shipping_city}, {order.shipping_province} — CP{" "}
                {order.shipping_postal_code}
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-slate-800">
              Retiro en Punto de Entrega
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-slate-700">
            <span>Tel: {order.buyer_phone}</span>
            {order.buyer_dni && <span>DNI: {order.buyer_dni}</span>}
          </div>
          {order.notes && (
            <p className="mt-1.5 rounded bg-slate-100 p-1.5 text-[11px] font-medium text-slate-800">
              Obs: {order.notes}
            </p>
          )}
        </div>

        {/* REMITENTE */}
        <div className="mt-3 border-b border-dashed border-black pb-3 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            REMITENTE
          </span>
          <p className="font-bold text-black">
            {settings.sender_name || settings.store_name}
          </p>
          <p className="text-slate-700">
            {settings.sender_address || "Av. Corrientes 1234"},{" "}
            {settings.sender_city || "CABA"} ({settings.sender_province || "CABA"}
            ) — CP {settings.sender_postal_code || "1043"}
          </p>
          <p className="text-slate-600">
            Tel/WA: +{settings.whatsapp_number}
          </p>
        </div>

        {/* Fragile TCG Banner */}
        <div className="mt-3 flex items-center justify-center gap-2 border-2 border-black bg-amber-100 px-3 py-1.5 text-center text-[11px] font-black uppercase tracking-wider text-black">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>FRÁGIL — CARTAS COLECCIONABLES TCG — NO DOBLAR</span>
        </div>

        {/* Barcode */}
        <div className="mt-4 flex flex-col items-center">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {order.tracking_code
              ? `Tracking: ${order.tracking_code} • Pedido ${order.order_number}`
              : `Pedido N° ${order.order_number}`}
          </p>
          <BarcodeSvg value={barcodeCode} height={46} />
        </div>
      </div>
    </div>
  );
}
