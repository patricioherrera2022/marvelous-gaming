import React from "react";
import { notFound } from "next/navigation";
import { getCardPageData, getStoreSettings } from "@/lib/repository";
import { CardDetailClient } from "@/components/store/CardDetailClient";

export const dynamic = "force-dynamic";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, settings] = await Promise.all([
    getCardPageData(id),
    getStoreSettings(),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CardDetailClient
        card={data.card}
        set={data.set}
        listings={data.listings}
        settings={settings}
      />
    </div>
  );
}
