"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductTile } from "./ProductTile";
import type { Product } from "@/types";

export function ProductsCatalogClient({
  products,
  emptyMessage,
}: {
  products: Product[];
  emptyMessage: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.platform || "").toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-obsidian-850 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-xl border border-white/10 bg-obsidian-950 py-2.5 pl-10 pr-4 text-base text-white placeholder-slate-500 outline-none focus:border-crimson-500 sm:text-sm"
          />
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            onClick={() => setCategory("ALL")}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
              category === "ALL"
                ? "bg-crimson-scale text-white shadow-crimson"
                : "bg-obsidian-950 text-slate-300 hover:text-white"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                category === cat
                  ? "bg-crimson-scale text-white shadow-crimson"
                  : "bg-obsidian-950 text-slate-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-obsidian-850 p-12 text-center text-sm text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
