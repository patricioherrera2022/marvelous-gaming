import React from "react";
import { notFound } from "next/navigation";
import { getSetCatalog } from "@/lib/repository";
import { SetDetailClient } from "@/components/store/SetDetailClient";

export const dynamic = "force-dynamic";

export default async function ExpansionDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const data = await getSetCatalog(setId);
  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SetDetailClient set={data.set} cardsWithListings={data.cards} />
    </div>
  );
}
