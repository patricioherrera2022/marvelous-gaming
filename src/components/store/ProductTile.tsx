"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { formatARS, getDiscountPercent } from "@/lib/format";
import type { Product } from "@/types";

export function ProductTile({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const imageUrl =
    !imgError && product.images[0]
      ? product.images[0]
      : "/images/marvelous-logo.jpg";

  const discount = getDiscountPercent(
    product.price_ars,
    product.compare_at_price_ars
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      key: `product:${product.id}`,
      item_type: "product",
      ref_id: product.id,
      slug: product.slug,
      title: product.title,
      subtitle: `${product.category}${product.platform ? ` • ${product.platform}` : ""}`,
      image_url: imageUrl,
      unit_price_ars: product.price_ars,
      max_stock: product.stock,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-obsidian-850 transition duration-300 hover:-translate-y-1 hover:border-crimson-500/60 hover:shadow-crimson">
      <Link
        href={`/productos/${product.slug}`}
        className="relative flex h-52 items-center justify-center overflow-hidden bg-obsidian-950 p-4"
      >
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {discount && (
            <span className="rounded-full bg-crimson-scale px-2 py-0.5 text-[11px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {product.platform && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur">
              {product.platform}
            </span>
          )}
        </div>

        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="max-h-44 w-auto rounded-lg object-contain transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-wide text-crimson-400">
              {product.category}
            </span>
            <span className="text-slate-400">
              {product.condition}
              {product.format !== "N/A" ? ` • ${product.format}` : ""}
            </span>
          </div>

          <Link href={`/productos/${product.slug}`}>
            <h3 className="mt-1.5 line-clamp-2 font-display text-base font-bold text-white transition group-hover:text-crimson-400">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {product.compare_at_price_ars &&
                product.compare_at_price_ars > product.price_ars && (
                  <span className="block text-xs text-slate-500 line-through">
                    {formatARS(product.compare_at_price_ars)}
                  </span>
                )}
              <span className="font-display text-lg font-extrabold text-white">
                {formatARS(product.price_ars)}
              </span>
            </div>
            <span
              className={`text-[11px] ${product.stock > 0 ? "text-emerald-400" : "text-crimson-400"
                }`}
            >
              {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-crimson-scale py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-crimson transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.stock > 0 ? "Agregar al carrito" : "Agotado"}
          </button>
        </div>
      </div>
    </div>
  );
}
