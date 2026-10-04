import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSafeReturnTo } from "@/features/auth/return-to";

export const proxy = (request: NextRequest) => {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const returnTo = getSafeReturnTo(
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
