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
        className="relative flex h-36 items-center justify-center overflow-hidden bg-obsidian-950 p-3 sm:h-52 sm:p-4"
      >
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {discount && (
            <span className="rounded-full bg-crimson-scale px-1.5 py-0.5 text-[10px] font-bold text-white sm:px-2 sm:text-[11px]">
              -{discount}%
            </span>
          )}
          {product.platform && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-slate-200 backdrop-blur sm:px-2.5 sm:text-[10px]">
              {product.platform}
            </span>
          )}
        </div>

        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="max-h-28 w-auto rounded-lg object-contain transition duration-300 group-hover:scale-105 sm:max-h-44"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4">
        <div>
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
            <span className="truncate font-semibold uppercase tracking-wide text-crimson-400">
              {product.category}
            </span>
            <span className="hidden text-slate-400 sm:inline">
              {product.condition}
              {product.format !== "N/A" ? ` • ${product.format}` : ""}
            </span>
          </div>

          <Link href={`/productos/${product.slug}`}>
            <h3 className="mt-1 line-clamp-2 font-display text-xs font-bold text-white transition group-hover:text-crimson-400 sm:mt-1.5 sm:text-base">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 border-t border-white/5 pt-2.5 sm:mt-4 sm:pt-3">
          <div className="flex items-baseline justify-between gap-1 sm:gap-2">
            <div>
              {product.compare_at_price_ars &&
                product.compare_at_price_ars > product.price_ars && (
                  <span className="block text-[10px] text-slate-500 line-through sm:text-xs">
                    {formatARS(product.compare_at_price_ars)}
                  </span>
                )}
              <span className="font-display text-sm font-extrabold text-white sm:text-lg">
                {formatARS(product.price_ars)}
              </span>
            </div>
            <span
              className={`text-[10px] sm:text-[11px] ${product.stock > 0 ? "text-emerald-400" : "text-crimson-400"
                }`}
            >
              {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-crimson-scale py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-crimson transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-3 sm:gap-2 sm:py-2.5 sm:text-xs"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.stock > 0 ? (
              <>
                <span className="sm:hidden">Agregar</span>
                <span className="hidden sm:inline">Agregar al carrito</span>
              </>
            ) : (
              "Agotado"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
