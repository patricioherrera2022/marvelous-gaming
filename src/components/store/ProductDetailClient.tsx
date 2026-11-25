"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { formatARS, getDiscountPercent } from "@/lib/format";
import type { Product, StoreSettings } from "@/types";

export function ProductDetailClient({
  product,
  settings,
}: {
  product: Product;
  settings: StoreSettings;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  const imageUrl =
    !imgError && product.images[0]
      ? product.images[0]
      : "/images/marvelous-logo.jpg";

  const discount = getDiscountPercent(
    product.price_ars,
    product.compare_at_price_ars
  );

  const transferPrice = settings.transfer_enabled
    ? Math.round(
      product.price_ars * (1 - settings.transfer_discount_percent / 100)
    )
    : null;

  const backHref =
    product.department === "tcg_sealed" ? "/sellados" : "/juegos";
  const backLabel =
    product.department === "tcg_sealed"
      ? "Sellados Pokémon TCG"
      : "Juegos y Accesorios";

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="relative flex min-h-[380px] items-center justify-center rounded-3xl border border-white/10 bg-obsidian-850 p-8">
          {discount && (
            <span className="absolute left-5 top-5 rounded-full bg-crimson-scale px-3 py-1 text-xs font-bold text-white shadow-crimson">
              -{discount}% OFF
            </span>
          )}
          <img
            src={imageUrl}
            alt={product.title}
            onError={() => setImgError(true)}
            className="max-h-[380px] w-auto rounded-2xl object-contain"
          />
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-crimson-400">
            Inicio
          </Link>
          <span>/</span>
          <Link href={backHref} className="text-crimson-400 hover:underline">
            {backLabel}
          </Link>
        </div>

        <h1 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
          {product.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/5 px-3 py-1 font-medium text-slate-200">
            {product.category}
          </span>
          {product.platform && (
            <span className="rounded-full bg-crimson-600/20 px-3 py-1 font-semibold text-crimson-300">
              {product.platform}
            </span>
          )}
          <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
            {product.condition}
          </span>
          {product.format !== "N/A" && (
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
              Formato: {product.format}
            </span>
          )}
        </div>

        <div className="mt-7 space-y-6 rounded-3xl border border-white/10 bg-obsidian-850 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              {product.compare_at_price_ars &&
                product.compare_at_price_ars > product.price_ars && (
                  <span className="block text-sm text-slate-500 line-through">
                    {formatARS(product.compare_at_price_ars)}
                  </span>
                )}
              <p className="font-display text-4xl font-black text-white">
                {formatARS(product.price_ars)}
              </p>
              {transferPrice !== null &&
                settings.transfer_discount_percent > 0 && (
                  <p className="mt-1 text-sm font-semibold text-emerald-400">
                    {formatARS(transferPrice)} pagando por Transferencia (
                    {settings.transfer_discount_percent}% OFF)
                  </p>
                )}
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {product.stock > 0
                ? `Stock disponible: ${product.stock}`
                : "Sin stock"}
            </span>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-slate-300">
              {product.description}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 sm:w-32">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2 text-lg text-slate-300 hover:text-white"
              >
                -
              </button>
              <span className="font-bold text-white">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="px-2 text-lg text-slate-300 hover:text-white"
              >
                +
              </button>
            </div>

            <button
              disabled={product.stock <= 0}
              onClick={() =>
                addItem(
                  {
                    key: `product:${product.id}`,
                    item_type: "product",
                    ref_id: product.id,
                    slug: product.slug,
                    title: product.title,
                    subtitle: `${product.category}${product.platform ? ` • ${product.platform}` : ""}`,
                    image_url: imageUrl,
                    unit_price_ars: product.price_ars,
                    max_stock: product.stock,
                  },
                  qty
                )
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-crimson-scale py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-crimson transition hover:brightness-110 disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock > 0 ? "Agregar al Carrito" : "Sin stock"}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-crimson-500" />
            <span>Producto 100% original con garantía Marvelous Gaming.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
