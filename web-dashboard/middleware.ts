import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/landing"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for the auth session in localStorage-persisted Zustand store.
  // zustand/persist stores state under the key defined in the store ("ellipse-auth").
  // In middleware we read it from the cookie or the request headers —
  // since Zustand persist uses localStorage (client-only), we rely on a
  // lightweight auth cookie set on login instead of parsing localStorage.
  const authCookie = request.cookies.get("ellipse-auth-token");

  if (!authCookie?.value) {
    const loginUrl = new URL("/landing", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes except:
   * - _next/static  (static files)
   * - _next/image   (image optimization)
   * - favicon.ico
   * - API routes (handled separately)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
