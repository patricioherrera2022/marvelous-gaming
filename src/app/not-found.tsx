import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Sparkles } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-crimson-500/40 bg-crimson-950/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-crimson-300">
        <Sparkles className="h-3.5 w-3.5" />
        Error 404
      </div>

      <h1 className="mt-5 font-display text-4xl font-black text-white sm:text-5xl">
        Carta o página no encontrada
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-400">
        El enlace que buscaste no existe o fue movido. Podés volver al inicio o
        explorar todas las expansiones de Pokémon TCG.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-obsidian-850 px-6 py-3 text-sm font-semibold text-white transition hover:border-crimson-500/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
        <Link
          href="/expansiones"
          className="inline-flex items-center gap-2 rounded-full bg-crimson-scale px-6 py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110"
        >
          <Layers className="h-4 w-4" />
          Explorar Expansiones
        </Link>
      </div>
    </div>
  );
}
