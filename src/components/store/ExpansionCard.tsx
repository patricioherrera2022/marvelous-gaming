"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { TiltCard } from "@/components/motion/TiltCard";
import type { TcgSet } from "@/types";

export function ExpansionCard({ set }: { set: TcgSet }) {
  const [logoError, setLogoError] = useState(false);
  const [symbolError, setSymbolError] = useState(false);

  const activeCount = set.active_listings_count || 0;

  return (
    <TiltCard maxTilt={5} className="h-full">
      <Link
        href={`/expansiones/${set.id}`}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-obsidian-850 p-4 transition duration-300 hover:border-crimson-500/60 hover:bg-obsidian-800 hover:shadow-crimson"
      >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {set.id}
        </span>

        {activeCount > 0 ? (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
            {activeCount} en venta
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-500">
            Catálogo
          </span>
        )}
      </div>

      <div className="my-4 flex h-24 items-center justify-center rounded-xl bg-obsidian-950/70 p-3">
        {set.logo_url && !logoError ? (
          <img
            src={set.logo_url}
            alt={set.name}
            loading="lazy"
            onError={() => setLogoError(true)}
            className="max-h-20 w-auto object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Layers className="mb-1 h-6 w-6 text-crimson-500" />
            <span className="font-display text-sm font-bold text-white">
              {set.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          {set.symbol_url && !symbolError && (
            <img
              src={set.symbol_url}
              alt=""
              loading="lazy"
              onError={() => setSymbolError(true)}
              className="h-5 w-5 shrink-0 object-contain invert-[0.05]"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-bold text-white group-hover:text-crimson-400">
              {set.name}
            </h3>
            <p className="truncate text-[11px] text-slate-400">
              {set.total_count || set.official_count || "?"} cartas
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-crimson-400" />
      </div>
    </Link>
    </TiltCard>
  );
}
