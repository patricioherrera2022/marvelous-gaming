"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Receipt } from "lucide-react";
import { BarcodeSvg } from "./BarcodeSvg";
import {
  formatARS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";
import type { Order, StoreSettings } from "@/types";

export function PurchaseTicketView({
  order,
  settings,
  backHref,
  embedded = false,
}: {
  order: Order;
  settings: StoreSettings;
  backHref?: string;
  embedded?: boolean;
}) {
  const [format, setFormat] = useState<"a4" | "thermal">("a4");

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    })
    : new Date().toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div
      className={
        embedded
          ? ""
          : "min-h-screen bg-slate-100 px-4 py-8 text-slate-900 print:bg-white print:p-0"
      }
    >
      {!embedded && (
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
              <Receipt className="h-4 w-4 text-red-600" />
              Ticket de Compra {order.order_number}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormat("a4")}
                className={`rounded-lg px-3 py-1.5 transition ${format === "a4"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Hoja A4
              </button>
              <button
                type="button"
                onClick={() => setFormat("thermal")}
                className={`rounded-lg px-3 py-1.5 transition ${format === "thermal"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Ticket 80mm
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700"
            >
              <Printer className="h-4 w-4" />
              Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      )}

      {/* Printable Sheet */}
      <div
        className={`mx-auto rounded-2xl border border-slate-300 bg-white text-black shadow-lg print:rounded-none print:border-0 print:shadow-none ${format === "thermal" ? "max-w-[330px] p-4 text-[11px]" : "max-w-3xl p-8 text-sm"
          }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between gap-4 border-b-2 border-black pb-4 ${format === "thermal" ? "flex-col text-center" : "items-start"
            }`}
        >
          <div className={format === "thermal" ? "flex flex-col items-center" : ""}>
            <div className="flex items-center gap-2.5">
              <img
                src="/images/marvelous-logo.jpg"
                alt={settings.store_name}
                className="h-11 w-11 rounded-lg object-cover"
              />
              <div className="text-left">
                <p className="font-display text-lg font-black tracking-tight text-black">
                  {settings.store_name}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Comprobante de Compra
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-700">
              {settings.sender_address || "Av. Corrientes 1234"} •{" "}
              {settings.sender_city || "CABA"} (CP{" "}
              {settings.sender_postal_code || "1043"})
            </p>
            {settings.sender_cuit && (
              <p className="text-xs text-slate-600">
                CUIT: {settings.sender_cuit}
              </p>
            )}
          </div>

          <div className={format === "thermal" ? "text-center" : "text-right"}>
            <span className="inline-block rounded border border-black px-2.5 py-0.5 font-mono text-xs font-black">
              {order.order_number}
            </span>
            <p className="mt-1.5 text-xs text-slate-700">
              Fecha: {formattedDate}
            </p>
            <p className="text-xs font-semibold text-slate-800">
              Estado: {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
            </p>
          </div>
        </div>

        {/* Buyer & Shipping Info */}
        <div
          className={`mt-4 grid gap-4 border-b border-slate-300 pb-4 ${format === "thermal" ? "grid-cols-1" : "grid-cols-2"
            }`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Cliente
            </p>
            <p className="mt-0.5 font-bold text-black">{order.buyer_name}</p>
            {order.buyer_dni && (
              <p className="text-xs text-slate-700">DNI: {order.buyer_dni}</p>
            )}
            <p className="text-xs text-slate-700">{order.buyer_email}</p>
            <p className="text-xs text-slate-700">Tel: {order.buyer_phone}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Entrega y Pago
            </p>
            <p className="mt-0.5 font-bold text-black">{order.shipping_method}</p>
            {order.shipping_address ? (
              <p className="text-xs text-slate-700">
                {order.shipping_address}, {order.shipping_city} (
                {order.shipping_province}) — CP {order.shipping_postal_code}
              </p>
            ) : (
              <p className="text-xs text-slate-700">Retiro coordinado</p>
            )}
            <p className="mt-1 text-xs text-slate-700">
              Pago:{" "}
              <strong>
                {PAYMENT_METHOD_LABELS[order.payment_method] ||
                  order.payment_method}
              </strong>{" "}
              ({PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status})
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-1.5 pr-2">Cant.</th>
                <th className="py-1.5 pr-2">Detalle</th>
                <th className="py-1.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-2 align-top font-mono font-bold">
                    {item.quantity}x
                  </td>
                  <td className="py-2 pr-2 align-top">
                    <p className="font-bold text-black">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-600">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      Unitario: {formatARS(item.unit_price_ars)}
                    </p>
                  </td>
                  <td className="py-2 text-right align-top font-mono font-bold">
                    {formatARS(item.unit_price_ars * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1.5 border-t-2 border-black pt-3 text-xs">
          <div className="flex justify-between">
            <span>Subtotal productos</span>
            <span className="font-mono">{formatARS(order.subtotal_ars)}</span>
          </div>
          {order.discount_ars > 0 && (
            <div className="flex justify-between font-semibold text-emerald-700">
              <span>Descuento transferencia</span>
              <span className="font-mono">
                -{formatARS(order.discount_ars)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Envío ({order.shipping_method})</span>
            <span className="font-mono">
              {order.shipping_ars === 0
                ? "GRATIS"
                : formatARS(order.shipping_ars)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-black">
            <span>TOTAL</span>
            <span className="font-mono">{formatARS(order.total_ars)}</span>
          </div>
        </div>

        {order.payment_method === "transfer" &&
          order.payment_status === "pending" && (
            <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs">
              <p className="font-bold">Datos bancarios para transferencia:</p>
              <p>
                Alias: <strong className="font-mono">{settings.bank_alias}</strong>{" "}
                • CBU: <span className="font-mono">{settings.bank_cbu}</span>
              </p>
              <p>Titular: {settings.bank_holder}</p>
            </div>
          )}

        {order.notes && (
          <div className="mt-3 rounded border border-dashed border-slate-300 p-2.5 text-xs text-slate-700">
            <strong>Notas:</strong> {order.notes}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center border-t border-dashed border-slate-300 pt-4 text-center">
          <BarcodeSvg value={order.order_number} height={38} />
          <p className="mt-2 text-[11px] text-slate-600">
            ¡Gracias por tu compra en {settings.store_name}! •{" "}
            {settings.instagram_handle}
          </p>
        </div>
      </div>
    </div>
  );
}
