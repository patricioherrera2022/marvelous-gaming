import { NextResponse } from "next/server";
import {
  getActiveListingsWithCards,
  getProducts,
  getSeriesWithSetsAndCounts,
  getStoreSettings,
} from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    if (!q) {
      return NextResponse.json({ sets: [], cards: [], products: [] });
    }

    const [series, activeCards, products, settings] = await Promise.all([
      getSeriesWithSetsAndCounts(),
      getActiveListingsWithCards(),
      getProducts({ onlyActive: true }),
      getStoreSettings(),
    ]);

    const matchingSets = series
      .flatMap((s) => s.sets)
      .filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.id.toLowerCase().includes(q) ||
          st.series_name.toLowerCase().includes(q)
      )
      .slice(0, 8);

    const matchingCards = activeCards
      .filter(
        ({ card, listing }) =>
          card.name.toLowerCase().includes(q) ||
          card.local_id.toLowerCase().includes(q) ||
          (card.set_name || "").toLowerCase().includes(q) ||
          listing.custom_description.toLowerCase().includes(q)
      )
      .slice(0, 12);

    const matchingProducts = products
      .filter((p) => {
        if (
          settings.games_coming_soon &&
          (p.department === "games" || p.department === "accessories")
        ) {
          return p.department === "accessories" && p.platform === "Universal";
        }
        return true;
      })
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.platform || "").toLowerCase().includes(q)
      )
      .slice(0, 8);

    return NextResponse.json({
      sets: matchingSets,
      cards: matchingCards,
      products: matchingProducts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
