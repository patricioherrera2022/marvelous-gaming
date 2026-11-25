import { NextResponse } from "next/server";
import { searchAdminCards } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const setId = url.searchParams.get("setId") || undefined;
    const query = url.searchParams.get("q") || undefined;
    const statusFilter =
      (url.searchParams.get("status") as "all" | "active" | "inactive") || "all";

    const items = await searchAdminCards({ setId, query, statusFilter });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
