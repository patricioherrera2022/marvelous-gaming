import { NextResponse } from "next/server";
import { getOrders, updateOrder } from "@/lib/repository";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, order_status, payment_status, tracking_code } = body;
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }
    const order = await updateOrder(id, {
      order_status,
      payment_status,
      tracking_code,
    });
    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
