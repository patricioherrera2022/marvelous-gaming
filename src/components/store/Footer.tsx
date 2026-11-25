import React from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Truck, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/format";
import type { StoreSettings, TcgSeriesWithSets } from "@/types";

export function Footer({
  settings,
  series,
}: {
  settings: StoreSettings;
  series: TcgSeriesWithSets[];
}) {
  // Show key eras and their top expansions cleanly in the footer
  const featuredSeries = series.filter((s) =>
    ["me", "sv", "swsh", "sm", "xy", "base"].includes(s.id)
  );

  return (
    <footer className="no-print border-t border-white/10 bg-obsidian-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/images/marvelous-logo.jpg"
                alt="Marvelous Gaming"
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/15"
              />
              <div>
                <p className="font-display text-lg font-bold text-white">
                  MARVELOUS <span className="text-crimson-500">GAMING</span>
                </p>
                <p className="text-xs text-slate-400">
                  Tienda especializada en Pokémon TCG y Gaming
                </p>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Cartas sueltas originales de todas las expansiones de Pokémon TCG,
              productos sellados de fábrica y próximamente juegos y accesorios
              PS4 / PS5.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian-850 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-crimson-500" />
                100% Originales
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian-850 px-3 py-1.5">
                <CreditCard className="h-3.5 w-3.5 text-crimson-500" />
                Mercado Pago &amp; Transf.
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian-850 px-3 py-1.5">
                <Truck className="h-3.5 w-3.5 text-crimson-500" />
                Envíos a todo el país
              </span>
            </div>
            <div className="mt-5">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsapp_number,
                  "Hola Marvelous Gaming! Quiero hacer una consulta."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600/20 px-4 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/40 transition hover:bg-emerald-600/30"
              >
                <MessageCircle className="h-4 w-4" />
                Escribinos por WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Navegación
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-crimson-400">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/expansiones" className="hover:text-crimson-400">
                  Todas las Expansiones
                </Link>
              </li>
              <li>
                <Link href="/cartas" className="hover:text-crimson-400">
                  Cartas Sueltas
                </Link>
              </li>
              <li>
                <Link href="/sellados" className="hover:text-crimson-400">
                  Sellados Pokémon TCG
                </Link>
              </li>
              <li>
                <Link href="/juegos" className="hover:text-crimson-400">
                  PS4 / PS5 y Accesorios
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-crimson-400">
                  Contacto y Envíos
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Índice de Expansiones Pokémon TCG
              </h4>
              <Link
                href="/expansiones"
                className="text-xs font-semibold text-crimson-400 hover:text-crimson-300"
              >
                Ver las {series.reduce((acc, s) => acc + s.sets.length, 0)}+
                expansiones →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {featuredSeries.map((serie) => (
                <div key={serie.id}>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-crimson-400">
                    {serie.name}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {serie.sets.slice(0, 5).map((st) => (
                      <li key={st.id}>
                        <Link
                          href={`/expansiones/${st.id}`}
                          className="line-clamp-1 hover:text-white"
                        >
                          {st.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.store_name}. Todos los
            derechos reservados.
          </p>
          <p>
            Imágenes y datos de referencia de Pokémon TCG provistos por TCGdex.
          </p>
        </div>
      </div>
    </footer>
  );
}
