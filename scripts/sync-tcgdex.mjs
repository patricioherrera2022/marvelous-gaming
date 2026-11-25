#!/usr/bin/env node
/**
 * Importador masivo de Pokémon TCG (Series, Expansiones y todas las Cartas)
 * desde TCGdex v2 (https://api.tcgdex.net/v2/en) hacia Supabase.
 *
 * Uso:
 *   npm run sync:tcgdex
 *   node scripts/sync-tcgdex.mjs --set=sv03.5
 *   node scripts/sync-tcgdex.mjs --set=sv03.5 --details
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SERIES_ORDER = [
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

const args = process.argv.slice(2);
const onlySetArg = args.find((a) => a.startsWith("--set="))?.split("=")[1];
const fetchDetails = args.includes("--details");

async function fetchJson(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

async function mapLimit(items, limit, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

async function upsertChunks(table, rows, chunkSize = 500) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, {
      onConflict: "id",
    });
    if (error) {
      throw new Error(`Error upserting ${table}: ${error.message}`);
    }
  }
}

async function main() {
  console.log("🚀 Iniciando sincronización desde TCGdex v2...");
  const seriesList = await fetchJson("https://api.tcgdex.net/v2/en/series");

  const seriesRows = seriesList.map((s) => {
    const orderIdx = SERIES_ORDER.indexOf(s.id);
    return {
      id: s.id,
      name: s.name,
      logo_url: s.logo ? `${s.logo}.webp` : null,
      sort_order: orderIdx === -1 ? 999 : orderIdx,
      updated_at: new Date().toISOString(),
    };
  });

  await upsertChunks("tcg_series", seriesRows);
  console.log(`✅ ${seriesRows.length} series guardadas.`);

  const detailedSeries = await mapLimit(seriesList, 6, (s) =>
    fetchJson(`https://api.tcgdex.net/v2/en/series/${s.id}`)
  );

  const setQueue = [];
  for (const serie of detailedSeries) {
    for (const setBrief of serie.sets || []) {
      if (onlySetArg && setBrief.id !== onlySetArg) continue;
      setQueue.push({
        setId: setBrief.id,
        seriesId: serie.id,
        seriesName: serie.name,
      });
    }
  }

  console.log(`📦 Procesando ${setQueue.length} expansiones...`);

  const setRows = [];
  const cardRows = [];

  await mapLimit(setQueue, 6, async ({ setId, seriesId, seriesName }, idx) => {
    const set = await fetchJson(`https://api.tcgdex.net/v2/en/sets/${setId}`);
    setRows.push({
      id: set.id,
      series_id: seriesId,
      series_name: seriesName,
      name: set.name,
      logo_url: set.logo ? `${set.logo}.webp` : null,
      symbol_url: set.symbol ? `${set.symbol}.webp` : null,
      release_date: set.releaseDate || null,
      official_count: set.cardCount?.official || 0,
      total_count: set.cardCount?.total || 0,
      updated_at: new Date().toISOString(),
    });

    const cards = set.cards || [];
    if (fetchDetails) {
      const detailedCards = await mapLimit(cards, 8, (c) =>
        fetchJson(`https://api.tcgdex.net/v2/en/cards/${c.id}`).catch(() => c)
      );
      for (const c of detailedCards) {
        cardRows.push({
          id: c.id,
          set_id: set.id,
          local_id: String(c.localId || ""),
          name: c.name || "Unknown Card",
          image_base: c.image || null,
          rarity: c.rarity || null,
          category: c.category || null,
          hp: typeof c.hp === "number" ? c.hp : null,
          types: Array.isArray(c.types) ? c.types : [],
          illustrator: c.illustrator || null,
          variants: c.variants || {},
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      for (const c of cards) {
        cardRows.push({
          id: c.id,
          set_id: set.id,
          local_id: String(c.localId || ""),
          name: c.name || "Unknown Card",
          image_base: c.image || null,
          updated_at: new Date().toISOString(),
        });
      }
    }

    if ((idx + 1) % 20 === 0 || idx + 1 === setQueue.length) {
      console.log(`   Progreso expansiones: ${idx + 1}/${setQueue.length}`);
    }
  });

  await upsertChunks("tcg_sets", setRows);
  console.log(`✅ ${setRows.length} expansiones guardadas.`);

  await upsertChunks("tcg_cards", cardRows, 500);
  console.log(`✅ ${cardRows.length} cartas importadas en Supabase.`);
  console.log("🎉 Sincronización completada con éxito.");
}

main().catch((err) => {
  console.error("❌ Error en sincronización:", err);
  process.exit(1);
});
