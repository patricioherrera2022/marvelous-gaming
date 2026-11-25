import React from "react";
import Link from "next/link";
import {
  Clock,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  getActiveListingsWithCards,
  getProducts,
  getSeriesWithSetsAndCounts,
  getStoreSettings,
} from "@/lib/repository";
import { HeroParallax } from "@/components/motion/HeroParallax";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { HomeExpansionsExplorer } from "@/components/store/HomeExpansionsExplorer";
import { PokemonCardTile } from "@/components/store/PokemonCardTile";
import { ProductTile } from "@/components/store/ProductTile";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, series, featuredCards, sealedProducts, gamesAndAccessories] =
    await Promise.all([
      getStoreSettings(),
      getSeriesWithSetsAndCounts(),
      getActiveListingsWithCards({ limit: 8 }),
      getProducts({ department: "tcg_sealed", onlyActive: true }),
      getProducts({ onlyActive: true }),
    ]);

  const gamingItems = gamesAndAccessories.filter(
    (p) => p.department === "games" || p.department === "accessories"
  );
  const totalExpansions = series.reduce((acc, s) => acc + s.sets.length, 0);

  return (
    <div>
      {/* HERO PARALLAX */}
      <HeroParallax totalExpansions={totalExpansions} />

      {/* TRUST STRIP */}
      <section className="border-b border-white/10 bg-obsidian-900/70 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-obsidian-850/70 p-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-crimson-500" />
            <div>
              <p className="font-display text-sm font-bold text-white">
                Autenticidad Garantizada
              </p>
              <p className="text-xs text-slate-400">
                Cartas verificadas y estado real detallado (NM / LP / etc.)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-obsidian-850/70 p-4">
            <Truck className="h-6 w-6 shrink-0 text-crimson-500" />
            <div>
              <p className="font-display text-sm font-bold text-white">
                Envíos Seguros a Todo el País
              </p>
              <p className="text-xs text-slate-400">
                Empaque rígido anti-doblez + seguimiento por correo o moto
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-obsidian-850/70 p-4">
            <Sparkles className="h-6 w-6 shrink-0 text-crimson-500" />
            <div>
              <p className="font-display text-sm font-bold text-white">
                {settings.transfer_discount_percent}% OFF Transferencia
              </p>
              <p className="text-xs text-slate-400">
                Pagá con Mercado Pago, transferencia bancaria o retiro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPANSIONS EXPLORER BY ERA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <MotionReveal>
          <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
                Catálogo por Expansión
              </span>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                Expansiones Pokémon TCG
              </h2>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Elegí una era y entrá directo a la expansión con su logo oficial
                para ver sus cartas disponibles.
              </p>
            </div>
            <Link
              href="/expansiones"
              className="text-sm font-semibold text-crimson-400 hover:text-crimson-300"
            >
              Ver todas las expansiones →
            </Link>
          </div>

          <HomeExpansionsExplorer series={series} />
        </MotionReveal>
      </section>

      {/* FEATURED SINGLES */}
      <section className="border-t border-white/10 bg-obsidian-900/40 py-10 sm:py-14">
        <MotionReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
                Cartas Sueltas
              </span>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                Cartas Disponibles en Stock
              </h2>
            </div>
            <Link
              href="/cartas"
              className="text-sm font-semibold text-crimson-400 hover:text-crimson-300"
            >
              Ver todo el catálogo de cartas →
            </Link>
          </div>

          {featuredCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-10 text-center text-sm text-slate-400">
              Todavía no hay cartas habilitadas a la venta.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {featuredCards.map(({ card, listing }) => (
                <PokemonCardTile
                  key={listing.id}
                  card={card}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </MotionReveal>
      </section>

      {/* SEALED TCG */}
      {sealedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <MotionReveal>
            <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
                  Sellados de Fábrica
                </span>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  ETBs, Booster Boxes y Sobres
                </h2>
              </div>
              <Link
                href="/sellados"
                className="text-sm font-semibold text-crimson-400 hover:text-crimson-300"
              >
                Ver todos los sellados →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {sealedProducts.slice(0, 4).map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          </MotionReveal>
        </section>
      )}

      {/* PS4 / PS5 & ACCESSORIES */}
      <section className="border-t border-white/10 bg-obsidian-900/40 py-10 sm:py-14">
        <MotionReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
                Gaming Consoles
              </span>
              <h2 className="mt-1 font-display text-3xl font-extrabold text-white">
                Juegos PS4, PS5 y Accesorios
              </h2>
            </div>
            <Link
              href="/juegos"
              className="text-sm font-semibold text-crimson-400 hover:text-crimson-300"
            >
              Ir a la sección Gaming →
            </Link>
          </div>

          {settings.games_coming_soon ? (
            <div className="relative overflow-hidden rounded-3xl border border-crimson-500/30 bg-gradient-to-br from-obsidian-850 via-obsidian-900 to-crimson-950/40 p-8 sm:p-10">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-crimson-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-crimson-300 ring-1 ring-crimson-500/40">
                    <Clock className="h-3.5 w-3.5" />
                    Próximamente en Marvelous Gaming
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
                    Catálogo PS4, PS5 y Accesorios Gamers en camino
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {settings.games_coming_soon_message}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-obsidian-950/70 p-4 text-crimson-400">
                    <Gamepad2 className="h-10 w-10" />
                  </div>
                  <Link
                    href="/juegos"
                    className="rounded-full bg-crimson-scale px-5 py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110"
                  >
                    Ver novedades
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {gamingItems.slice(0, 4).map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          )}
        </MotionReveal>
      </section>
    </div>
  );
}
