import { NextResponse } from "next/server";
import { getSeriesWithSetsAndCounts } from "@/lib/repository";

export async function GET() {
  try {
    const series = await getSeriesWithSetsAndCounts();
    return NextResponse.json({ series });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
