"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  RotateCw,
  RefreshCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  FlipHorizontal2,
} from "lucide-react";
import type { CardFinish, CardLanguage } from "@/types";

export type CardBackStyle =
  | "international"
  | "jp_modern"
  | "jp_vintage"
  | "gold_special";

const BACK_STYLE_OPTIONS: Array<{
  id: CardBackStyle;
  label: string;
  badge: string;
}> = [
  { id: "international", label: "Internacional", badge: "EN / ES" },
  { id: "jp_modern", label: "Japonés Moderno", badge: "JP" },
  { id: "jp_vintage", label: "Japonés Vintage", badge: "96" },
  { id: "gold_special", label: "Dorado 24K", badge: "GOLD" },
];

export function detectDefaultBackStyle(
  language?: CardLanguage,
  setId?: string
): CardBackStyle {
  const sid = (setId || "").toLowerCase();
  if (
    sid.includes("30th") ||
    sid.includes("cel25") ||
    sid.includes("gold") ||
    sid === "sv08.5"
  ) {
    return "gold_special";
  }
  if (language === "JP") {
    if (
      sid.startsWith("base") ||
      sid.startsWith("gym") ||
      sid.startsWith("neo")
    ) {
      return "jp_vintage";
    }
    return "jp_modern";
  }
  return "international";
}

function PokemonCardBackFace({ styleType }: { styleType: CardBackStyle }) {
  if (styleType === "gold_special") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[18px] border-[5px] border-amber-300 bg-gradient-to-br from-amber-700 via-yellow-500 to-amber-900 p-3 shadow-inner">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.65), transparent 45%), repeating-linear-gradient(45deg, rgba(127,29,29,0.22) 0px, rgba(127,29,29,0.22) 8px, transparent 8px, transparent 16px)",
          }}
        />
        <div className="relative flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-950/75 via-amber-900/55 to-amber-950/85 p-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-200">
            GOLD EDITION
          </span>
          <svg viewBox="0 0 120 120" className="h-28 w-28 drop-shadow-xl">
            <defs>
              <linearGradient id="goldBall" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="url(#goldBall)"
              stroke="#FEF9C3"
              strokeWidth="4"
            />
            <path
              d="M8 60 A52 52 0 0 1 112 60 Z"
              fill="#991B1B"
              opacity="0.88"
            />
            <line
              x1="8"
              y1="60"
              x2="112"
              y2="60"
              stroke="#FEF08A"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="15"
              fill="#FEF9C3"
              stroke="#78350F"
              strokeWidth="4"
            />
            <circle cx="60" cy="60" r="7" fill="#DC2626" />
          </svg>
          <div>
            <p className="font-display text-sm font-black tracking-widest text-amber-100">
              POKÉMON TCG
            </p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-amber-300/80">
              SPECIAL FOIL BACK
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (styleType === "jp_vintage") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[18px] border-[5px] border-amber-200 bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-900 p-3">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.2) 0deg 10deg, transparent 10deg 20deg)",
          }}
        />
        <div className="relative flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-amber-100/70 bg-amber-950/45 p-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-100">
            POCKET MONSTERS
          </span>
          <svg viewBox="0 0 120 120" className="h-28 w-28 drop-shadow-lg">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="#FEF3C7"
              stroke="#451A03"
              strokeWidth="5"
            />
            <path d="M10 60 A50 50 0 0 1 110 60 Z" fill="#DC2626" />
            <line
              x1="10"
              y1="60"
              x2="110"
              y2="60"
              stroke="#451A03"
              strokeWidth="7"
            />
            <circle
              cx="60"
              cy="60"
              r="14"
              fill="#FEF3C7"
              stroke="#451A03"
              strokeWidth="5"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">
            CARD GAME • 1996
          </span>
        </div>
      </div>
    );
  }

  if (styleType === "jp_modern") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[18px] border-[5px] border-amber-300 bg-gradient-to-br from-blue-950 via-indigo-900 to-amber-700 p-3">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.45), transparent 65%), repeating-conic-gradient(from 0deg at 50% 50%, rgba(251,191,36,0.16) 0deg 8deg, transparent 8deg 18deg)",
          }}
        />
        <div className="relative flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-amber-300/75 bg-slate-950/35 p-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
            POKÉMON CARD GAME
          </span>
          <svg viewBox="0 0 120 120" className="h-28 w-28 drop-shadow-xl">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#FCD34D"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="#E2E8F0"
              stroke="#0F172A"
              strokeWidth="4"
            />
            <path d="M18 60 A42 42 0 0 1 102 60 Z" fill="#B91C1C" />
            <line
              x1="18"
              y1="60"
              x2="102"
              y2="60"
              stroke="#0F172A"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="12"
              fill="#F8FAFC"
              stroke="#0F172A"
              strokeWidth="4"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">
            JAPANESE EDITION
          </span>
        </div>
      </div>
    );
  }

  // International classic blue swirl back
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[18px] border-[5px] border-blue-400/80 bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-950 p-3">
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(56,189,248,0.45), transparent 50%), radial-gradient(circle at 75% 75%, rgba(99,102,241,0.45), transparent 50%)",
        }}
      />
      <div className="relative flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-amber-300/70 bg-blue-950/35 p-4 text-center">
        <span className="font-display text-sm font-black tracking-[0.22em] text-amber-300 drop-shadow">
          POKÉMON
        </span>
        <svg viewBox="0 0 120 120" className="h-28 w-28 drop-shadow-2xl">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="#F8FAFC"
            stroke="#0F172A"
            strokeWidth="5"
          />
          <path d="M10 60 A50 50 0 0 1 110 60 Z" fill="#EF4444" />
          <line
            x1="10"
            y1="60"
            x2="110"
            y2="60"
            stroke="#0F172A"
            strokeWidth="7"
          />
          <circle
            cx="60"
            cy="60"
            r="14"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="5"
          />
        </svg>
        <span className="font-display text-xs font-extrabold tracking-[0.2em] text-amber-300/90">
          TRADING CARD GAME
        </span>
      </div>
    </div>
  );
}

