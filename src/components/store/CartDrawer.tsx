"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "./CartContext";
import { formatARS } from "@/lib/format";
import type { StoreSettings } from "@/types";

export function CartDrawer({ settings }: { settings: StoreSettings }) {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
  } = useCart();

  if (!isOpen) return null;

  const threshold = settings.free_shipping_threshold_ars || 0;
  const remainingForFree = Math.max(0, threshold - subtotal);
  const progressPct =
    threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 100;
  const transferPrice =
    settings.transfer_enabled && settings.transfer_discount_percent > 0
      ? Math.round(subtotal * (1 - settings.transfer_discount_percent / 100))
      : subtotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={closeCart} />
      <aside className="relative z-10 flex h-[100dvh] w-full max-w-md flex-col border-l border-white/10 bg-obsidian-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-crimson-500" />
            <h2 className="font-display text-lg font-bold text-white">
              Tu Carrito ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {threshold > 0 && (
          <div className="border-b border-white/10 bg-obsidian-850 px-5 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-300">
              <Truck className="h-4 w-4 text-crimson-400" />
              {remainingForFree === 0 ? (
                <span className="font-semibold text-emerald-400">
                  ¡Tenés envío gratis en tu compra!
                </span>
              ) : (
                <span>
                  Te faltan{" "}
                  <strong className="text-white">
                    {formatARS(remainingForFree)}
                  </strong>{" "}
                  para envío gratis
                </span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-crimson-scale transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-obsidian-800 p-5 text-slate-500">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <p className="font-display text-base font-semibold text-white">
                Tu carrito está vacío
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Explorá nuestras expansiones de Pokémon TCG, productos sellados o accesorios.
              </p>
              <Link
                href="/expansiones"
                onClick={closeCart}
                className="mt-5 rounded-full bg-crimson-scale px-5 py-2.5 text-sm font-semibold text-white shadow-crimson"
              >
                Explorar Expansiones
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-obsidian-800/70 p-3"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-20 w-16 shrink-0 rounded-lg bg-obsidian-950 object-contain p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-slate-500 hover:text-crimson-400"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {item.subtitle}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-obsidian-900 px-1.5 py-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          className="p-1 text-slate-300 hover:text-white"
                          aria-label="Restar"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[20px] text-center text-xs font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          className="p-1 text-slate-300 hover:text-white"
                          aria-label="Sumar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatARS(item.unit_price_ars * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 bg-obsidian-850 p-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  {formatARS(subtotal)}
                </span>
              </div>
              {settings.transfer_enabled &&
                settings.transfer_discount_percent > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span>
                      Pagando por Transferencia (
                      {settings.transfer_discount_percent}% OFF)
                    </span>
                    <span className="font-bold">
                      {formatARS(transferPrice)}
                    </span>
                  </div>
                )}
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-crimson-scale py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110"
            >
              Finalizar Compra
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
