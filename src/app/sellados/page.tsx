import React from "react";
import { getProducts } from "@/lib/repository";
import { ProductsCatalogClient } from "@/components/store/ProductsCatalogClient";
import { MotionReveal } from "@/components/motion/MotionReveal";

export const dynamic = "force-dynamic";

export default async function SealedPage() {
  const allProducts = await getProducts({ onlyActive: true });
  const sealed = allProducts.filter(
    (p) =>
      p.department === "tcg_sealed" ||
      (p.department === "accessories" && p.platform === "Universal")
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <MotionReveal className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
          Productos Oficiales
        </span>
        <h1 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
          Sellados Pokémon TCG y Protección
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Elite Trainer Boxes, Booster Boxes, Booster Packs individuales,
          sleeves y toploaders para cuidar tu colección.
        </p>
      </MotionReveal>

      <ProductsCatalogClient
        products={sealed}
        emptyMessage="No hay productos sellados disponibles con ese filtro."
      />
    </div>
  );
}
