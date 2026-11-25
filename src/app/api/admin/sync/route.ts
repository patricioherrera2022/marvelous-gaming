import { NextResponse } from "next/server";
import {
  clearTcgdexMemoryCache,
  getAllSeriesWithSets,
} from "@/lib/tcgdex";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

export async function POST() {
  try {
    clearTcgdexMemoryCache();
    const series = await getAllSeriesWithSets();
    const allSets = series.flatMap((s) => s.sets);

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseAdminClient();
      const seriesRows = series.map((s) => ({
        id: s.id,
        name: s.name,
        logo_url: s.logo_url,
        sort_order: s.sort_order,
        updated_at: new Date().toISOString(),
      }));
      await supabase
        .from("tcg_series")
        .upsert(seriesRows, { onConflict: "id" });

      const setRows = allSets.map((st) => ({
        id: st.id,
        series_id: st.series_id,
        series_name: st.series_name,
        name: st.name,
        logo_url: st.logo_url,
        symbol_url: st.symbol_url,
        official_count: st.official_count,
        total_count: st.total_count,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("tcg_sets").upsert(setRows, { onConflict: "id" });
    }

    return NextResponse.json({
      ok: true,
      seriesCount: series.length,
      setsCount: allSets.length,
      message: isSupabaseConfigured()
        ? `Sincronizadas ${series.length} series y ${allSets.length} expansiones en Supabase.`
        : `Caché de TCGdex actualizada: ${series.length} series y ${allSets.length} expansiones listas.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
