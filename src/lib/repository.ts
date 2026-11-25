import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  getAllSeriesWithSets,
  getCardDetail,
  getSetWithCards,
  searchCardsFromApi,
} from "@/lib/tcgdex";
import { slugify } from "@/lib/format";
import type {
  CardCondition,
  CardFinish,
  CardLanguage,
  CardListing,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  ProductDepartment,
  StoreSettings,
  TcgCard,
  TcgSeriesWithSets,
  TcgSet,
} from "@/types";

export interface EnrichedCardListing {
  listing: CardListing;
  card: TcgCard;
}

interface LocalStoreData {
  listings: CardListing[];
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
}

const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "marvelous-gaming-data")
  : path.join(process.cwd(), "data");
const LOCAL_STORE_PATH = path.join(DATA_DIR, "local-store.json");
let memoryStoreCache: LocalStoreData | null = null;

function defaultSettings(): StoreSettings {
  const now = new Date().toISOString();
  return {
    id: 1,
    store_name: "Marvelous Gaming",
    promo_banner_enabled: true,
    promo_banner_text:
      "10% OFF pagando por Transferencia Bancaria • Cartas 100% originales • Envíos a todo el país",
    whatsapp_number: "5491100000000",
    instagram_handle: "@marvelousgaming.tcg",
    contact_email: "contacto@marvelousgaming.com",
    mercadopago_enabled: true,
    transfer_enabled: true,
    cash_enabled: true,
    transfer_discount_percent: 10,
    bank_name: "Banco / Billetera Virtual",
    bank_holder: "Marvelous Gaming",
    bank_alias: "MARVELOUS.GAMING.TCG",
    bank_cbu: "0000000000000000000000",
    free_shipping_threshold_ars: 120000,
    shipping_zones: [
      {
        id: "retiro",
        name: "Retiro en Punto de Entrega",
        description: "Coordinamos día y horario sin cargo",
        price_ars: 0,
        estimated_days: "En el día",
        enabled: true,
      },
      {
        id: "caba",
        name: "Moto Mensajería CABA",
        description: "Entrega rápida en Capital Federal",
        price_ars: 4500,
        estimated_days: "24 a 48 hs hábiles",
        enabled: true,
      },
      {
        id: "gba",
        name: "Moto / Correo GBA",
        description: "Gran Buenos Aires (1er y 2do cordón)",
        price_ars: 6800,
        estimated_days: "2 a 3 días hábiles",
        enabled: true,
      },
      {
        id: "interior",
        name: "Correo Argentino / Andreani (Todo el país)",
        description: "Envío asegurado con seguimiento",
        price_ars: 9500,
        estimated_days: "3 a 6 días hábiles",
        enabled: true,
      },
    ],
    games_coming_soon: true,
    games_coming_soon_message:
      "Muy pronto vas a encontrar juegos físicos y digitales de PS4 y PS5, joysticks DualSense, auriculares y accesorios oficiales en nuestra tienda.",
    sender_name: "Marvelous Gaming",
    sender_address: "Av. Corrientes 1234",
    sender_city: "CABA",
    sender_province: "Ciudad Autónoma de Buenos Aires",
    sender_postal_code: "1043",
    sender_cuit: "",
    andreani_enabled: true,
    correo_argentino_enabled: true,
    carrier_price_multiplier: 1,
    updated_at: now,
  };
}

