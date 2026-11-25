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
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-obsidian-850 p-3 transition duration-300 hover:border-crimson-500/60 hover:bg-obsidian-800 hover:shadow-crimson sm:p-4"
      >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:px-2.5 sm:text-[11px]">
          {set.id}
        </span>

        {activeCount > 0 ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30 sm:px-2.5 sm:text-[11px]">
            {activeCount} en venta
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500 sm:px-2.5 sm:text-[11px]">
            Catálogo
          </span>
        )}
      </div>

      <div className="my-2.5 flex h-16 items-center justify-center rounded-xl bg-obsidian-950/70 p-2 sm:my-4 sm:h-24 sm:p-3">
        {set.logo_url && !logoError ? (
          <img
            src={set.logo_url}
            alt={set.name}
            loading="lazy"
            onError={() => setLogoError(true)}
            className="max-h-12 w-auto object-contain transition duration-300 group-hover:scale-105 sm:max-h-20"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Layers className="mb-1 h-5 w-5 text-crimson-500 sm:h-6 sm:w-6" />
            <span className="line-clamp-2 font-display text-xs font-bold text-white sm:text-sm">
              {set.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2.5 sm:pt-3">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {set.symbol_url && !symbolError && (
            <img
              src={set.symbol_url}
              alt=""
              loading="lazy"
              onError={() => setSymbolError(true)}
              className="h-4 w-4 shrink-0 object-contain invert-[0.05] sm:h-5 sm:w-5"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate font-display text-xs font-bold text-white group-hover:text-crimson-400 sm:text-sm">
              {set.name}
            </h3>
            <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
              {set.total_count || set.official_count || "?"} cartas
            </p>
          </div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-crimson-400 sm:h-4 sm:w-4" />
      </div>
    </Link>
    </TiltCard>
  );
}
