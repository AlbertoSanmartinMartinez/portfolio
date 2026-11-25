import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, localeCookie, pickLocale } from "@/i18n/config";

/** Sends paths without a locale to the visitor's language (AC-1, AC-3). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname.split("/")[1])) return;
  const locale = pickLocale(request.cookies.get(localeCookie)?.value, request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals and files with an extension (icons, images).
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