function defaultLocalStore(): LocalStoreData {
  const now = new Date().toISOString();
  return {
    listings: [
      {
        id: "demo-sv035-006",
        card_id: "sv03.5-006",
        set_id: "sv03.5",
        price_ars: 32000,
        compare_at_price_ars: 38000,
        stock: 2,
        condition: "NM",
        finish: "Full Art",
        language: "EN",
        custom_description:
          "Charizard ex #006 de Scarlet & Violet 151. Recién salida de sobre, guardada en sleeve + toploader.",
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-sv035-025",
        card_id: "sv03.5-025",
        set_id: "sv03.5",
        price_ars: 4500,
        compare_at_price_ars: 5500,
        stock: 6,
        condition: "NM",
        finish: "Reverse Holo",
        language: "EN",
        custom_description:
          "Pikachu clásico de la expansión 151, ideal para coleccionistas.",
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-sv035-151",
        card_id: "sv03.5-151",
        set_id: "sv03.5",
        price_ars: 24500,
        compare_at_price_ars: 29000,
        stock: 3,
        condition: "NM",
        finish: "Holo",
        language: "EN",
        custom_description:
          "Mew ex #151 de Scarlet & Violet 151. Excelente centrado y bordes limpios.",
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-sv035-009",
        card_id: "sv03.5-009",
        set_id: "sv03.5",
        price_ars: 16500,
        compare_at_price_ars: null,
        stock: 2,
        condition: "NM",
        finish: "Holo",
        language: "EN",
        custom_description: "Blastoise ex #009 de Scarlet & Violet 151.",
        is_active: true,
        is_featured: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-sv08-238",
        card_id: "sv08-238",
        set_id: "sv08",
        price_ars: 480000,
        compare_at_price_ars: 520000,
        stock: 1,
        condition: "NM",
        finish: "Full Art",
        language: "EN",
        custom_description:
          "Pikachu ex Special Illustration Rare de Surging Sparks. Se entrega con protector magnético.",
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-swsh7-215",
        card_id: "swsh7-215",
        set_id: "swsh7",
        price_ars: 950000,
        compare_at_price_ars: null,
        stock: 1,
        condition: "NM",
        finish: "Full Art",
        language: "EN",
        custom_description:
          "Umbreon VMAX Alternate Art (Moonbreon) de Evolving Skies. Pieza de colección verificada.",
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-base1-4",
        card_id: "base1-4",
        set_id: "base1",
        price_ars: 420000,
        compare_at_price_ars: 460000,
        stock: 1,
        condition: "LP",
        finish: "Holo",
        language: "EN",
        custom_description:
          "Charizard Holo Base Set 1999 (Wizards of the Coast). Estado Lightly Played, holo en muy buen estado.",
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "demo-base1-2",
        card_id: "base1-2",
        set_id: "base1",
        price_ars: 145000,
        compare_at_price_ars: null,
        stock: 1,
        condition: "LP",
        finish: "Holo",
        language: "EN",
        custom_description: "Blastoise Holo Base Set 1999 original.",
        is_active: true,
        is_featured: false,
        created_at: now,
        updated_at: now,
      },
    ],
    products: [
      {
        id: "prod-etb-151",
        department: "tcg_sealed",
        category: "Elite Trainer Box",
        platform: "Pokémon TCG",
        title: "Elite Trainer Box - Scarlet & Violet 151",
        slug: "elite-trainer-box-scarlet-violet-151",
        description:
          "Producto sellado de fábrica. Incluye 9 booster packs de 151, carta promocional Full Art de Snorlax, sleeves, dados y caja coleccionable.",
        price_ars: 145000,
        compare_at_price_ars: 165000,
        stock: 4,
        condition: "Nuevo",
        format: "Físico",
        images: ["/images/expansion-151.jpg"],
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "prod-box-sv08",
        department: "tcg_sealed",
        category: "Booster Box",
        platform: "Pokémon TCG",
        title: "Booster Box 36 Sobres - Surging Sparks",
        slug: "booster-box-surging-sparks",
        description:
          "Display sellado con 36 sobres de 10 cartas cada uno en inglés. Sellado original con film Pokémon.",
        price_ars: 235000,
        compare_at_price_ars: 255000,
        stock: 3,
        condition: "Nuevo",
        format: "Físico",
        images: [
          "https://assets.tcgdex.net/en/sv/sv08/logo.webp",
        ],
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "prod-pack-sv035",
        department: "tcg_sealed",
        category: "Booster Pack",
        platform: "Pokémon TCG",
        title: "Sobre Individual - Scarlet & Violet 151",
        slug: "sobre-scarlet-violet-151",
        description:
          "Booster pack sellado oficial en inglés con 10 cartas + 1 energía.",
        price_ars: 14500,
        compare_at_price_ars: null,
        stock: 18,
        condition: "Nuevo",
        format: "Físico",
        images: [
          "https://assets.tcgdex.net/en/sv/sv03.5/logo.webp",
        ],
        is_active: true,
        is_featured: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: "prod-sleeves-mg",
        department: "accessories",
        category: "Protección TCG",
        platform: "Universal",
        title: "Pack 100 Sleeves + 25 Toploaders Ultra Pro",
        slug: "pack-sleeves-toploaders",
        description:
          "Combo esencial para proteger tus cartas coleccionables contra rayaduras y humedad.",
        price_ars: 18900,
        compare_at_price_ars: 22000,
        stock: 15,
        condition: "Nuevo",
        format: "N/A",
        images: ["/images/pikachu.png"],
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "prod-ps5-dualsense",
        department: "accessories",
        category: "Joysticks",
        platform: "PS5",
        title: "Joystick Sony DualSense PS5 Midnight Black",
        slug: "dualsense-ps5-midnight-black",
        description:
          "Control inalámbrico oficial DualSense para PlayStation 5 con respuesta háptica y gatillos adaptativos.",
        price_ars: 139000,
        compare_at_price_ars: 155000,
        stock: 5,
        condition: "Nuevo",
        format: "Físico",
        images: ["/images/marvelous-logo.jpg"],
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "prod-ps5-spiderman2",
        department: "games",
        category: "Acción / Aventura",
        platform: "PS5",
        title: "Marvel's Spider-Man 2 - PS5 Físico",
        slug: "marvels-spider-man-2-ps5",
        description:
          "Juego físico nuevo sellado para PlayStation 5. Idioma español latino.",
        price_ars: 92000,
        compare_at_price_ars: 105000,
        stock: 4,
        condition: "Nuevo",
        format: "Físico",
        images: ["/images/marvelous-logo.jpg"],
        is_active: true,
        is_featured: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "prod-ps4-gow",
        department: "games",
        category: "Acción / Aventura",
        platform: "PS4",
        title: "God of War Ragnarök - PS4 Físico",
        slug: "god-of-war-ragnarok-ps4",
        description:
          "Edición física para PlayStation 4 compatible con actualización a PS5.",
        price_ars: 68000,
        compare_at_price_ars: null,
        stock: 3,
        condition: "Nuevo",
        format: "Físico",
        images: ["/images/marvelous-logo.jpg"],
        is_active: true,
        is_featured: false,
        created_at: now,
        updated_at: now,
      },
    ],
    orders: [],
    settings: defaultSettings(),
  };
}

