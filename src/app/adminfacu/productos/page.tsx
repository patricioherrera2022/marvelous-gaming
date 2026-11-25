"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Edit3, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { AdminShell } from "../AdminShell";
import { formatARS } from "@/lib/format";
import type { Product, ProductDepartment } from "@/types";

interface ProductFormState {
  id?: string;
  department: ProductDepartment;
  category: string;
  platform: string;
  title: string;
  description: string;
  price_ars: number;
  compare_at_price_ars: string;
  stock: number;
  condition: "Nuevo" | "Usado";
  format: "Físico" | "Digital" | "N/A";
  imageUrl: string;
  is_active: boolean;
  is_featured: boolean;
}

const EMPTY_FORM: ProductFormState = {
  department: "tcg_sealed",
  category: "Elite Trainer Box",
  platform: "Pokémon TCG",
  title: "",
  description: "",
  price_ars: 0,
  compare_at_price_ars: "",
  stock: 1,
  condition: "Nuevo",
  format: "Físico",
  imageUrl: "",
  is_active: true,
  is_featured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState<"ALL" | ProductDepartment>(
    "ALL"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "No se pudo subir la imagen.");
        return;
      }
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch {
      setUploadError("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      department: p.department,
      category: p.category,
      platform: p.platform || "",
      title: p.title,
      description: p.description,
      price_ars: p.price_ars,
      compare_at_price_ars:
        p.compare_at_price_ars != null ? String(p.compare_at_price_ars) : "",
      stock: p.stock,
      condition: p.condition,
      format: p.format,
      imageUrl: p.images[0] || "",
      is_active: p.is_active,
      is_featured: p.is_featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          department: form.department,
          category: form.category,
          platform: form.platform || null,
          title: form.title,
          description: form.description,
          price_ars: Number(form.price_ars) || 0,
          compare_at_price_ars: form.compare_at_price_ars.trim()
            ? Number(form.compare_at_price_ars)
            : null,
          stock: Number(form.stock) || 0,
          condition: form.condition,
          format: form.format,
          images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
          is_active: form.is_active,
          is_featured: form.is_featured,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        await loadProducts();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Product) => {
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, is_active: !p.is_active }),
    });
    await loadProducts();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await loadProducts();
  };

  const visible = products.filter(
    (p) => deptFilter === "ALL" || p.department === deptFilter
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-black text-white">
              Sellados TCG, Juegos PS4/PS5 y Accesorios
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Cargá cajas, sobres, joysticks y videojuegos físicos o digitales.
            </p>
          </div>

          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-crimson-scale px-5 py-2.5 text-xs font-bold text-white shadow-crimson transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "Todos" },
            { id: "tcg_sealed", label: "Sellados TCG" },
            { id: "games", label: "Juegos PS4 / PS5" },
            { id: "accessories", label: "Accesorios" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setDeptFilter(tab.id as "ALL" | ProductDepartment)
              }
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${deptFilter === tab.id
                  ? "bg-crimson-scale text-white shadow-crimson"
                  : "border border-white/10 bg-obsidian-850 text-slate-300 hover:text-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-obsidian-850 p-4"
              >
                <div className="flex gap-3.5">
                  <img
                    src={p.images[0] || "/images/marvelous-logo.jpg"}
                    alt={p.title}
                    className="h-20 w-20 shrink-0 rounded-xl bg-obsidian-950 object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-crimson-400">
                        {p.category} {p.platform ? `• ${p.platform}` : ""}
                      </span>
                      <button
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${p.is_active
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white/10 text-slate-400"
                          }`}
                      >
                        {p.is_active ? "Activo" : "Oculto"}
                      </button>
                    </div>
                    <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold text-white">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        {formatARS(p.price_ars)}
                      </span>
                      <span className="text-slate-400">Stock: {p.stock}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-white/5 pt-3 text-xs">
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 font-semibold text-slate-200 hover:bg-white/10"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-crimson-950/50 px-3 py-1.5 font-semibold text-crimson-300 hover:bg-crimson-900/60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-obsidian-850 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-display text-xl font-black text-white">
                {form.id ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Departamento
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department: e.target.value as ProductDepartment,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  >
                    <option value="tcg_sealed">Sellado Pokémon TCG</option>
                    <option value="games">Juegos PS4 / PS5</option>
                    <option value="accessories">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Plataforma
                  </label>
                  <input
                    type="text"
                    value={form.platform}
                    onChange={(e) =>
                      setForm({ ...form, platform: e.target.value })
                    }
                    placeholder="Pokémon TCG / PS5 / PS4 / Universal"
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Título *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Categoría *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="ETB / Booster Box / Joysticks / Acción"
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Precio ARS *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.price_ars}
                    onChange={(e) =>
                      setForm({ ...form, price_ars: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Precio anterior
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.compare_at_price_ars}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        compare_at_price_ars: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
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
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Estado
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        condition: e.target.value as "Nuevo" | "Usado",
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado">Usado</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Formato
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        format: e.target.value as "Físico" | "Digital" | "N/A",
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  >
                    <option value="Físico">Físico</option>
                    <option value="Digital">Digital</option>
                    <option value="N/A">No aplica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Imagen del producto (Subir foto o pegar URL)
                </label>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="/images/expansion-151.jpg o URL externa"
                    className="flex-1 rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-crimson-500/40 bg-crimson-950/40 px-3.5 py-2.5 text-xs font-bold text-crimson-200 transition hover:bg-crimson-900/50">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{uploading ? "Subiendo..." : "Subir foto"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadError && (
                  <p className="mt-1 text-[11px] text-crimson-400">
                    {uploadError}
                  </p>
                )}
                {form.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian-950 p-2">
                    <img
                      src={form.imageUrl}
                      alt="Vista previa"
                      className="h-12 w-12 rounded-lg object-contain"
                    />
                    <span className="truncate text-[11px] text-slate-400">
                      {form.imageUrl}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
                />
              </div>

              <div className="flex gap-5 text-xs">
                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="h-4 w-4 accent-crimson-600"
                  />
                  Activo en tienda
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-amber-300">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm({ ...form, is_featured: e.target.checked })
                    }
                    className="h-4 w-4 accent-amber-500"
                  />
                  Destacado
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-crimson-scale px-6 py-2 text-xs font-bold text-white shadow-crimson"
                >
                  {saving ? "Guardando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