export function CardInspector3D({
  imageUrl,
  cardName,
  finish = "Holo",
  language = "EN",
  setId = "",
  discount,
}: {
  imageUrl: string;
  cardName: string;
  finish?: CardFinish;
  language?: CardLanguage;
  setId?: string;
  discount?: number | null;
}) {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [backStyle, setBackStyle] = useState<CardBackStyle>(() =>
    detectDefaultBackStyle(language, setId)
  );

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startRotX: number;
    startRotY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  useEffect(() => {
    setBackStyle(detectDefaultBackStyle(language, setId));
  }, [language, setId]);

  useEffect(() => {
    if (!autoSpin || isDragging) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotY((prev) => prev + dt * 42);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoSpin, isDragging]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    if (zoom > 1.35 && e.shiftKey) {
      setPan({
        x: Math.max(-140, Math.min(140, dragStartRef.current.startPanX + dx)),
        y: Math.max(-180, Math.min(180, dragStartRef.current.startPanY + dy)),
      });
      return;
    }

    setRotY(dragStartRef.current.startRotY + dx * 0.55);
    setRotX(
      Math.max(-42, Math.min(42, dragStartRef.current.startRotX - dy * 0.4))
    );
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => {
      const next = Math.max(1, Math.min(2.6, Number((z + delta).toFixed(2))));
      if (next <= 1.05) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const flipCard = () => {
    setAutoSpin(false);
    setRotY((prev) => {
      const normalized = ((prev % 360) + 360) % 360;
      const isShowingBack = normalized > 90 && normalized < 270;
      return isShowingBack ? prev + (360 - normalized) : prev + (180 - normalized);
    });
    setRotX(0);
  };

  const resetView = () => {
    setAutoSpin(false);
    setRotX(0);
    setRotY(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const glareX = 50 + Math.sin((rotY * Math.PI) / 180) * 35;
  const glareY = 50 - (rotX / 45) * 35;
  const isHolo = finish !== "Normal";
  const isGraded = finish === "Graded";

  const renderStage = (tall: boolean) => (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={`relative flex select-none items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-obsidian-850 via-obsidian-950 to-obsidian-900 ${
        tall ? "h-[72vh] w-full" : "h-[480px] sm:h-[530px]"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ perspective: "1200px", touchAction: "none" }}
    >
      {/* Ambient radial light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(220,38,38,0.22), transparent 55%)`,
        }}
      />

      {discount && (
        <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-crimson-scale px-3 py-1 text-xs font-bold text-white shadow-crimson">
          -{discount}% OFF
        </span>
      )}

      <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">
        Arrastrá para girar 360° • Rueda: Zoom
      </div>

      {/* Zoom + Pan Container */}
      <div
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transition: isDragging ? "none" : "transform 0.25s ease-out",
        }}
      >
        {/* 3D Card Container */}
        <div
          className={`relative aspect-[63/88] ${
            tall ? "w-[290px] sm:w-[340px]" : "w-[250px] sm:w-[290px]"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition:
              isDragging || autoSpin ? "none" : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* FRONT FACE */}
          <div
            className={`absolute inset-0 overflow-hidden rounded-[18px] bg-obsidian-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ${
              isGraded ? "ring-4 ring-sky-300/70 p-2 bg-slate-900" : ""
            }`}
            style={{ backfaceVisibility: "hidden" }}
          >
            {isGraded && (
              <div className="mb-1.5 flex items-center justify-between rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-sky-200">
                <span>MG GRADED SLAB</span>
                <span>GEM 10</span>
              </div>
            )}
            <img
              src={imgError ? "/images/pikachu.png" : imageUrl}
              alt={cardName}
              draggable={false}
              onError={() => setImgError(true)}
              className="h-full w-full rounded-[14px] object-contain"
            />

            {/* Dynamic Holo / Glare Shader */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity"
              style={{
                opacity: isHolo ? 0.65 : 0.25,
                background: isHolo
                  ? `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.55) 0%, rgba(239,68,68,0.22) 24%, rgba(56,189,248,0.24) 48%, rgba(250,204,21,0.18) 70%, transparent 85%)`
                  : `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, transparent 55%)`,
              }}
            />
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 rounded-[18px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <PokemonCardBackFace styleType={backStyle} />
            <div
              className="pointer-events-none absolute inset-0 rounded-[18px] mix-blend-screen"
              style={{
                opacity: 0.35,
                background: `radial-gradient(circle at ${100 - glareX}% ${glareY}%, rgba(255,255,255,0.45), transparent 60%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-obsidian-850 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={flipCard}
            className="inline-flex items-center gap-1.5 rounded-xl bg-crimson-scale px-3 py-2 text-xs font-bold text-white shadow-crimson transition hover:brightness-110"
          >
            <FlipHorizontal2 className="h-3.5 w-3.5" />
            Voltear 180°
          </button>

          <button
            type="button"
            onClick={() => setAutoSpin((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              autoSpin
                ? "border-crimson-500 bg-crimson-950/50 text-crimson-200"
                : "border-white/10 bg-obsidian-950 text-slate-300 hover:text-white"
            }`}
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${autoSpin ? "animate-spin" : ""}`}
            />
            {autoSpin ? "Pausar giro" : "Auto-girar"}
          </button>

          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
            className="rounded-lg border border-white/10 bg-obsidian-950 p-2 text-slate-300 hover:text-white"
            aria-label="Alejar zoom"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[44px] text-center font-mono text-xs font-bold text-white">
            {zoom.toFixed(1)}x
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.6, Number((z + 0.25).toFixed(2))))}
            className="rounded-lg border border-white/10 bg-obsidian-950 p-2 text-slate-300 hover:text-white"
            aria-label="Acercar zoom"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            className="ml-1 rounded-lg border border-white/10 bg-obsidian-950 p-2 text-slate-300 hover:border-crimson-500 hover:text-white"
            aria-label="Pantalla completa"
          >
            {fullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Back Style Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5 text-[11px]">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
          <Sparkles className="h-3 w-3 text-crimson-400" />
          Dorso de carta:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BACK_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBackStyle(opt.id)}
              className={`rounded-full px-2.5 py-1 font-semibold transition ${
                backStyle === opt.id
                  ? "bg-crimson-600/25 text-white ring-1 ring-crimson-500/60"
                  : "bg-obsidian-950 text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}{" "}
              <span className="ml-1 opacity-70">({opt.badge})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {renderStage(false)}
        {renderControls()}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center bg-black/90 p-4 backdrop-blur-lg sm:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-3">
            {renderStage(true)}
            {renderControls()}
          </div>
        </div>
      )}
    </>
  );
}
