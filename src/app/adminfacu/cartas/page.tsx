"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AdminShell } from "../AdminShell";
import { formatARS } from "@/lib/format";
import type {
  CardCondition,
  CardFinish,
  CardLanguage,
  CardListing,
  TcgCard,
  TcgSeriesWithSets,
} from "@/types";

interface AdminCardItem {
  card: TcgCard;
  listings: CardListing[];
}

interface EditorState {
  card: TcgCard;
  listingId?: string;
  price_ars: number;
  compare_at_price_ars: string;
  stock: number;
  condition: CardCondition;
  finish: CardFinish;
  language: CardLanguage;
  custom_description: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function AdminCardsPage() {
  const [series, setSeries] = useState<TcgSeriesWithSets[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("ALL");
  const [selectedSetId, setSelectedSetId] = useState("sv03.5");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminCardItem[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 36;

  const loadSeries = useCallback(async () => {
    const r = await fetch("/api/catalog/series");
    const d = await r.json();
    setSeries(d.series || []);
  }, []);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const availableSets = useMemo(() => {
    if (selectedSeriesId === "ALL") {
      return series.flatMap((s) => s.sets);
    }
    return series.find((s) => s.id === selectedSeriesId)?.sets || [];
  }, [series, selectedSeriesId]);

  const activeSetObj = useMemo(
    () =>
      series.flatMap((s) => s.sets).find((st) => st.id === selectedSetId) ||
      null,
    [series, selectedSetId]
  );

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSetId && selectedSetId !== "GLOBAL") {
        params.set("setId", selectedSetId);
      }
      if (query.trim()) {
        params.set("q", query.trim());
      }
      params.set("status", statusFilter);

      const res = await fetch(`/api/admin/cards?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, [selectedSetId, query, statusFilter]);

  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => {
      loadCards();
    }, 220);
    return () => clearTimeout(t);
  }, [loadCards]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const handleQuickToggle = async (item: AdminCardItem) => {
    setSavingId(item.card.id);
    try {
      const existing = item.listings[0];
      if (existing) {
        const res = await fetch("/api/admin/cards/listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...existing,
            is_active: !existing.is_active,
          }),
        });
        if (res.ok) {
          showToast(
            !existing.is_active
              ? `${item.card.name} habilitada a la venta.`
              : `${item.card.name} ocultada de la tienda.`
          );
          await Promise.all([loadCards(), loadSeries()]);
        }
      } else {
        // Open modal prefilled when enabling for the first time
        openEditor(item.card);
      }
    } finally {
      setSavingId(null);
    }
  };

  const openEditor = (card: TcgCard, listing?: CardListing) => {
    setEditor({
      card,
      listingId: listing?.id,
      price_ars: listing?.price_ars ?? 5000,
      compare_at_price_ars:
        listing?.compare_at_price_ars != null
          ? String(listing.compare_at_price_ars)
          : "",
      stock: listing?.stock ?? 1,
      condition: listing?.condition ?? "NM",
      finish: listing?.finish ?? "Normal",
      language: listing?.language ?? "EN",
      custom_description: listing?.custom_description ?? "",
      is_active: listing?.is_active ?? true,
      is_featured: listing?.is_featured ?? false,
    });
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    setSavingId(editor.card.id);
    try {
      const res = await fetch("/api/admin/cards/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editor.listingId,
          card_id: editor.card.id,
          set_id: editor.card.set_id,
          price_ars: Number(editor.price_ars) || 0,
          compare_at_price_ars: editor.compare_at_price_ars.trim()
            ? Number(editor.compare_at_price_ars)
            : null,
          stock: Number(editor.stock) || 0,
          condition: editor.condition,
          finish: editor.finish,
          language: editor.language,
          custom_description: editor.custom_description,
          is_active: editor.is_active,
          is_featured: editor.is_featured,
        }),
      });
      if (res.ok) {
        setEditor(null);
        showToast(`Guardado: ${editor.card.name}`);
        await Promise.all([loadCards(), loadSeries()]);
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    await fetch(`/api/admin/cards/listing?id=${encodeURIComponent(listingId)}`, {
      method: "DELETE",
    });
    showToast("Publicación eliminada.");
    await Promise.all([loadCards(), loadSeries()]);
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginatedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-black text-white">
              Gestor de Cartas Pokémon TCG
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Buscá entre todas las expansiones y habilitá cartas
              individualmente con su precio ARS, stock, condición y descripción.
            </p>
          </div>
          {activeSetObj?.logo_url && selectedSetId !== "GLOBAL" && (
            <img
              src={activeSetObj.logo_url}
              alt={activeSetObj.name}
              className="h-12 w-auto object-contain"
            />
          )}
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-obsidian-850 px-4 py-3 text-xs font-bold text-emerald-300 shadow-2xl">
            <Check className="h-4 w-4" />
            {toast}
          </div>
        )}

        {/* Filter Bar */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-obsidian-850 p-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-400">
              Serie / Era
            </label>
            <select
              value={selectedSeriesId}
              onChange={(e) => {
                const sid = e.target.value;
                setSelectedSeriesId(sid);
                const sets =
                  sid === "ALL"
                    ? series.flatMap((s) => s.sets)
                    : series.find((s) => s.id === sid)?.sets || [];
                if (sets[0]) setSelectedSetId(sets[0].id);
              }}
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
            >
              <option value="ALL">Todas las Series</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.sets.length})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-400">
              Expansión
            </label>
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
            >
              <option value="GLOBAL">
                🌐 Búsqueda Global (Todas las expansiones)
              </option>
              {availableSets.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.id}) — {st.active_listings_count || 0} activas
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-400">
              Buscar carta
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: Charizard, 006..."
                className="w-full rounded-xl border border-white/10 bg-obsidian-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-crimson-500"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-400">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "inactive"
                )
              }
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-crimson-500"
            >
              <option value="all">Todas</option>
              <option value="active">En venta</option>
              <option value="inactive">Sin habilitar</option>
            </select>
          </div>
        </div>

        {/* Cards List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-10 text-center text-sm text-slate-400">
            No encontramos cartas con esa búsqueda. Si elegiste Búsqueda Global,
            escribí un nombre (ej: &ldquo;Pikachu&rdquo;) o seleccioná una
            expansión.
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedItems.map((item) => {
              const { card, listings } = item;
              const hasActive = listings.some((l) => l.is_active);
              const primary = listings[0];
              const thumb = card.image_base
                ? `${card.image_base}/low.webp`
                : "/images/pikachu.png";

              return (
                <div
                  key={card.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                    hasActive
                      ? "border-emerald-500/40 bg-obsidian-850"
                      : "border-white/10 bg-obsidian-850/60"
                  }`}
                >
                  <div className="flex gap-3.5">
                    <img
                      src={thumb}
                      alt={card.name}
                      loading="lazy"
                      className="h-28 w-20 shrink-0 rounded-lg bg-obsidian-950 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {card.set_id} • #{card.local_id}
                          </span>
                          <h3 className="truncate font-display text-base font-bold text-white">
                            {card.name}
                          </h3>
                        </div>

                        <button
                          onClick={() => handleQuickToggle(item)}
                          disabled={savingId === card.id}
                          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                            hasActive
                              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30"
                              : "bg-white/10 text-slate-300 hover:bg-crimson-600 hover:text-white"
                          }`}
                        >
                          {hasActive ? "En venta" : "Habilitar"}
                        </button>
                      </div>

                      {listings.length > 0 ? (
                        <div className="mt-2.5 space-y-1.5">
                          {listings.map((l) => (
                            <div
                              key={l.id}
                              className="flex items-center justify-between rounded-lg bg-obsidian-950 px-2.5 py-1.5 text-xs"
                            >
                              <div className="min-w-0">
                                <span
                                  className={`font-bold ${
                                    l.is_active
                                      ? "text-white"
                                      : "text-slate-500 line-through"
                                  }`}
                                >
                                  {formatARS(l.price_ars)}
                                </span>
                                <span className="ml-2 text-[11px] text-slate-400">
                                  {l.condition} • {l.finish} • {l.language} (x
                                  {l.stock})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditor(card, l)}
                                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                                  title="Editar"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteListing(l.id)}
                                  className="rounded p-1 text-slate-400 hover:bg-crimson-950 hover:text-crimson-400"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-slate-500">
                          Aún no configurada para la venta.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <button
                      onClick={() => openEditor(card, primary)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-400 hover:text-crimson-300"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {primary ? "Editar precio y detalle" : "Configurar y publicar"}
                    </button>

                    {listings.length > 0 && (
                      <button
                        onClick={() => openEditor(card)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar variante
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-obsidian-850 px-4 py-3 text-xs">
              <span className="text-slate-400">
                Página {page} de {totalPages} ({items.length} cartas)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-white/10 bg-obsidian-950 px-3 py-1.5 font-semibold text-white disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-white/10 bg-obsidian-950 px-3 py-1.5 font-semibold text-white disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Modal Editor */}
      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-obsidian-850 p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    editor.card.image_base
                      ? `${editor.card.image_base}/low.webp`
                      : "/images/pikachu.png"
                  }
                  alt={editor.card.name}
                  className="h-16 w-12 rounded object-contain"
                />
                <div>
                  <span className="text-xs font-mono text-crimson-400">
                    {editor.card.set_id} • #{editor.card.local_id}
                  </span>
                  <h2 className="font-display text-xl font-black text-white">
                    {editor.card.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setEditor(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Precio ARS *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={editor.price_ars}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        price_ars: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-sm text-white outline-none focus:border-crimson-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Precio anterior (oferta)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editor.compare_at_price_ars}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        compare_at_price_ars: e.target.value,
                      })
                    }
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-sm text-white outline-none focus:border-crimson-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Stock *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={editor.stock}
                    onChange={(e) =>
                      setEditor({ ...editor, stock: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-sm text-white outline-none focus:border-crimson-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Condición
                  </label>
                  <select
                    value={editor.condition}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        condition: e.target.value as CardCondition,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  >
                    <option value="NM">NM (Near Mint)</option>
                    <option value="LP">LP (Lightly Played)</option>
                    <option value="MP">MP (Moderately Played)</option>
                    <option value="HP">HP (Heavily Played)</option>
                    <option value="DMG">DMG (Damaged)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Acabado
                  </label>
                  <select
                    value={editor.finish}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        finish: e.target.value as CardFinish,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Holo">Holo</option>
                    <option value="Reverse Holo">Reverse Holo</option>
                    <option value="Full Art">Full Art</option>
                    <option value="1st Edition">1st Edition</option>
                    <option value="Graded">Graded</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Idioma
                  </label>
                  <select
                    value={editor.language}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        language: e.target.value as CardLanguage,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  >
                    <option value="EN">Inglés (EN)</option>
                    <option value="ES">Español (ES)</option>
                    <option value="JP">Japonés (JP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Descripción personalizada
                </label>
                <textarea
                  rows={3}
                  value={editor.custom_description}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      custom_description: e.target.value,
                    })
                  }
                  placeholder="Detalle del estado, centrado, si incluye toploader, etc."
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                />
              </div>

              <div className="flex flex-wrap gap-5 pt-1 text-xs">
                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={editor.is_active}
                    onChange={(e) =>
                      setEditor({ ...editor, is_active: e.target.checked })
                    }
                    className="h-4 w-4 accent-crimson-600"
                  />
                  Habilitada a la venta en la tienda
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-amber-300">
                  <input
                    type="checkbox"
                    checked={editor.is_featured}
                    onChange={(e) =>
                      setEditor({ ...editor, is_featured: e.target.checked })
                    }
                    className="h-4 w-4 accent-amber-500"
                  />
                  <Sparkles className="h-3.5 w-3.5" />
                  Destacar en portada
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setEditor(null)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingId === editor.card.id}
                  className="rounded-xl bg-crimson-scale px-6 py-2.5 text-xs font-bold text-white shadow-crimson transition hover:brightness-110"
                >
                  Guardar Carta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
