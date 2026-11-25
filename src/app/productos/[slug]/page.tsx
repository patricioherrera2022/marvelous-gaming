import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getStoreSettings } from "@/lib/repository";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetailClient product={product} settings={settings} />
    </div>
  );
}
