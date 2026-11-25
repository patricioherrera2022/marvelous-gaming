"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "./CartContext";
import { GlobalSearchModal } from "./GlobalSearchModal";
import type { StoreSettings } from "@/types";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/expansiones", label: "Expansiones" },
  { href: "/cartas", label: "Cartas Sueltas" },
  { href: "/sellados", label: "Sellados TCG" },
  { href: "/juegos", label: "PS4 / PS5" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar({ settings }: { settings: StoreSettings }) {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {settings.promo_banner_enabled && settings.promo_banner_text && (
        <div className="no-print bg-crimson-scale px-3 py-1.5 text-center text-[11px] font-medium leading-snug tracking-wide text-white sm:px-4 sm:py-2 sm:text-sm">
          {settings.promo_banner_text}
        </div>
      )}

      <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-obsidian-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap sm:gap-3">
            <img
              src="/images/marvelous-logo.jpg"
              alt="Marvelous Gaming"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/15 sm:h-11 sm:w-11"
            />
            <div>
              <span className="block font-display text-sm font-bold tracking-tight text-white sm:text-base">
                MARVELOUS <span className="text-crimson-500">GAMING</span>
              </span>
              <span className="hidden text-[11px] uppercase tracking-widest text-slate-400 sm:block">
                Pokémon TCG &amp; Gaming Store
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${active
                      ? "bg-crimson-600/20 text-white ring-1 ring-crimson-500/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {link.label}
                  {link.href === "/juegos" && settings.games_coming_soon && (
                    <span className="ml-1.5 rounded-full bg-crimson-900/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-crimson-200">
                      Pronto
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-obsidian-800 px-3.5 py-2 text-sm text-slate-300 transition hover:border-crimson-500/50 hover:text-white"
              aria-label="Buscar cartas o productos"
            >
              <Search className="h-4 w-4 text-crimson-400" />
              <span className="hidden xl:inline">Buscar cartas...</span>
            </button>

            <button
              onClick={openCart}
              className="relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-crimson-scale px-4 py-2 text-sm font-semibold text-white shadow-crimson transition hover:brightness-110"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Carrito</span>
              <motion.span
                key={itemCount}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/40 px-1.5 text-xs font-bold"
              >
                {itemCount}
              </motion.span>
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white lg:hidden"
              aria-label="Menú"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-obsidian-900 px-4 py-4 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mb-3 flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-slate-300"
            >
              <Search className="h-4 w-4 text-crimson-400" />
              <span>Buscar cartas, expansiones o juegos...</span>
            </button>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium ${active
                        ? "bg-crimson-600/20 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <span>{link.label}</span>
                    {link.href === "/juegos" && settings.games_coming_soon && (
                      <span className="rounded-full bg-crimson-900 px-2 py-0.5 text-[10px] uppercase text-crimson-200">
                        Próximamente
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
