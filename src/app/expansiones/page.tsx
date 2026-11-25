import React from "react";
import { getSeriesWithSetsAndCounts } from "@/lib/repository";
import { ExpansionsDirectoryClient } from "@/components/store/ExpansionsDirectoryClient";
import { MotionReveal } from "@/components/motion/MotionReveal";

export const dynamic = "force-dynamic";

export default async function ExpansionsPage() {
  const series = await getSeriesWithSetsAndCounts();
  const totalSets = series.reduce((sum, s) => sum + s.sets.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <MotionReveal className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
          Pokémon TCG
        </span>
        <h1 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
          Todas las Expansiones ({totalSets})
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Explorá todas las series históricas y modernas de Pokémon TCG con su
          logo oficial. Entrá a cualquier expansión para ver sus cartas en
          stock o consultar el set completo.
        </p>
      </MotionReveal>

      <ExpansionsDirectoryClient series={series} />
    </div>
  );
}