function readLocalStore(): LocalStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const initial = memoryStoreCache || defaultLocalStore();
      memoryStoreCache = initial;
      fs.writeFileSync(
        LOCAL_STORE_PATH,
        JSON.stringify(initial, null, 2),
        "utf8"
      );
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
    const normalized: LocalStoreData = {
      listings: parsed.listings || [],
      products: parsed.products || [],
      orders: parsed.orders || [],
      settings: { ...defaultSettings(), ...(parsed.settings || {}) },
    };
    memoryStoreCache = normalized;
    return normalized;
  } catch {
    if (!memoryStoreCache) {
      memoryStoreCache = defaultLocalStore();
    }
    return memoryStoreCache;
  }
}

function writeLocalStore(data: LocalStoreData) {
  memoryStoreCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Keep memoryStoreCache updated if filesystem is read-only
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) {
    return readLocalStore().settings;
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    return defaultSettings();
  }
  return {
    ...defaultSettings(),
    ...data,
    transfer_discount_percent: Number(data.transfer_discount_percent ?? 10),
    free_shipping_threshold_ars: Number(
      data.free_shipping_threshold_ars ?? 120000
    ),
    shipping_zones: Array.isArray(data.shipping_zones)
      ? data.shipping_zones
      : defaultSettings().shipping_zones,
  };
}

export async function updateStoreSettings(
  patch: Partial<StoreSettings>
): Promise<StoreSettings> {
  const cleanPatch = { ...patch, id: 1, updated_at: new Date().toISOString() };
  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    store.settings = { ...store.settings, ...cleanPatch };
    writeLocalStore(store);
    return store.settings;
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .upsert(cleanPatch, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as StoreSettings;
}

// ============================================================================
// CATALOG (SERIES, SETS, CARDS & LISTINGS)
// ============================================================================

export async function getSeriesWithSetsAndCounts(): Promise<
  TcgSeriesWithSets[]
> {
  const countsMap = new Map<string, number>();

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    for (const l of store.listings) {
      if (l.is_active && l.stock > 0) {
        countsMap.set(l.set_id, (countsMap.get(l.set_id) || 0) + 1);
      }
    }
    const series = await getAllSeriesWithSets();
    return series.map((s) => ({
      ...s,
      sets: s.sets.map((st) => ({
        ...st,
        active_listings_count: countsMap.get(st.id) || 0,
      })),
    }));
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: activeRows }, { data: dbSeries }, { data: dbSets }] =
    await Promise.all([
      supabase
        .from("card_listings")
        .select("set_id")
        .eq("is_active", true)
        .gt("stock", 0),
      supabase
        .from("tcg_series")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("tcg_sets").select("*"),
    ]);

  for (const row of activeRows || []) {
    countsMap.set(row.set_id, (countsMap.get(row.set_id) || 0) + 1);
  }

  if (dbSeries && dbSeries.length > 0 && dbSets && dbSets.length > 0) {
    const setsBySeries = new Map<string, TcgSet[]>();
    for (const st of dbSets) {
      const sid = st.series_id || "misc";
      const list = setsBySeries.get(sid) || [];
      list.push({
        id: st.id,
        series_id: sid,
        series_name: st.series_name || "",
        name: st.name,
        logo_url: st.logo_url,
        symbol_url: st.symbol_url,
        release_date: st.release_date,
        official_count: st.official_count || 0,
        total_count: st.total_count || 0,
        active_listings_count: countsMap.get(st.id) || 0,
      });
      setsBySeries.set(sid, list);
    }

    return dbSeries.map((s) => ({
      id: s.id,
      name: s.name,
      logo_url: s.logo_url,
      sort_order: s.sort_order ?? 999,
      sets: (setsBySeries.get(s.id) || []).sort((a, b) =>
        (b.release_date || "").localeCompare(a.release_date || "")
      ),
    }));
  }

  const liveSeries = await getAllSeriesWithSets();
  return liveSeries.map((s) => ({
    ...s,
    sets: s.sets.map((st) => ({
      ...st,
      active_listings_count: countsMap.get(st.id) || 0,
    })),
  }));
}

export async function getSetCatalog(setId: string): Promise<{
  set: TcgSet;
  cards: Array<{ card: TcgCard; listings: CardListing[] }>;
} | null> {
  let setObj: TcgSet | null = null;
  let cards: TcgCard[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data: dbSet } = await supabase
      .from("tcg_sets")
      .select("*")
      .eq("id", setId)
      .maybeSingle();
    const { data: dbCards } = await supabase
      .from("tcg_cards")
      .select("*")
      .eq("set_id", setId)
      .order("local_id", { ascending: true });

    if (dbSet && dbCards && dbCards.length > 0) {
      setObj = {
        id: dbSet.id,
        series_id: dbSet.series_id || "misc",
        series_name: dbSet.series_name || "",
        name: dbSet.name,
        logo_url: dbSet.logo_url,
        symbol_url: dbSet.symbol_url,
        release_date: dbSet.release_date,
        official_count: dbSet.official_count || 0,
        total_count: dbSet.total_count || 0,
      };
      cards = dbCards.map((c) => ({
        id: c.id,
        set_id: c.set_id,
        set_name: dbSet.name,
        set_logo_url: dbSet.logo_url,
        set_symbol_url: dbSet.symbol_url,
        local_id: c.local_id,
        name: c.name,
        image_base: c.image_base,
        rarity: c.rarity,
        category: c.category,
        hp: c.hp,
        types: c.types || [],
        illustrator: c.illustrator,
        variants: c.variants || {},
      }));
    }
  }

  if (!setObj) {
    const live = await getSetWithCards(setId);
    if (!live) return null;
    setObj = live.set;
    cards = live.cards;
  }

  const allListings = await getListingsForSet(setId);
  const listingsByCard = new Map<string, CardListing[]>();
  for (const l of allListings) {
    const arr = listingsByCard.get(l.card_id) || [];
    arr.push(l);
    listingsByCard.set(l.card_id, arr);
  }

  const merged = cards.map((card) => ({
    card,
    listings: listingsByCard.get(card.id) || [],
  }));

  return { set: setObj, cards: merged };
}

