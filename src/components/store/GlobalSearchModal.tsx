"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { formatARS } from "@/lib/format";
import type { Product, TcgCard, CardListing, TcgSet } from "@/types";

interface SearchResponse {
  sets: TcgSet[];
  cards: Array<{ card: TcgCard; listing: CardListing }>;
  products: Product[];
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({
    sets: [],
    cards: [],
    products: [],
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ sets: [], cards: [], products: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = (await res.json()) as SearchResponse;
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results.sets.length > 0 ||
    results.cards.length > 0 ||
    results.products.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-3 pt-4 backdrop-blur-md sm:px-4 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-obsidian-850 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5 sm:py-4">
          <Search className="h-5 w-5 shrink-0 text-crimson-500" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá cartas, expansiones, ETB o juegos..."
            className="w-full bg-transparent text-base text-white placeholder-slate-400 outline-none"
          />
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-crimson-400" />
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar buscador"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75dvh] overflow-y-auto p-4 sm:max-h-[65vh] sm:p-5">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Sparkles className="mb-3 h-8 w-8 text-crimson-500" />
              <p className="text-sm font-medium text-white">
                Buscador instantáneo Marvelous Gaming
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Escribí el nombre de una carta, número (#006), expansión o producto.
              </p>
            </div>
          ) : !loading && !hasResults ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No encontramos resultados activos para &ldquo;{query}&rdquo;. Probá explorar todas las{" "}
              <Link
                href="/expansiones"
                onClick={onClose}
                className="text-crimson-400 underline"
              >
                expansiones
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-6">
              {results.sets.length > 0 && (
                <div>
                  <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Expansiones Pokémon TCG
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {results.sets.map((st) => (
                      <Link
                        key={st.id}
                        href={`/expansiones/${st.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-obsidian-800/70 px-3.5 py-2.5 transition hover:border-crimson-500/60"
                      >
                        <div className="flex items-center gap-3">
                          {st.symbol_url && (
                            <img
                              src={st.symbol_url}
                              alt=""
                              className="h-6 w-6 object-contain"
                            />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {st.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {st.series_name}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                          {st.active_listings_count || 0} en stock
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.cards.length > 0 && (
                <div>
                  <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cartas Sueltas Disponibles
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {results.cards.map(({ card, listing }) => (
                      <Link
                        key={listing.id}
                        href={`/cartas/${card.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian-800/70 p-2.5 transition hover:border-crimson-500/60"
                      >
                        <img
                          src={
                            card.image_base
                              ? `${card.image_base}/low.webp`
                              : "/images/pikachu.png"
                          }
                          alt={card.name}
                          className="h-14 w-10 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {card.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {card.set_name || card.set_id} • #{card.local_id} •{" "}
                            {listing.condition}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-crimson-400">
                          {formatARS(listing.price_ars)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length > 0 && (
                <div>
                  <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sellados, Juegos y Accesorios
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {results.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/productos/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian-800/70 p-2.5 transition hover:border-crimson-500/60"
                      >
                        <img
                          src={p.images[0] || "/images/marvelous-logo.jpg"}
                          alt={p.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {p.category} {p.platform ? `• ${p.platform}` : ""}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-crimson-400">
                          {formatARS(p.price_ars)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
