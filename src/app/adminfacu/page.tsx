"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Gamepad2,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AdminShell } from "./AdminShell";
import { formatARS, ORDER_STATUS_LABELS } from "@/lib/format";
import type { Order, Product } from "@/types";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [activeCardsCount, setActiveCardsCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/cards?status=active").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ])
      .then(([cardsRes, prodsRes, ordersRes]) => {
        setActiveCardsCount((cardsRes.items || []).length);
        setProducts(prodsRes.products || []);
        setOrders(ordersRes.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      setSyncMsg(data.message || data.error || "Sincronización finalizada.");
    } finally {
      setSyncing(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.order_status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_ars || 0), 0);

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-black text-white">
              Resumen de Tienda
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Controlá el catálogo completo de cartas Pokémon TCG, sellados,
              juegos PS4/PS5 y pedidos.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-crimson-500/40 bg-crimson-950/40 px-4 py-2.5 text-xs font-bold text-crimson-200 transition hover:bg-crimson-900/50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando TCGdex..." : "Sincronizar Expansiones TCGdex"}
          </button>
        </div>

        {syncMsg && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-xs font-medium text-emerald-300">
            {syncMsg}
          </div>
        )}

        {loading ? (
          <div className="flex py-16 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/adminfacu/cartas"
                className="rounded-2xl border border-white/10 bg-obsidian-850 p-5 transition hover:border-crimson-500/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Cartas Habilitadas
                  </span>
                  <Sparkles className="h-5 w-5 text-crimson-500" />
                </div>
                <p className="mt-3 font-display text-3xl font-black text-white">
                  {activeCardsCount}
                </p>
                <p className="mt-1 text-xs text-crimson-400">
                  Gestionar por expansión →
                </p>
              </Link>

              <Link
                href="/adminfacu/productos"
                className="rounded-2xl border border-white/10 bg-obsidian-850 p-5 transition hover:border-crimson-500/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Sellados / Juegos / Accesorios
                  </span>
                  <Gamepad2 className="h-5 w-5 text-crimson-500" />
                </div>
                <p className="mt-3 font-display text-3xl font-black text-white">
                  {products.filter((p) => p.is_active).length} /{" "}
                  <span className="text-lg text-slate-400">
                    {products.length}
                  </span>
                </p>
                <p className="mt-1 text-xs text-crimson-400">
                  Administrar productos →
                </p>
              </Link>

              <Link
                href="/adminfacu/pedidos"
                className="rounded-2xl border border-white/10 bg-obsidian-850 p-5 transition hover:border-crimson-500/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Pedidos Totales
                  </span>
                  <ClipboardList className="h-5 w-5 text-crimson-500" />
                </div>
                <p className="mt-3 font-display text-3xl font-black text-white">
                  {orders.length}
                </p>
                <p className="mt-1 text-xs text-crimson-400">
                  Ver y despachar pedidos →
                </p>
              </Link>

              <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Facturación Registrada
                  </span>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="mt-3 font-display text-3xl font-black text-emerald-400">
                  {formatARS(totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Acumulado pedidos activos
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">
                  Últimos Pedidos
                </h2>
                <Link
                  href="/adminfacu/pedidos"
                  className="text-xs font-semibold text-crimson-400 hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Todavía no hay pedidos registrados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="py-2.5 pr-4">Pedido</th>
                        <th className="py-2.5 pr-4">Comprador</th>
                        <th className="py-2.5 pr-4">Pago</th>
                        <th className="py-2.5 pr-4">Estado</th>
                        <th className="py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.slice(0, 8).map((o) => (
                        <tr key={o.id}>
                          <td className="py-3 pr-4 font-mono font-bold text-white">
                            {o.order_number}
                          </td>
                          <td className="py-3 pr-4 text-slate-300">
                            {o.buyer_name}
                          </td>
                          <td className="py-3 pr-4 uppercase text-slate-400">
                            {o.payment_method}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-semibold text-white">
                              {ORDER_STATUS_LABELS[o.order_status] ||
                                o.order_status}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-crimson-400">
                            {formatARS(o.total_ars)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
