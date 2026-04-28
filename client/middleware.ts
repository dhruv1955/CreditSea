import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

const ROLE_PREFIXES: Record<string, string[]> = {
  borrower: ["/borrower"],
  sales: ["/dashboard/sales", "/dashboard"],
  sanction: ["/dashboard/sanction", "/dashboard"],
  disbursement: ["/dashboard/disbursement", "/dashboard"],
  collection: ["/dashboard/collection", "/dashboard"],
  admin: ["/dashboard"],
};

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function isAllowedForRole(pathname: string, role: string) {
  const prefixes = ROLE_PREFIXES[role] || [];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  if (isPublicPath(pathname)) {
    if (token && role) {
      if (role === "borrower") {
        return NextResponse.redirect(new URL("/borrower", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!token || !role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAllowedForRole(pathname, role)) {
    return NextResponse.redirect(new URL("/login?forbidden=1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
