import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo de imagen." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Formato no soportado. Usá JPG, PNG, WEBP o GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el máximo de 5 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${crypto.randomUUID()}.${ext}`;

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });
      if (error) {
        return NextResponse.json(
          { error: `Error subiendo a Supabase Storage: ${error.message}` },
          { status: 500 }
        );
      }
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      return NextResponse.json({ url: data.publicUrl });
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "En Vercel la subida directa de archivos requiere conectar Supabase Storage. Mientras tanto podés pegar una URL de imagen.",
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Error al subir imagen." },
      { status: 500 }
    );
  }
}
