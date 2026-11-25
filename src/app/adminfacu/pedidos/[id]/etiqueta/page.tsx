import React from "react";
import { notFound } from "next/navigation";
import { getOrderById, getStoreSettings } from "@/lib/repository";
import { ShippingLabelView } from "@/components/print/ShippingLabelView";

export const dynamic = "force-dynamic";

export default async function AdminOrderLabelPage({
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
    <ShippingLabelView
      order={order}
      settings={settings}
      backHref="/adminfacu/pedidos"
    />
  );
}
