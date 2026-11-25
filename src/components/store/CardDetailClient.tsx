"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCart } from "./CartContext";
import { CardInspector3D } from "./CardInspector3D";
import {
  buildWhatsAppUrl,
  CONDITION_LABELS,
  formatARS,
  getDiscountPercent,
} from "@/lib/format";
import type { CardListing, StoreSettings, TcgCard, TcgSet } from "@/types";

export function CardDetailClient({
  card,
  set,
  listings,
  settings,
}: {
  card: TcgCard;
  set: TcgSet | null;
  listings: CardListing[];
  settings: StoreSettings;
}) {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState(listings[0]?.id || "");
  const [qty, setQty] = useState(1);

  const selected =
    listings.find((l) => l.id === selectedId) || listings[0] || null;

  const highResUrl = card.image_base
    ? `${card.image_base}/high.webp`
    : "/images/pikachu.png";

  const lowResUrl = card.image_base
    ? `${card.image_base}/low.webp`
    : "/images/pikachu.png";

  const discount = selected
    ? getDiscountPercent(selected.price_ars, selected.compare_at_price_ars)
    : null;

  const transferPrice =
    selected && settings.transfer_enabled
      ? Math.round(
          selected.price_ars * (1 - settings.transfer_discount_percent / 100)
        )
      : null;

  const handleAdd = () => {
    if (!selected) return;
    addItem(
      {
        key: `card:${selected.id}`,
        item_type: "card",
        ref_id: selected.id,
        card_id: card.id,
        set_id: card.set_id,
        title: `${card.name} (#${card.local_id})`,
        subtitle: `${set?.name || card.set_name || card.set_id} • ${selected.condition} • ${selected.finish} • ${selected.language}`,
        image_url: lowResUrl,
        unit_price_ars: selected.price_ars,
        max_stock: selected.stock,
      },
      qty
    );
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Interactive 3D Inspector */}
      <div className="lg:col-span-5">
        <CardInspector3D
          imageUrl={highResUrl}
          cardName={card.name}
          finish={selected?.finish || "Holo"}
          language={selected?.language || "EN"}
          setId={card.set_id}
          discount={discount}
        />
      </div>

      {/* Details */}
      <div className="lg:col-span-7">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Link href="/expansiones" className="hover:text-crimson-400">
            Expansiones
          </Link>
          <span>/</span>
          <Link
            href={`/expansiones/${card.set_id}`}
            className="inline-flex items-center gap-1.5 font-semibold text-crimson-400 hover:text-crimson-300"
          >
            {(set?.symbol_url || card.set_symbol_url) && (
              <img
                src={(set?.symbol_url || card.set_symbol_url) ?? ""}
                alt=""
                className="h-4 w-4 object-contain"
              />
            )}
            {set?.name || card.set_name || card.set_id}
          </Link>
          <span>/</span>
          <span>#{card.local_id}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
            {card.name}
          </h1>
          {(set?.logo_url || card.set_logo_url) && (
            <img
              src={(set?.logo_url || card.set_logo_url) ?? ""}
              alt={set?.name || ""}
              className="h-10 w-auto object-contain"
            />
          )}
        </div>

        {/* TCGdex Metadata Chips */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {card.rarity && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-obsidian-850 px-3 py-1 text-amber-300">
              <Sparkles className="h-3 w-3" /> {card.rarity}
            </span>
          )}
          {card.category && (
            <span className="rounded-full border border-white/10 bg-obsidian-850 px-3 py-1 text-slate-300">
              {card.category}
            </span>
          )}
          {card.hp && (
            <span className="rounded-full border border-white/10 bg-obsidian-850 px-3 py-1 text-slate-300">
              HP {card.hp}
            </span>
          )}
          {card.types &&
            card.types.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-obsidian-850 px-3 py-1 text-slate-300"
              >
                {t}
              </span>
            ))}
          {card.illustrator && (
            <span className="rounded-full border border-white/10 bg-obsidian-850 px-3 py-1 text-slate-400">
              Ilustrador: {card.illustrator}
            </span>
          )}
        </div>

        {selected ? (
          <div className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-obsidian-850 p-4 sm:mt-7 sm:space-y-6 sm:p-6">
            {listings.length > 1 && (
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Elegí variante / condición disponible:
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {listings.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedId(l.id);
                        setQty(1);
                      }}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition ${
                        l.id === selected.id
                          ? "border-crimson-500 bg-crimson-950/30 text-white"
                          : "border-white/10 bg-obsidian-950 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      <div>
                        <p className="font-bold">
                          {l.condition} • {l.finish} • {l.language}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Stock: {l.stock}
                        </p>
                      </div>
                      <span className="font-display text-sm font-extrabold text-crimson-400">
                        {formatARS(l.price_ars)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                {selected.compare_at_price_ars &&
                  selected.compare_at_price_ars > selected.price_ars && (
                    <span className="block text-sm text-slate-500 line-through">
                      {formatARS(selected.compare_at_price_ars)}
                    </span>
                  )}
                <p className="font-display text-3xl font-black text-white sm:text-4xl">
                  {formatARS(selected.price_ars)}
                </p>
                {transferPrice !== null &&
                  settings.transfer_discount_percent > 0 && (
                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      {formatARS(transferPrice)} pagando por Transferencia (
                      {settings.transfer_discount_percent}% OFF)
                    </p>
                  )}
              </div>

              <div className="text-right text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Stock disponible: {selected.stock}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] sm:gap-3 sm:text-xs">
              <div className="rounded-xl bg-obsidian-950 p-2.5 sm:p-3">
                <span className="block text-slate-400">Condición</span>
                <span className="mt-0.5 block font-bold text-white">
                  {CONDITION_LABELS[selected.condition] || selected.condition}
                </span>
              </div>
              <div className="rounded-xl bg-obsidian-950 p-2.5 sm:p-3">
                <span className="block text-slate-400">Acabado</span>
                <span className="mt-0.5 block font-bold text-white">
                  {selected.finish}
                </span>
              </div>
              <div className="rounded-xl bg-obsidian-950 p-2.5 sm:p-3">
                <span className="block text-slate-400">Idioma</span>
                <span className="mt-0.5 block font-bold text-white">
                  {selected.language}
                </span>
              </div>
            </div>

            {selected.custom_description && (
              <div className="rounded-xl border border-white/5 bg-obsidian-900/70 p-4 text-sm leading-relaxed text-slate-300">
                {selected.custom_description}
              </div>
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
                  onClick={() => setQty((q) => Math.min(selected.stock, q + 1))}
                  className="px-2 text-lg text-slate-300 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-crimson-scale py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-crimson transition hover:brightness-110"
              >
                <ShoppingBag className="h-4 w-4" />
                Agregar al Carrito
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-crimson-500" />
              <span>
                Se envía protegida con penny sleeve + toploader rígido.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-7 rounded-3xl border border-dashed border-white/15 bg-obsidian-850 p-7">
            <h2 className="font-display text-xl font-bold text-white">
              Carta sin stock disponible actualmente
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Esta carta pertenece al catálogo oficial de{" "}
              {set?.name || card.set_id}, pero por el momento no tiene unidades
              habilitadas a la venta.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsapp_number,
                  `Hola! Quería consultar disponibilidad o encargar la carta ${card.name} (#${card.local_id} - ${set?.name || card.set_id}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600/20 px-5 py-2.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-600/30"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar disponibilidad por WhatsApp
              </a>
              <Link
                href={`/expansiones/${card.set_id}`}
                className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white hover:border-crimson-500"
              >
                Ver otras cartas de {set?.name || card.set_id}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
