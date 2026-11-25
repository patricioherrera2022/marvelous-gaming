"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/adminfacu", label: "Resumen", icon: LayoutDashboard },
  { href: "/adminfacu/cartas", label: "Cartas Pokémon TCG", icon: Sparkles },
  { href: "/adminfacu/productos", label: "Sellados y Juegos", icon: Gamepad2 },
  { href: "/adminfacu/pedidos", label: "Pedidos y Ventas", icon: ClipboardList },
  { href: "/adminfacu/configuracion", label: "Configuración", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<{
    email: string;
    supabaseConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setAdminInfo({
            email: data.email,
            supabaseConfigured: data.supabaseConfigured,
          });
        }
      })
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/adminfacu/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-obsidian-950 text-white lg:flex-row">
      <aside className="flex w-full flex-col justify-between border-b border-white/10 bg-obsidian-900 p-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-5">
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/marvelous-logo.jpg"
                alt="Marvelous"
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/15"
              />
              <div>
                <p className="font-display text-sm font-black tracking-tight text-white">
                  MG STUDIO
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-crimson-400">
                  Panel Privado
                </span>
              </div>
            </div>
          </div>

          {adminInfo && (
            <div className="mt-4 rounded-xl border border-white/5 bg-obsidian-950 p-3 text-xs">
              <p className="truncate font-semibold text-white">
                {adminInfo.email}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${adminInfo.supabaseConfigured
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                  }`}
              >
                {adminInfo.supabaseConfigured
                  ? "Conectado a Supabase"
                  : "Modo Local + TCGdex"}
              </span>
            </div>
          )}

          <nav className="scrollbar-none mt-4 flex flex-row gap-1.5 overflow-x-auto pb-1 lg:mt-5 lg:flex-col lg:overflow-visible lg:pb-0">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/adminfacu"
                  ? pathname === "/adminfacu"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition sm:text-sm ${active
                      ? "bg-crimson-scale text-white shadow-crimson"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 lg:mt-6 lg:flex-col lg:items-stretch lg:pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-crimson-500/50 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Tienda
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-crimson-500/30 bg-crimson-950/30 px-3 py-2 text-xs font-semibold text-crimson-300 hover:bg-crimson-900/50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
