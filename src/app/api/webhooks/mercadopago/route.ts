import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { updateOrder } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const topic = body?.type || url.searchParams.get("topic") || url.searchParams.get("type");
    const dataId = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (topic === "payment" && dataId && mpToken) {
      const mpClient = new MercadoPagoConfig({ accessToken: mpToken });
      const paymentClient = new Payment(mpClient);
      const payment = await paymentClient.get({ id: String(dataId) });

      if (payment.external_reference) {
        const isApproved = payment.status === "approved";
        const isRejected =
          payment.status === "rejected" || payment.status === "cancelled";

        await updateOrder(payment.external_reference, {
          mp_payment_id: String(payment.id || dataId),
          payment_status: isApproved
            ? "paid"
            : isRejected
            ? "failed"
            : "pending",
          order_status: isApproved ? "confirmed" : undefined,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
