import { NextResponse } from "next/server";
import { deleteCardListing, upsertCardListing } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listing = await upsertCardListing(body);
    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }
    await deleteCardListing(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
