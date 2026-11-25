"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExpansionCard } from "./ExpansionCard";
import type { TcgSeriesWithSets } from "@/types";

export function HomeExpansionsExplorer({
  series,
}: {
  series: TcgSeriesWithSets[];
}) {
  const nonEmptySeries = useMemo(
    () => series.filter((s) => s.sets.length > 0 && s.id !== "tcgp"),
    [series]
  );

  const defaultSeriesId =
    nonEmptySeries.find((s) => s.id === "sv")?.id ||
    nonEmptySeries[0]?.id ||
    "sv";

  const [selectedId, setSelectedId] = useState(defaultSeriesId);

  const activeSeries = useMemo(
    () => nonEmptySeries.find((s) => s.id === selectedId) || nonEmptySeries[0],
    [nonEmptySeries, selectedId]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {nonEmptySeries.slice(0, 10).map((serie) => {
          const isActive = serie.id === activeSeries?.id;
          return (
            <button
              key={serie.id}
              onClick={() => setSelectedId(serie.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                isActive
                  ? "bg-crimson-scale text-white shadow-crimson"
                  : "border border-white/10 bg-obsidian-850 text-slate-300 hover:border-crimson-500/50 hover:text-white"
              }`}
            >
              {serie.name}
              <span className="ml-1.5 text-[11px] opacity-75">
                ({serie.sets.length})
              </span>
            </button>
          );
        })}
        <Link
          href="/expansiones"
          className="inline-flex items-center gap-1.5 rounded-full border border-crimson-500/40 bg-crimson-950/40 px-4 py-2 text-xs font-semibold text-crimson-300 transition hover:bg-crimson-900/50 sm:text-sm"
        >
          Ver todas las Eras
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {activeSeries && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeSeries.sets.slice(0, 8).map((set) => (
            <ExpansionCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}
