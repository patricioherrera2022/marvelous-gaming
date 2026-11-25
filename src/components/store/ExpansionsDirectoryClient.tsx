"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ExpansionCard } from "./ExpansionCard";
import type { TcgSeriesWithSets } from "@/types";

export function ExpansionsDirectoryClient({
  series,
}: {
  series: TcgSeriesWithSets[];
}) {
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [onlyWithStock, setOnlyWithStock] = useState(false);

  const visibleSeries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return series
      .filter((s) => selectedSeries === "all" || s.id === selectedSeries)
      .map((s) => ({
        ...s,
        sets: s.sets.filter((st) => {
          if (onlyWithStock && (st.active_listings_count || 0) === 0)
            return false;
          if (!q) return true;
          return (
            st.name.toLowerCase().includes(q) ||
            st.id.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((s) => s.sets.length > 0);
  }, [series, selectedSeries, search, onlyWithStock]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar expansión (ej: 151, Surging Sparks, Evolving Skies...)"
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 py-2.5 pl-10 pr-4 text-base text-white placeholder-slate-500 outline-none focus:border-crimson-500 sm:text-sm"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-obsidian-950 px-4 py-2.5 text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={onlyWithStock}
              onChange={(e) => setOnlyWithStock(e.target.checked)}
              className="h-4 w-4 accent-crimson-600"
            />
            Solo expansiones con cartas en venta
          </label>
        </div>

        <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            onClick={() => setSelectedSeries("all")}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedSeries === "all"
                ? "bg-crimson-scale text-white shadow-crimson"
                : "bg-obsidian-950 text-slate-300 hover:text-white"
            }`}
          >
            Todas las Eras
          </button>
          {series.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeries(s.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedSeries === s.id
                  ? "bg-crimson-scale text-white shadow-crimson"
                  : "bg-obsidian-950 text-slate-300 hover:text-white"
              }`}
            >
              {s.name} ({s.sets.length})
            </button>
          ))}
        </div>
      </div>

      {visibleSeries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-12 text-center text-sm text-slate-400">
          No encontramos expansiones con esos filtros.
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {visibleSeries.map((serie) => (
            <section key={serie.id}>
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 sm:mb-5">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-1.5 rounded-full bg-crimson-scale" />
                  <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                    {serie.name}
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {serie.sets.length} expansiones
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {serie.sets.map((set) => (
                  <ExpansionCard key={set.id} set={set} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
