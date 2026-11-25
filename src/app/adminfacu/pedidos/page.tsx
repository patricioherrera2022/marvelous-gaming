"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Printer, Receipt } from "lucide-react";
import { AdminShell } from "../AdminShell";
import {
  buildWhatsAppUrl,
  formatARS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateOrderField = async (
    id: string,
    patch: {
      order_status?: OrderStatus;
      payment_status?: PaymentStatus;
      tracking_code?: string;
    }
  ) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    await loadOrders();
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-black text-white">
            Pedidos y Ventas
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Actualizá estados de pago, despacho y código de seguimiento.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-12 text-center text-sm text-slate-400">
            Todavía no ingresaron pedidos desde la tienda.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-obsidian-850 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-black text-white">
                        {order.order_number}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                        {PAYMENT_METHOD_LABELS[order.payment_method] ||
                          order.payment_method}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {order.buyer_name} •{" "}
                      <span className="text-slate-400">{order.buyer_email}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Envío: {order.shipping_method}
                      {order.shipping_address
                        ? ` — ${order.shipping_address}, ${order.shipping_city} (${order.shipping_province})`
                        : ""}
                      {order.shipping_postal_code
                        ? ` • CP ${order.shipping_postal_code}`
                        : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-2xl font-black text-crimson-400">
                      {formatARS(order.total_ars)}
                    </p>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/adminfacu/pedidos/${order.id}/ticket`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-obsidian-950 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-crimson-500/60 hover:text-white"
                      >
                        <Receipt className="h-3.5 w-3.5 text-crimson-400" />
                        Ticket de Compra
                      </Link>
                      <Link
                        href={`/adminfacu/pedidos/${order.id}/etiqueta`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-full bg-crimson-scale px-3 py-1 text-xs font-bold text-white shadow-crimson transition hover:brightness-110"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Etiqueta de Envío
                      </Link>
                      <a
                        href={buildWhatsAppUrl(
                          order.buyer_phone,
                          `Hola ${order.buyer_name}! Te escribimos de Marvelous Gaming por tu pedido ${order.order_number}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp Comprador
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-2.5 rounded-xl bg-obsidian-950 p-2.5 text-xs"
                    >
                      <img
                        src={it.image_url || "/images/marvelous-logo.jpg"}
                        alt={it.title}
                        className="h-12 w-9 rounded object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">
                          {it.title}
                        </p>
                        <p className="truncate text-slate-400">
                          {it.quantity} x {formatARS(it.unit_price_ars)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/5 pt-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      Estado del Pedido
                    </label>
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        updateOrderField(order.id, {
                          order_status: e.target.value as OrderStatus,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs text-white outline-none focus:border-crimson-500"
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      Estado del Pago
                    </label>
                    <select
                      value={order.payment_status}
                      onChange={(e) =>
                        updateOrderField(order.id, {
                          payment_status: e.target.value as PaymentStatus,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs text-white outline-none focus:border-crimson-500"
                    >
                      {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-slate-400">
                      Código de Seguimiento
                    </label>
                    <input
                      type="text"
                      defaultValue={order.tracking_code}
                      onBlur={(e) => {
                        if (e.target.value !== order.tracking_code) {
                          updateOrderField(order.id, {
                            tracking_code: e.target.value,
                          });
                        }
                      }}
                      placeholder="Ej: AR123456789"
                      className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs text-white outline-none focus:border-crimson-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