async function getListingsForSet(setId: string): Promise<CardListing[]> {
  if (!isSupabaseConfigured()) {
    return readLocalStore().listings.filter((l) => l.set_id === setId);
  }
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("card_listings")
    .select("*")
    .eq("set_id", setId)
    .order("price_ars", { ascending: true });
  return (data || []).map(normalizeListingRow);
}

function normalizeListingRow(row: Record<string, unknown>): CardListing {
  return {
    id: String(row.id),
    card_id: String(row.card_id),
    set_id: String(row.set_id),
    price_ars: Number(row.price_ars || 0),
    compare_at_price_ars:
      row.compare_at_price_ars != null
        ? Number(row.compare_at_price_ars)
        : null,
    stock: Number(row.stock ?? 0),
    condition: (row.condition as CardCondition) || "NM",
    finish: (row.finish as CardFinish) || "Normal",
    language: (row.language as CardLanguage) || "EN",
    custom_description: String(row.custom_description || ""),
    is_active: Boolean(row.is_active),
    is_featured: Boolean(row.is_featured),
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
  };
}

export async function getActiveListingsWithCards(options?: {
  featuredOnly?: boolean;
  setId?: string;
  limit?: number;
}): Promise<EnrichedCardListing[]> {
  let listings: CardListing[] = [];

  if (!isSupabaseConfigured()) {
    listings = readLocalStore().listings.filter(
      (l) =>
        l.is_active &&
        l.stock > 0 &&
        (!options?.featuredOnly || l.is_featured) &&
        (!options?.setId || l.set_id === options.setId)
    );
  } else {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("card_listings")
      .select("*")
      .eq("is_active", true)
      .gt("stock", 0);
    if (options?.featuredOnly) query = query.eq("is_featured", true);
    if (options?.setId) query = query.eq("set_id", options.setId);
    const { data } = await query.order("updated_at", { ascending: false });
    listings = (data || []).map(normalizeListingRow);
  }

  if (options?.limit) {
    listings = listings.slice(0, options.limit);
  }

  // Group by setId so we resolve card metadata quickly in batch
  const uniqueSetIds = Array.from(new Set(listings.map((l) => l.set_id)));
  const setCardMap = new Map<string, TcgCard>();

  if (isSupabaseConfigured() && listings.length > 0) {
    const supabase = createSupabaseAdminClient();
    const cardIds = Array.from(new Set(listings.map((l) => l.card_id)));
    const { data: dbCards } = await supabase
      .from("tcg_cards")
      .select("*, tcg_sets(name, logo_url, symbol_url)")
      .in("id", cardIds);

    for (const c of dbCards || []) {
      const setMeta = c.tcg_sets as {
        name?: string;
        logo_url?: string;
        symbol_url?: string;
      } | null;
      setCardMap.set(c.id, {
        id: c.id,
        set_id: c.set_id,
        set_name: setMeta?.name || c.set_id,
        set_logo_url: setMeta?.logo_url || null,
        set_symbol_url: setMeta?.symbol_url || null,
        local_id: c.local_id,
        name: c.name,
        image_base: c.image_base,
        rarity: c.rarity,
        category: c.category,
        hp: c.hp,
        types: c.types || [],
        illustrator: c.illustrator,
      });
    }
  }

  const missingSetIds = uniqueSetIds.filter((sid) =>
    listings.some((l) => l.set_id === sid && !setCardMap.has(l.card_id))
  );

  await Promise.all(
    missingSetIds.map(async (sid) => {
      const data = await getSetWithCards(sid);
      if (!data) return;
      for (const c of data.cards) {
        setCardMap.set(c.id, c);
      }
    })
  );

  const enriched: EnrichedCardListing[] = [];
  for (const listing of listings) {
    const card = setCardMap.get(listing.card_id);
    if (card) {
      enriched.push({ listing, card });
    }
  }
  return enriched;
}

