import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/adminfacu");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Allow login page and auth endpoints without session
  const isLoginRoute = pathname === "/adminfacu/login";
  const isAuthApi = pathname.startsWith("/api/admin/auth");

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifyAdminSession(token);

  if (isLoginRoute) {
    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = "/adminfacu";
      const res = NextResponse.redirect(url);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  if (isAuthApi) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: "No autorizado" },
        {
          status: 401,
          headers: { "X-Robots-Tag": "noindex, nofollow, noarchive" },
        }
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/adminfacu/login";
    const res = NextResponse.redirect(loginUrl);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

export const config = {
  matcher: ["/adminfacu/:path*", "/api/admin/:path*"],
};
