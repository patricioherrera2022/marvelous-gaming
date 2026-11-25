import React from "react";
import { notFound } from "next/navigation";
import { getOrderById, getStoreSettings } from "@/lib/repository";
import { PurchaseTicketView } from "@/components/print/PurchaseTicketView";

export const dynamic = "force-dynamic";

export default async function AdminOrderTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrderById(id),
    getStoreSettings(),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <PurchaseTicketView
      order={order}
      settings={settings}
      backHref="/adminfacu/pedidos"
    />
  );
}
