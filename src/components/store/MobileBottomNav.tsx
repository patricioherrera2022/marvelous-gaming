"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Package, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "./CartContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/expansiones", label: "Expansiones", icon: Layers },
    { href: "/cartas", label: "Cartas", icon: Sparkles },
    { href: "/sellados", label: "Sellados", icon: Package },
  ];

  return (
    <nav
      aria-label="Navegación rápida móvil"
      className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-obsidian-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-5 items-center">
        {links.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition ${
                active ? "text-crimson-400" : "text-slate-400 active:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? "text-crimson-500" : "text-slate-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-slate-300 active:text-white"
          aria-label="Abrir carrito"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 text-crimson-400" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-crimson-600 px-1 text-[9px] font-black text-white">
                {itemCount}
              </span>
            )}
          </div>
          <span>Carrito</span>
        </button>
      </div>
    </nav>
  );
}
