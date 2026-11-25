import React from "react";
import Link from "next/link";
import { Clock, Gamepad2, MessageCircle } from "lucide-react";
import { getProducts, getStoreSettings } from "@/lib/repository";
import { ProductsCatalogClient } from "@/components/store/ProductsCatalogClient";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { buildWhatsAppUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const [settings, allProducts] = await Promise.all([
    getStoreSettings(),
    getProducts({ onlyActive: true }),
  ]);

  const gamingProducts = allProducts.filter(
    (p) => p.department === "games" || p.department === "accessories"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <MotionReveal className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
          PlayStation &amp; Setup
        </span>
        <h1 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
          Juegos PS4, PS5 y Accesorios
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Títulos físicos y digitales de PlayStation 4 y PlayStation 5, joysticks
          DualSense, auriculares y accesorios gamers.
        </p>
      </MotionReveal>

      {settings.games_coming_soon ? (
        <div className="rounded-3xl border border-crimson-500/30 bg-gradient-to-br from-obsidian-850 via-obsidian-900 to-crimson-950/35 p-8 sm:p-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-crimson-600/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-crimson-300 ring-1 ring-crimson-500/40">
              <Clock className="h-3.5 w-3.5" />
              Lanzamiento Próximamente
            </span>
            <div className="mt-5 flex items-center gap-3">
              <div className="rounded-2xl bg-crimson-600/15 p-3 text-crimson-400">
                <Gamepad2 className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
                Estamos preparando la sección PS4, PS5 y Accesorios
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {settings.games_coming_soon_message}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsapp_number,
                  "Hola Marvelous Gaming! Quiero consultar por juegos de PS4/PS5 o accesorios."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-crimson-scale px-6 py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar o reservar por WhatsApp
              </a>
              <Link
                href="/expansiones"
                className="rounded-full border border-white/15 bg-obsidian-850 px-6 py-3 text-sm font-semibold text-white hover:border-crimson-500/50"
              >
                Explorar Pokémon TCG mientras tanto
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ProductsCatalogClient
          products={gamingProducts}
          emptyMessage="No hay juegos o accesorios disponibles con ese filtro."
        />
      )}
    </div>
  );
}
