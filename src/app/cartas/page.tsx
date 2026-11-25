import React from "react";
import Link from "next/link";
import { getActiveListingsWithCards } from "@/lib/repository";
import { ActiveCardsClient } from "@/components/store/ActiveCardsClient";

export const dynamic = "force-dynamic";

export default async function ActiveCardsPage() {
  const items = await getActiveListingsWithCards();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
            Singles Pokémon TCG
          </span>
          <h1 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
            Cartas Sueltas en Venta ({items.length})
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Todas las cartas sueltas disponibles para compra inmediata, con su
            condición, idioma y acabado verificados.
          </p>
        </div>
        <Link
          href="/expansiones"
          className="text-sm font-semibold text-crimson-400 hover:text-crimson-300"
        >
          Explorar por Expansión →
        </Link>
      </div>

      <ActiveCardsClient items={items} />
    </div>
  );
}