export async function getCardPageData(cardId: string): Promise<{
  card: TcgCard;
  set: TcgSet | null;
  listings: CardListing[];
} | null> {
  const card = await getCardDetail(cardId);
  if (!card) return null;

  const setResult = card.set_id ? await getSetWithCards(card.set_id) : null;

  let listings: CardListing[] = [];
  if (!isSupabaseConfigured()) {
    listings = readLocalStore().listings.filter(
      (l) => l.card_id === cardId && l.is_active && l.stock > 0
    );
  } else {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("card_listings")
      .select("*")
      .eq("card_id", cardId)
      .eq("is_active", true)
      .gt("stock", 0)
      .order("price_ars", { ascending: true });
    listings = (data || []).map(normalizeListingRow);
  }

  return {
    card,
    set: setResult?.set || null,
    listings,
  };
}

export async function searchAdminCards(params: {
  setId?: string;
  query?: string;
  statusFilter?: "all" | "active" | "inactive";
}): Promise<Array<{ card: TcgCard; listings: CardListing[] }>> {
  const query = (params.query || "").trim();
  const statusFilter = params.statusFilter || "all";

  let allListings: CardListing[] = [];
  if (!isSupabaseConfigured()) {
    allListings = readLocalStore().listings;
  } else {
    const supabase = createSupabaseAdminClient();
    let q = supabase.from("card_listings").select("*");
    if (params.setId) q = q.eq("set_id", params.setId);
    const { data } = await q;
    allListings = (data || []).map(normalizeListingRow);
  }

  const listingsByCard = new Map<string, CardListing[]>();
  for (const l of allListings) {
    const arr = listingsByCard.get(l.card_id) || [];
    arr.push(l);
    listingsByCard.set(l.card_id, arr);
  }

  let cards: TcgCard[] = [];

  if (params.setId) {
    const setData = await getSetCatalog(params.setId);
    if (setData) {
      cards = setData.cards.map((item) => item.card);
      if (query) {
        const lower = query.toLowerCase();
        cards = cards.filter(
          (c) =>
            c.name.toLowerCase().includes(lower) ||
            c.local_id.toLowerCase().includes(lower) ||
            c.id.toLowerCase().includes(lower)
        );
      }
    }
  } else if (query) {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseAdminClient();
      const { data: dbCards } = await supabase
        .from("tcg_cards")
        .select("*, tcg_sets(name, logo_url, symbol_url)")
        .ilike("name", `%${query}%`)
        .limit(80);
      if (dbCards && dbCards.length > 0) {
        cards = dbCards.map((c) => {
          const setMeta = c.tcg_sets as {
            name?: string;
            logo_url?: string;
            symbol_url?: string;
          } | null;
          return {
            id: c.id,
            set_id: c.set_id,
            set_name: setMeta?.name || c.set_id,
            set_logo_url: setMeta?.logo_url || null,
            set_symbol_url: setMeta?.symbol_url || null,
            local_id: c.local_id,
            name: c.name,
            image_base: c.image_base,
          };
        });
      }
    }

    if (cards.length === 0) {
      cards = await searchCardsFromApi(query, 80);
    }
  } else {
    // No setId and no query: show active/existing listings first
    const enriched = await getActiveListingsWithCards({ limit: 80 });
    const seen = new Set<string>();
    for (const e of enriched) {
      if (!seen.has(e.card.id)) {
        seen.add(e.card.id);
        cards.push(e.card);
      }
    }
  }

  const merged = cards.map((card) => ({
    card,
    listings: listingsByCard.get(card.id) || [],
  }));

  if (statusFilter === "active") {
    return merged.filter((item) => item.listings.some((l) => l.is_active));
  }
  if (statusFilter === "inactive") {
    return merged.filter((item) => !item.listings.some((l) => l.is_active));
  }
  return merged;
}

