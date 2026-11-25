import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get("order") || "";
    if (!orderNumber.trim()) {
      return NextResponse.json(
        { error: "Número de pedido requerido" },
        { status: 400 }
      );
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        order_number: order.order_number,
        buyer_name: order.buyer_name,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        shipping_method: order.shipping_method,
        subtotal_ars: order.subtotal_ars,
        discount_ars: order.discount_ars,
        shipping_ars: order.shipping_ars,
        total_ars: order.total_ars,
        items: order.items,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
