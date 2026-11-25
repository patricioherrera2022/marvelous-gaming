"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Box, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "./CartContext";
import { TiltCard } from "@/components/motion/TiltCard";
import { formatARS, getDiscountPercent } from "@/lib/format";
import type { CardListing, TcgCard } from "@/types";

export function PokemonCardTile({
  card,
  listing,
}: {
  card: TcgCard;
  listing: CardListing;
}) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const imageUrl =
    !imgError && card.image_base
      ? `${card.image_base}/low.webp`
      : "/images/pikachu.png";

  const discount = getDiscountPercent(
    listing.price_ars,
    listing.compare_at_price_ars
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      key: `card:${listing.id}`,
      item_type: "card",
      ref_id: listing.id,
      card_id: card.id,
      set_id: card.set_id,
      title: `${card.name} (#${card.local_id})`,
      subtitle: `${card.set_name || card.set_id} • ${listing.condition} • ${listing.finish} • ${listing.language}`,
      image_url: imageUrl,
      unit_price_ars: listing.price_ars,
      max_stock: listing.stock,
    });
  };

  return (
    <TiltCard className="h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-obsidian-850 transition duration-300 hover:border-crimson-500/60 hover:shadow-crimson">
        <Link
          href={`/cartas/${card.id}`}
          className="holo-card-sheen relative block bg-obsidian-950 p-3"
        >
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            {discount && (
              <span className="rounded-full bg-crimson-scale px-2 py-0.5 text-[11px] font-bold text-white shadow">
                -{discount}%
              </span>
            )}
            {listing.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles className="h-3 w-3" /> Destacada
              </span>
            )}
          </div>

          <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
            <Box className="h-3 w-3 text-crimson-400" />
            Ver 3D
          </span>

          <img
            src={imageUrl}
            alt={card.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="mx-auto aspect-[63/88] h-64 w-auto rounded-lg object-contain transition duration-300 group-hover:scale-[1.04]"
          />
        </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="truncate font-medium text-crimson-400">
              {card.set_name || card.set_id}
            </span>
            <span className="shrink-0 font-mono">#{card.local_id}</span>
          </div>

          <Link href={`/cartas/${card.id}`}>
            <h3 className="mt-1 truncate font-display text-base font-bold text-white transition group-hover:text-crimson-400">
              {card.name}
            </h3>
          </Link>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-medium text-slate-200">
              {listing.condition}
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-slate-300">
              {listing.finish}
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-slate-300">
              {listing.language}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {listing.compare_at_price_ars &&
                listing.compare_at_price_ars > listing.price_ars && (
                  <span className="block text-xs text-slate-500 line-through">
                    {formatARS(listing.compare_at_price_ars)}
                  </span>
                )}
              <span className="font-display text-lg font-extrabold text-white">
                {formatARS(listing.price_ars)}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400">
              Stock: {listing.stock}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-crimson-scale py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-crimson transition hover:brightness-110"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
    </TiltCard>
  );
}
