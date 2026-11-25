"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PokemonCardTile } from "./PokemonCardTile";
import type { EnrichedCardListing } from "@/lib/repository";

export function ActiveCardsClient({
  items,
}: {
  items: EnrichedCardListing[];
}) {
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("ALL");
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">(
    "featured"
  );

  const uniqueSets = useMemo(() => {
    const map = new Map<string, string>();
    for (const { card } of items) {
      map.set(card.set_id, card.set_name || card.set_id);
    }
    return Array.from(map.entries());
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = items.filter(({ card, listing }) => {
      if (setFilter !== "ALL" && card.set_id !== setFilter) return false;
      if (conditionFilter !== "ALL" && listing.condition !== conditionFilter)
        return false;
      if (languageFilter !== "ALL" && listing.language !== languageFilter)
        return false;
      if (!q) return true;
      return (
        card.name.toLowerCase().includes(q) ||
        card.local_id.toLowerCase().includes(q) ||
        (card.set_name || "").toLowerCase().includes(q)
      );
    });

    if (sortBy === "price_asc") {
      return [...list].sort(
        (a, b) => a.listing.price_ars - b.listing.price_ars
      );
    }
    if (sortBy === "price_desc") {
      return [...list].sort(
        (a, b) => b.listing.price_ars - a.listing.price_ars
      );
    }
    return [...list].sort(
      (a, b) => Number(b.listing.is_featured) - Number(a.listing.is_featured)
    );
  }, [items, search, setFilter, conditionFilter, languageFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-obsidian-850 p-4 md:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar carta por nombre, # o expansión..."
            className="w-full rounded-xl border border-white/10 bg-obsidian-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-crimson-500"
          />
        </div>

        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
        >
          <option value="ALL">Expansión: Todas</option>
          {uniqueSets.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
        >
          <option value="ALL">Condición: Todas</option>
          <option value="NM">NM</option>
          <option value="LP">LP</option>
          <option value="MP">MP</option>
          <option value="HP">HP</option>
        </select>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
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
            setSortBy(
              e.target.value as "featured" | "price_asc" | "price_desc"
            )
          }
          className="rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
        >
          <option value="featured">Destacadas primero</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-12 text-center text-sm text-slate-400">
          No encontramos cartas en stock con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(({ card, listing }) => (
            <PokemonCardTile key={listing.id} card={card} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
