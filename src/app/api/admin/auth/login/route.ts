import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isEmailAllowed,
  signAdminSession,
} from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = password || "";

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "Ingresá tu email y contraseña." },
        { status: 400 }
      );
    }

    let authorized = isEmailAllowed(cleanEmail);
    let mode: "supabase" | "local" = "local";

    if (isSupabaseConfigured()) {
      if (!authorized) {
        try {
          const adminSb = createSupabaseAdminClient();
          const { data: adminRow } = await adminSb
            .from("admin_users")
            .select("email")
            .ilike("email", cleanEmail)
            .maybeSingle();
          if (adminRow) authorized = true;
        } catch {
          // Ignore table lookup errors
        }
      }

      if (!authorized) {
        return NextResponse.json(
          { error: "Esta cuenta no tiene permisos de administrador." },
          { status: 403 }
        );
      }

      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (error) {
        return NextResponse.json(
          { error: "Credenciales inválidas en Supabase Auth." },
          { status: 401 }
        );
      }
      mode = "supabase";
    } else {
      if (!authorized) {
        return NextResponse.json(
          { error: "Esta cuenta no tiene permisos de administrador." },
          { status: 403 }
        );
      }
      const expectedPassword =
        process.env.LOCAL_ADMIN_PASSWORD || "marvelous2026";
      if (cleanPassword !== expectedPassword) {
        return NextResponse.json(
          { error: "Contraseña incorrecta." },
          { status: 401 }
        );
      }
    }

    const token = await signAdminSession({ email: cleanEmail, mode });
    const response = NextResponse.json({
      ok: true,
      email: cleanEmail,
      mode,
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
