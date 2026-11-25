import { NextResponse } from "next/server";
import { getSetCatalog } from "@/lib/repository";

export async function GET(
  request: Request,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await context.params;
    const url = new URL(request.url);
    const includeAll = url.searchParams.get("all") === "1";

    const data = await getSetCatalog(setId);
    if (!data) {
      return NextResponse.json(
        { error: "Expansión no encontrada" },
        { status: 404 }
      );
    }

    const cards = includeAll
      ? data.cards
      : data.cards.filter((c) =>
          c.listings.some((l) => l.is_active && l.stock > 0)
        );

    return NextResponse.json({
      set: data.set,
      cards,
      totalInSet: data.cards.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
