"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Package, Sparkles } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

export function HeroParallax({
  totalExpansions,
}: {
  totalExpansions: number;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 50, y: 40 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yLeft = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -35]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current || reduced) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-b border-white/10 bg-obsidian-950 py-10 sm:py-16 lg:py-20"
    >
      {/* Parallax Animated Background Grid & Crimson Glow */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { scale: bgScale }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, rgba(220, 38, 38, 0.22), transparent 65%)`,
          }}
        />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-crimson-700/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-crimson-500/15 blur-3xl" />
      </motion.div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left Copy */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-crimson-500/40 bg-crimson-950/50 px-3 py-1 text-[11px] font-semibold text-crimson-300 backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-crimson-400" />
            +{totalExpansions} Expansiones Pokémon TCG • Inspector 3D en vivo
          </div>

          <h1 className="mt-4 font-display text-3xl font-black leading-[1.08] tracking-tight text-white sm:mt-5 sm:text-5xl lg:text-6xl">
            Tu universo{" "}
            <span className="inline-block bg-gradient-to-r from-red-400 via-crimson-500 to-crimson-600 bg-clip-text text-transparent">
              Pokémon TCG
            </span>{" "}
            y Gaming en un solo lugar.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">
            Inspeccioná cartas sueltas en 3D con zoom, explorá todas las
            expansiones con sus logos oficiales, productos sellados y muy
            pronto juegos de PS4, PS5 y accesorios.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/expansiones"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-crimson-scale px-6 py-3.5 text-sm font-bold text-white shadow-crimson transition hover:scale-[1.03] hover:brightness-110"
            >
              <Layers className="h-4 w-4" />
              Explorar Expansiones
            </Link>
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:gap-3">
              <Link
                href="/cartas"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-obsidian-850/90 px-4 py-3 text-xs font-semibold text-white backdrop-blur transition hover:border-crimson-500/60 sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Cartas en Venta
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
              <Link
                href="/sellados"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-obsidian-850/90 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur transition hover:border-crimson-500/60 hover:text-white sm:px-6 sm:py-3.5 sm:text-sm"
              >
                <Package className="h-3.5 w-3.5 text-crimson-400 sm:h-4 sm:w-4" />
                Sellados TCG
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Parallax Floating Card Showcase */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto max-w-md rounded-3xl border border-white/10 bg-obsidian-850/85 p-4 shadow-card backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-crimson-600/20 px-3 py-1 text-[11px] font-semibold text-crimson-300 sm:text-xs">
                Colección Destacada 3D
              </span>
              <img
                src="https://assets.tcgdex.net/en/sv/sv03.5/logo.webp"
                alt="Scarlet & Violet 151"
                className="h-7 w-auto object-contain sm:h-8"
              />
            </div>

            <div className="relative my-4 flex h-52 items-center justify-center sm:my-6 sm:h-64">
              {/* Left Card Parallax Layer */}
              <motion.div
                style={reduced ? undefined : { y: yLeft }}
                className="absolute left-2 sm:left-5"
              >
                <motion.div
                  animate={
                    reduced
                      ? undefined
                      : { y: [0, -7, 0], rotate: [-8, -6, -8] }
                  }
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Link href="/cartas/base1-4">
                    <img
                      src="https://assets.tcgdex.net/en/base/base1/4/low.webp"
                      alt="Charizard Base Set"
                      className="h-36 w-auto rounded-xl border border-white/15 shadow-2xl transition hover:scale-105 sm:h-44"
                    />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Center Hero Card Parallax Layer */}
              <motion.div
                style={reduced ? undefined : { y: yCenter }}
                className="relative z-10"
              >
                <motion.div
                  animate={reduced ? undefined : { y: [0, -10, 0] }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Link href="/cartas/sv03.5-006">
                    <img
                      src="https://assets.tcgdex.net/en/sv/sv03.5/006/low.webp"
                      alt="Charizard ex 151"
                      className="h-44 w-auto rounded-xl border border-crimson-500/40 shadow-[0_20px_50px_rgba(220,38,38,0.35)] transition hover:scale-105 sm:h-56"
                    />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Card Parallax Layer */}
              <motion.div
                style={reduced ? undefined : { y: yRight }}
                className="absolute right-2 sm:right-5"
              >
                <motion.div
                  animate={
                    reduced
                      ? undefined
                      : { y: [0, -6, 0], rotate: [8, 6, 8] }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Link href="/cartas/sv08-238">
                    <img
                      src="https://assets.tcgdex.net/en/sv/sv08/238/low.webp"
                      alt="Pikachu ex Surging Sparks"
                      className="h-36 w-auto rounded-xl border border-white/15 shadow-2xl transition hover:scale-105 sm:h-44"
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300">
              <span>Tocá cualquier carta para girarla en 3D</span>
              <Link
                href="/expansiones/sv03.5"
                className="font-bold text-crimson-400 hover:text-crimson-300"
              >
                Ir a 151 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
