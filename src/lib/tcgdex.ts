import type { TcgCard, TcgSeriesWithSets, TcgSet } from "@/types";

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en";

export const SERIES_ORDER = [
  "me",
  "sv",
  "swsh",
  "sm",
  "xy",
  "bw",
  "col",
  "hgss",
  "pl",
  "dp",
  "ex",
  "ecard",
  "lc",
  "neo",
  "gym",
  "base",
  "pop",
  "mc",
  "tk",
  "misc",
  "tcgp",
];

export function formatSetLogo(logo?: string | null): string | null {
  if (!logo) return null;
  if (logo.endsWith(".webp") || logo.endsWith(".png")) return logo;
  return `${logo}.webp`;
}

export function formatSetSymbol(symbol?: string | null): string | null {
  if (!symbol) return null;
  if (symbol.endsWith(".webp") || symbol.endsWith(".png")) return symbol;
  return `${symbol}.webp`;
}

export function formatCardImage(
  imageBase?: string | null,
  quality: "low" | "high" = "low"
): string | null {
  if (!imageBase) return null;
  if (imageBase.endsWith(".webp") || imageBase.endsWith(".png")) {
    return imageBase;
  }
  return `${imageBase}/${quality}.webp`;
}

interface RawSerieBrief {
  id: string;
  name: string;
  logo?: string;
}

interface RawSetBrief {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: {
    official?: number;
    total?: number;
  };
}

interface RawSerieDetail extends RawSerieBrief {
  sets?: RawSetBrief[];
}

interface RawSetDetail {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  releaseDate?: string;
  serie?: { id: string; name: string };
  cardCount?: { official?: number; total?: number };
  cards?: Array<{
    id: string;
    localId: string;
    name: string;
    image?: string;
  }>;
}

interface RawCardDetail {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  category?: string;
  hp?: number;
  types?: string[];
  illustrator?: string;
  variants?: Record<string, boolean>;
  set?: {
    id: string;
    name: string;
    logo?: string;
    symbol?: string;
  };
}

let cachedSeries: { data: TcgSeriesWithSets[]; expiresAt: number } | null = null;
const setCache = new Map<
  string,
  { set: TcgSet; cards: TcgCard[]; expiresAt: number }
>();

export function clearTcgdexMemoryCache() {
  cachedSeries = null;
  setCache.clear();
}

async function fetchTcgdex<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${TCGDEX_BASE}${endpoint}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`TCGdex error ${res.status} on ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

export async function getAllSeriesWithSets(): Promise<TcgSeriesWithSets[]> {
  if (cachedSeries && cachedSeries.expiresAt > Date.now()) {
    return cachedSeries.data;
  }

  const seriesList = await fetchTcgdex<RawSerieBrief[]>("/series");
  const details = await Promise.all(
    seriesList.map((s) =>
      fetchTcgdex<RawSerieDetail>(`/series/${encodeURIComponent(s.id)}`).catch(
        () => ({ ...s, sets: [] }) as RawSerieDetail
      )
    )
  );

  const normalized: TcgSeriesWithSets[] = details.map((serie) => {
    const orderIdx = SERIES_ORDER.indexOf(serie.id);
    const sets: TcgSet[] = (serie.sets || [])
      .map((st) => ({
        id: st.id,
        series_id: serie.id,
        series_name: serie.name,
        name: st.name,
        logo_url: formatSetLogo(st.logo),
        symbol_url: formatSetSymbol(st.symbol),
        release_date: null,
        official_count: st.cardCount?.official ?? 0,
        total_count: st.cardCount?.total ?? 0,
      }))
      .reverse();

    return {
      id: serie.id,
      name: serie.name,
      logo_url: formatSetLogo(serie.logo),
      sort_order: orderIdx === -1 ? 999 : orderIdx,
      sets,
    };
  });

  normalized.sort((a, b) => a.sort_order - b.sort_order);

  cachedSeries = {
    data: normalized,
    expiresAt: Date.now() + 1000 * 60 * 30,
  };
  return normalized;
}

export async function getSetWithCards(
  setId: string
): Promise<{ set: TcgSet; cards: TcgCard[] } | null> {
  const existing = setCache.get(setId);
  if (existing && existing.expiresAt > Date.now()) {
    return { set: existing.set, cards: existing.cards };
  }

  try {
    const raw = await fetchTcgdex<RawSetDetail>(
      `/sets/${encodeURIComponent(setId)}`
    );
    const set: TcgSet = {
      id: raw.id,
      series_id: raw.serie?.id || "misc",
      series_name: raw.serie?.name || "Expansión",
      name: raw.name,
      logo_url: formatSetLogo(raw.logo),
      symbol_url: formatSetSymbol(raw.symbol),
      release_date: raw.releaseDate || null,
      official_count: raw.cardCount?.official ?? 0,
      total_count: raw.cardCount?.total ?? 0,
    };

    const cards: TcgCard[] = (raw.cards || []).map((c) => ({
      id: c.id,
      set_id: raw.id,
      set_name: raw.name,
      set_symbol_url: set.symbol_url,
      set_logo_url: set.logo_url,
      local_id: String(c.localId || ""),
      name: c.name,
      image_base: c.image || null,
    }));

    setCache.set(setId, {
      set,
      cards,
      expiresAt: Date.now() + 1000 * 60 * 30,
    });
    return { set, cards };
  } catch {
    return null;
  }
}

export async function getCardDetail(cardId: string): Promise<TcgCard | null> {
  try {
    const raw = await fetchTcgdex<RawCardDetail>(
      `/cards/${encodeURIComponent(cardId)}`
    );
    return {
      id: raw.id,
      set_id: raw.set?.id || cardId.split("-")[0] || "",
      set_name: raw.set?.name || "",
      set_logo_url: formatSetLogo(raw.set?.logo),
      set_symbol_url: formatSetSymbol(raw.set?.symbol),
      local_id: String(raw.localId || ""),
      name: raw.name,
      image_base: raw.image || null,
      rarity: raw.rarity || null,
      category: raw.category || null,
      hp: typeof raw.hp === "number" ? raw.hp : null,
      types: Array.isArray(raw.types) ? raw.types : [],
      illustrator: raw.illustrator || null,
      variants: raw.variants || {},
    };
  } catch {
    return null;
  }
}

export async function searchCardsFromApi(
  query: string,
  limit = 60
): Promise<TcgCard[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  try {
    const raw = await fetchTcgdex<
      Array<{ id: string; localId: string; name: string; image?: string }>
    >(`/cards?name=${encodeURIComponent(trimmed)}`);

    return (raw || []).slice(0, limit).map((c) => {
      const setId = c.id.includes("-") ? c.id.split("-")[0] : "";
      return {
        id: c.id,
        set_id: setId,
        local_id: String(c.localId || ""),
        name: c.name,
        image_base: c.image || null,
      };
    });
  } catch {
    return [];
  }
}
