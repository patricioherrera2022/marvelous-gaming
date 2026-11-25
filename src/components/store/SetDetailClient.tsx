"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { PokemonCardTile } from "./PokemonCardTile";
import type { CardListing, TcgCard, TcgSet } from "@/types";

export function SetDetailClient({
  set,
  cardsWithListings,
}: {
  set: TcgSet;
  cardsWithListings: Array<{ card: TcgCard; listings: CardListing[] }>;
}) {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("ALL");
  const [finish, setFinish] = useState("ALL");
  const [language, setLanguage] = useState("ALL");
  const [sortBy, setSortBy] = useState<"number" | "price_asc" | "price_desc">(
    "number"
  );
  const [showFullSetRef, setShowFullSetRef] = useState(false);
  const [visibleRefCount, setVisibleRefCount] = useState(60);

  const activeItems = useMemo(() => {
    const flattened: Array<{ card: TcgCard; listing: CardListing }> = [];
    for (const item of cardsWithListings) {
      for (const l of item.listings) {
        if (l.is_active && l.stock > 0) {
          flattened.push({ card: item.card, listing: l });
        }
      }
    }

    const q = search.trim().toLowerCase();
    const filtered = flattened.filter(({ card, listing }) => {
      if (condition !== "ALL" && listing.condition !== condition) return false;
      if (finish !== "ALL" && listing.finish !== finish) return false;
      if (language !== "ALL" && listing.language !== language) return false;
      if (!q) return true;
      return (
        card.name.toLowerCase().includes(q) ||
        card.local_id.toLowerCase().includes(q)
      );
    });

    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.listing.price_ars - b.listing.price_ars);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.listing.price_ars - a.listing.price_ars);
    } else {
      filtered.sort((a, b) =>
        a.card.local_id.localeCompare(b.card.local_id, undefined, {
          numeric: true,
        })
      );
    }

    return filtered;
  }, [cardsWithListings, search, condition, finish, language, sortBy]);

  const allFilteredRefCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cardsWithListings.filter(({ card }) => {
      if (!q) return true;
      return (
        card.name.toLowerCase().includes(q) ||
        card.local_id.toLowerCase().includes(q)
      );
    });
  }, [cardsWithListings, search]);

  const referenceCards = useMemo(
    () => allFilteredRefCards.slice(0, visibleRefCount),
    [allFilteredRefCards, visibleRefCount]
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-obsidian-850 p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/expansiones" className="hover:text-crimson-400">
                Expansiones
              </Link>
              <span>/</span>
              <span className="text-crimson-400">{set.series_name}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              {set.symbol_url && (
                <img
                  src={set.symbol_url}
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              )}
              <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
                {set.name}
              </h1>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
                Código: {set.id.toUpperCase()}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
                Total en set: {cardsWithListings.length} cartas
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                {activeItems.length} publicaciones a la venta
              </span>
            </div>
          </div>

          {set.logo_url && (
            <img
              src={set.logo_url}
              alt={set.name}
              className="max-h-24 w-auto object-contain"
            />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar carta por nombre o #número..."
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 py-2.5 pl-10 pr-4 text-base text-white placeholder-slate-500 outline-none focus:border-crimson-500 sm:text-sm"
            />
          </div>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
          >
            <option value="ALL">Condición: Todas</option>
            <option value="NM">Near Mint (NM)</option>
            <option value="LP">Lightly Played (LP)</option>
            <option value="MP">Moderately Played (MP)</option>
            <option value="HP">Heavily Played (HP)</option>
          </select>

          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
          >
            <option value="ALL">Acabado: Todos</option>
            <option value="Normal">Normal</option>
            <option value="Holo">Holo</option>
            <option value="Reverse Holo">Reverse Holo</option>
            <option value="Full Art">Full Art</option>
            <option value="1st Edition">1st Edition</option>
            <option value="Graded">Graded</option>
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
          >
            <option value="ALL">Idioma: Todos</option>
            <option value="EN">Inglés (EN)</option>
            <option value="ES">Español (ES)</option>
            <option value="JP">Japonés (JP)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "number" | "price_asc" | "price_desc")
            }
            className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
          >
            <option value="number">Orden: # Número</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-crimson-500" />
            <span>
              Mostrando cartas habilitadas para compra inmediata en esta
              expansión.
            </span>
          </div>
          <button
            onClick={() => setShowFullSetRef((v) => !v)}
            className="font-semibold text-crimson-400 hover:text-crimson-300"
          >
            {showFullSetRef
              ? "Ocultar checklist completo del set"
              : `Ver checklist completo del set (${cardsWithListings.length})`}
          </button>
        </div>
      </div>

      {/* Active Cards for Sale */}
      {activeItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-10 text-center">
          <p className="font-display text-lg font-bold text-white">
            Actualmente no hay cartas sueltas habilitadas en {set.name}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Podés consultarnos por WhatsApp si buscás alguna carta puntual de
            esta expansión, o explorar el checklist completo abajo.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setShowFullSetRef(true)}
              className="rounded-full border border-white/15 bg-obsidian-800 px-5 py-2 text-xs font-semibold text-white hover:border-crimson-500"
            >
              Ver todas las cartas del set
            </button>
            <Link
              href="/cartas"
              className="rounded-full bg-crimson-scale px-5 py-2 text-xs font-bold text-white shadow-crimson"
            >
              Ver cartas en stock
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {activeItems.map(({ card, listing }) => (
            <PokemonCardTile key={listing.id} card={card} listing={listing} />
          ))}
        </div>
      )}

      {/* Optional Full Set Reference Checklist */}
      {showFullSetRef && (
        <section className="border-t border-white/10 pt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-white">
            Checklist de referencia: {set.name}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {referenceCards.map(({ card, listings }) => {
              const hasActive = listings.some((l) => l.is_active && l.stock > 0);
              return (
                <Link
                  key={card.id}
                  href={`/cartas/${card.id}`}
                  className={`rounded-xl border p-2.5 transition ${
                    hasActive
                      ? "border-emerald-500/40 bg-emerald-950/15 hover:border-emerald-400"
                      : "border-white/10 bg-obsidian-850/70 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={
                      card.image_base
                        ? `${card.image_base}/low.webp`
                        : "/images/pikachu.png"
                    }
                    alt={card.name}
                    loading="lazy"
                    className="mx-auto aspect-[63/88] w-full rounded object-contain"
                  />
                  <p className="mt-2 truncate text-xs font-semibold text-white">
                    {card.name}
                  </p>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>#{card.local_id}</span>
                    <span
                      className={
                        hasActive ? "font-bold text-emerald-400" : "text-slate-500"
                      }
                    >
                      {hasActive ? "En venta" : "Sin stock"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {allFilteredRefCards.length > referenceCards.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleRefCount((c) => c + 60)}
                className="rounded-full border border-white/15 bg-obsidian-850 px-6 py-2.5 text-xs font-bold text-white transition hover:border-crimson-500"
              >
                Mostrar 60 cartas más ({referenceCards.length} de{" "}
                {allFilteredRefCards.length})
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
