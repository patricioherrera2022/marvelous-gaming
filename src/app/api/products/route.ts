import { NextResponse } from "next/server";
import { getProducts } from "@/lib/repository";
import type { ProductDepartment } from "@/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const department = url.searchParams.get("department") as
      | ProductDepartment
      | null;
    const featured = url.searchParams.get("featured") === "1";

    const products = await getProducts({
      department: department || undefined,
      onlyActive: true,
      featuredOnly: featured || undefined,
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