export async function upsertCardListing(input: {
  id?: string;
  card_id: string;
  set_id: string;
  price_ars: number;
  compare_at_price_ars?: number | null;
  stock: number;
  condition: CardCondition;
  finish: CardFinish;
  language: CardLanguage;
  custom_description?: string;
  is_active: boolean;
  is_featured?: boolean;
}): Promise<CardListing> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    const idx = input.id
      ? store.listings.findIndex((l) => l.id === input.id)
      : -1;

    if (idx >= 0) {
      store.listings[idx] = {
        ...store.listings[idx],
        ...input,
        compare_at_price_ars: input.compare_at_price_ars ?? null,
        custom_description: input.custom_description ?? "",
        is_featured: Boolean(input.is_featured),
        updated_at: now,
      };
      writeLocalStore(store);
      return store.listings[idx];
    }

    const created: CardListing = {
      id: crypto.randomUUID(),
      card_id: input.card_id,
      set_id: input.set_id,
      price_ars: Number(input.price_ars) || 0,
      compare_at_price_ars: input.compare_at_price_ars ?? null,
      stock: Number(input.stock) || 0,
      condition: input.condition || "NM",
      finish: input.finish || "Normal",
      language: input.language || "EN",
      custom_description: input.custom_description || "",
      is_active: Boolean(input.is_active),
      is_featured: Boolean(input.is_featured),
      created_at: now,
      updated_at: now,
    };
    store.listings.unshift(created);
    writeLocalStore(store);
    return created;
  }

  const supabase = createSupabaseAdminClient();

  // Ensure parent tcg_set and tcg_card exist in Supabase before listing FK insert
  const { data: existingCard } = await supabase
    .from("tcg_cards")
    .select("id")
    .eq("id", input.card_id)
    .maybeSingle();

  if (!existingCard) {
    const liveSet = await getSetWithCards(input.set_id);
    if (liveSet) {
      await supabase.from("tcg_series").upsert(
        {
          id: liveSet.set.series_id,
          name: liveSet.set.series_name || liveSet.set.series_id,
        },
        { onConflict: "id" }
      );
      await supabase.from("tcg_sets").upsert(
        {
          id: liveSet.set.id,
          series_id: liveSet.set.series_id,
          series_name: liveSet.set.series_name,
          name: liveSet.set.name,
          logo_url: liveSet.set.logo_url,
          symbol_url: liveSet.set.symbol_url,
          release_date: liveSet.set.release_date,
          official_count: liveSet.set.official_count,
          total_count: liveSet.set.total_count,
        },
        { onConflict: "id" }
      );
      const foundCard = liveSet.cards.find((c) => c.id === input.card_id);
      if (foundCard) {
        await supabase.from("tcg_cards").upsert(
          {
            id: foundCard.id,
            set_id: foundCard.set_id,
            local_id: foundCard.local_id,
            name: foundCard.name,
            image_base: foundCard.image_base,
          },
          { onConflict: "id" }
        );
      }
    }
  }

  const payload: Record<string, unknown> = {
    card_id: input.card_id,
    set_id: input.set_id,
    price_ars: Number(input.price_ars) || 0,
    compare_at_price_ars: input.compare_at_price_ars ?? null,
    stock: Number(input.stock) || 0,
    condition: input.condition || "NM",
    finish: input.finish || "Normal",
    language: input.language || "EN",
    custom_description: input.custom_description || "",
    is_active: Boolean(input.is_active),
    is_featured: Boolean(input.is_featured),
    updated_at: now,
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("card_listings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return normalizeListingRow(data);
}

export async function deleteCardListing(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    store.listings = store.listings.filter((l) => l.id !== id);
    writeLocalStore(store);
    return;
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("card_listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// PRODUCTS (SEALED TCG, PS4/PS5 GAMES & ACCESSORIES)
// ============================================================================

export async function getProducts(options?: {
  department?: ProductDepartment;
  onlyActive?: boolean;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return readLocalStore().products.filter((p) => {
      if (options?.department && p.department !== options.department)
        return false;
      if (options?.onlyActive && !p.is_active) return false;
      if (options?.featuredOnly && !p.is_featured) return false;
      return true;
    });
  }

  const supabase = createSupabaseAdminClient();
  let q = supabase.from("products").select("*");
  if (options?.department) q = q.eq("department", options.department);
  if (options?.onlyActive) q = q.eq("is_active", true);
  if (options?.featuredOnly) q = q.eq("is_featured", true);
  const { data } = await q.order("created_at", { ascending: false });
  return (data || []).map((row) => ({
    ...row,
    price_ars: Number(row.price_ars),
    compare_at_price_ars:
      row.compare_at_price_ars != null
        ? Number(row.compare_at_price_ars)
        : null,
    images: Array.isArray(row.images) ? row.images : [],
  })) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return (
      readLocalStore().products.find((p) => p.slug === slug && p.is_active) ||
      null
    );
  }
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    price_ars: Number(data.price_ars),
    compare_at_price_ars:
      data.compare_at_price_ars != null
        ? Number(data.compare_at_price_ars)
        : null,
    images: Array.isArray(data.images) ? data.images : [],
  } as Product;
}

export async function upsertProduct(
  input: Partial<Product> & {
    department: ProductDepartment;
    title: string;
    price_ars: number;
  }
): Promise<Product> {
  const now = new Date().toISOString();
  const generatedSlug =
    input.slug && input.slug.trim()
      ? slugify(input.slug)
      : `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    const idx = input.id
      ? store.products.findIndex((p) => p.id === input.id)
      : -1;
    if (idx >= 0) {
      store.products[idx] = {
        ...store.products[idx],
        ...input,
        slug: input.slug ? slugify(input.slug) : store.products[idx].slug,
        updated_at: now,
      };
      writeLocalStore(store);
      return store.products[idx];
    }

    const created: Product = {
      id: crypto.randomUUID(),
      department: input.department,
      category: input.category || "General",
      platform: input.platform || null,
      title: input.title,
      slug: generatedSlug,
      description: input.description || "",
      price_ars: Number(input.price_ars) || 0,
      compare_at_price_ars: input.compare_at_price_ars ?? null,
      stock: Number(input.stock ?? 0),
      condition: input.condition || "Nuevo",
      format: input.format || "Físico",
      images: Array.isArray(input.images) ? input.images : [],
      is_active: input.is_active ?? true,
      is_featured: input.is_featured ?? false,
      created_at: now,
      updated_at: now,
    };
    store.products.unshift(created);
    writeLocalStore(store);
    return created;
  }

  const supabase = createSupabaseAdminClient();
  const payload: Record<string, unknown> = {
    department: input.department,
    category: input.category || "General",
    platform: input.platform || null,
    title: input.title,
    slug: generatedSlug,
    description: input.description || "",
    price_ars: Number(input.price_ars) || 0,
    compare_at_price_ars: input.compare_at_price_ars ?? null,
    stock: Number(input.stock ?? 0),
    condition: input.condition || "Nuevo",
    format: input.format || "Físico",
    images: Array.isArray(input.images) ? input.images : [],
    is_active: input.is_active ?? true,
    is_featured: input.is_featured ?? false,
    updated_at: now,
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("products")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    store.products = store.products.filter((p) => p.id !== id);
    writeLocalStore(store);
    return;
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// ORDERS & STOCK ADJUSTMENT
// ============================================================================

async function adjustInventoryStock(
  items: Array<{ item_type: "card" | "product"; ref_id: string; quantity: number }>,
  mode: "decrement" | "restore"
): Promise<void> {
  const factor = mode === "decrement" ? -1 : 1;

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    for (const item of items) {
      const delta = factor * Math.max(1, Number(item.quantity) || 1);
      if (item.item_type === "card") {
        const idx = store.listings.findIndex((l) => l.id === item.ref_id);
        if (idx >= 0) {
          store.listings[idx].stock = Math.max(
            0,
            Number(store.listings[idx].stock || 0) + delta
          );
        }
      } else {
        const idx = store.products.findIndex((p) => p.id === item.ref_id);
        if (idx >= 0) {
          store.products[idx].stock = Math.max(
            0,
            Number(store.products[idx].stock || 0) + delta
          );
        }
      }
    }
    writeLocalStore(store);
    return;
  }

  const supabase = createSupabaseAdminClient();
  for (const item of items) {
    const delta = factor * Math.max(1, Number(item.quantity) || 1);
    if (item.item_type === "card") {
      const { data: row } = await supabase
        .from("card_listings")
        .select("stock")
        .eq("id", item.ref_id)
        .maybeSingle();
      if (row) {
        const nextStock = Math.max(0, Number(row.stock || 0) + delta);
        await supabase
          .from("card_listings")
          .update({ stock: nextStock, updated_at: new Date().toISOString() })
          .eq("id", item.ref_id);
      }
    } else {
      const { data: row } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.ref_id)
        .maybeSingle();
      if (row) {
        const nextStock = Math.max(0, Number(row.stock || 0) + delta);
        await supabase
          .from("products")
          .update({ stock: nextStock, updated_at: new Date().toISOString() })
          .eq("id", item.ref_id);
      }
    }
  }
}

export async function createOrder(input: {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_dni: string;
  shipping_zone_id: string;
  shipping_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  notes: string;
  payment_method: PaymentMethod;
  subtotal_ars: number;
  discount_ars: number;
  shipping_ars: number;
  total_ars: number;
  items: Array<Omit<OrderItem, "id">>;
}): Promise<Order> {
  const now = new Date().toISOString();
  const orderNumber = `MG-${Date.now().toString().slice(-6)}-${Math.floor(
    10 + Math.random() * 90
  )}`;

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    const order: Order = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      buyer_name: input.buyer_name,
      buyer_email: input.buyer_email,
      buyer_phone: input.buyer_phone,
      buyer_dni: input.buyer_dni,
      shipping_zone_id: input.shipping_zone_id,
      shipping_method: input.shipping_method,
      shipping_address: input.shipping_address,
      shipping_city: input.shipping_city,
      shipping_province: input.shipping_province,
      shipping_postal_code: input.shipping_postal_code,
      notes: input.notes,
      payment_method: input.payment_method,
      payment_status: "pending",
      order_status: "pending",
      tracking_code: "",
      mp_preference_id: null,
      mp_payment_id: null,
      subtotal_ars: input.subtotal_ars,
      discount_ars: input.discount_ars,
      shipping_ars: input.shipping_ars,
      total_ars: input.total_ars,
      items: input.items.map((it) => ({ ...it, id: crypto.randomUUID() })),
      created_at: now,
      updated_at: now,
    };
    store.orders.unshift(order);
    writeLocalStore(store);
    await adjustInventoryStock(input.items, "decrement");
    return order;
  }

  const supabase = createSupabaseAdminClient();
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      buyer_name: input.buyer_name,
      buyer_email: input.buyer_email,
      buyer_phone: input.buyer_phone,
      buyer_dni: input.buyer_dni,
      shipping_zone_id: input.shipping_zone_id,
      shipping_method: input.shipping_method,
      shipping_address: input.shipping_address,
      shipping_city: input.shipping_city,
      shipping_province: input.shipping_province,
      shipping_postal_code: input.shipping_postal_code,
      notes: input.notes,
      payment_method: input.payment_method,
      payment_status: "pending",
      order_status: "pending",
      subtotal_ars: input.subtotal_ars,
      discount_ars: input.discount_ars,
      shipping_ars: input.shipping_ars,
      total_ars: input.total_ars,
    })
    .select("*")
    .single();
  if (orderErr) throw new Error(orderErr.message);

  const itemsPayload = input.items.map((it) => ({
    order_id: orderRow.id,
    item_type: it.item_type,
    ref_id: it.ref_id,
    title: it.title,
    subtitle: it.subtitle,
    image_url: it.image_url,
    unit_price_ars: it.unit_price_ars,
    quantity: it.quantity,
  }));
  const { data: itemRows, error: itemErr } = await supabase
    .from("order_items")
    .insert(itemsPayload)
    .select("*");
  if (itemErr) throw new Error(itemErr.message);

  await adjustInventoryStock(input.items, "decrement");

  return {
    ...orderRow,
    items: (itemRows || []) as OrderItem[],
  } as Order;
}

export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    return readLocalStore().orders;
  }
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (data || []).map((row) => ({
    ...row,
    subtotal_ars: Number(row.subtotal_ars),
    discount_ars: Number(row.discount_ars),
    shipping_ars: Number(row.shipping_ars),
    total_ars: Number(row.total_ars),
    items: (row.order_items || []) as OrderItem[],
  })) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const clean = id.trim();
  if (!clean) return null;

  if (!isSupabaseConfigured()) {
    return readLocalStore().orders.find((o) => o.id === clean) || null;
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", clean)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    subtotal_ars: Number(data.subtotal_ars),
    discount_ars: Number(data.discount_ars),
    shipping_ars: Number(data.shipping_ars),
    total_ars: Number(data.total_ars),
    items: (data.order_items || []) as OrderItem[],
  } as Order;
}

export async function getOrderByNumber(
  orderNumber: string
): Promise<Order | null> {
  const clean = orderNumber.trim();
  if (!clean) return null;

  if (!isSupabaseConfigured()) {
    return (
      readLocalStore().orders.find((o) => o.order_number === clean) || null
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", clean)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    subtotal_ars: Number(data.subtotal_ars),
    discount_ars: Number(data.discount_ars),
    shipping_ars: Number(data.shipping_ars),
    total_ars: Number(data.total_ars),
    items: (data.order_items || []) as OrderItem[],
  } as Order;
}

export async function updateOrder(
  id: string,
  patch: {
    order_status?: OrderStatus;
    payment_status?: PaymentStatus;
    tracking_code?: string;
    mp_preference_id?: string | null;
    mp_payment_id?: string | null;
  }
): Promise<Order | null> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const prevOrder = store.orders[idx];
    const prevStatus = prevOrder.order_status;
    store.orders[idx] = { ...prevOrder, ...patch, updated_at: now };
    writeLocalStore(store);

    if (
      patch.order_status &&
      prevStatus !== "cancelled" &&
      patch.order_status === "cancelled"
    ) {
      await adjustInventoryStock(prevOrder.items, "restore");
    } else if (
      patch.order_status &&
      prevStatus === "cancelled" &&
      patch.order_status !== "cancelled"
    ) {
      await adjustInventoryStock(prevOrder.items, "decrement");
    }

    return store.orders[idx];
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("orders")
    .select("order_status, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("orders")
    .update({ ...patch, updated_at: now })
    .eq("id", id)
    .select("*, order_items(*)")
    .single();
  if (error || !data) return null;

  if (existing && patch.order_status) {
    const items = (existing.order_items || []) as OrderItem[];
    if (
      existing.order_status !== "cancelled" &&
      patch.order_status === "cancelled"
    ) {
      await adjustInventoryStock(items, "restore");
    } else if (
      existing.order_status === "cancelled" &&
      patch.order_status !== "cancelled"
    ) {
      await adjustInventoryStock(items, "decrement");
    }
  }

  return {
    ...data,
    items: (data.order_items || []) as OrderItem[],
  } as Order;
}

export async function validateCartItemsForCheckout(
  requestedItems: Array<{
    item_type: "card" | "product";
    ref_id: string;
    quantity: number;
  }>
): Promise<Array<Omit<OrderItem, "id">>> {
  const result: Array<Omit<OrderItem, "id">> = [];
  const allActiveCards = await getActiveListingsWithCards();
  const allProducts = await getProducts({ onlyActive: true });

  const cardMap = new Map(allActiveCards.map((c) => [c.listing.id, c]));
  const prodMap = new Map(allProducts.map((p) => [p.id, p]));

  for (const reqItem of requestedItems) {
    const qty = Math.max(1, Math.floor(Number(reqItem.quantity) || 1));
    if (reqItem.item_type === "card") {
      const found = cardMap.get(reqItem.ref_id);
      if (!found) {
        throw new Error(
          `Una carta del carrito ya no está disponible para la venta.`
        );
      }
      if (qty > found.listing.stock) {
        throw new Error(
          `Stock insuficiente para ${found.card.name} (disponible: ${found.listing.stock}).`
        );
      }
      result.push({
        item_type: "card",
        ref_id: found.listing.id,
        title: `${found.card.name} (#${found.card.local_id})`,
        subtitle: `${found.card.set_name || found.card.set_id} • ${found.listing.condition} • ${found.listing.finish} • ${found.listing.language}`,
        image_url: found.card.image_base
          ? `${found.card.image_base}/low.webp`
          : "/images/pikachu.png",
        unit_price_ars: found.listing.price_ars,
        quantity: qty,
      });
    } else {
      const prod = prodMap.get(reqItem.ref_id);
      if (!prod) {
        throw new Error(
          `Un producto del carrito ya no está disponible para la venta.`
        );
      }
      if (qty > prod.stock) {
        throw new Error(
          `Stock insuficiente para ${prod.title} (disponible: ${prod.stock}).`
        );
      }
      result.push({
        item_type: "product",
        ref_id: prod.id,
        title: prod.title,
        subtitle: `${prod.category}${prod.platform ? ` • ${prod.platform}` : ""}`,
        image_url: prod.images[0] || "/images/marvelous-logo.jpg",
        unit_price_ars: prod.price_ars,
        quantity: qty,
      });
    }
  }
  return result;
}
