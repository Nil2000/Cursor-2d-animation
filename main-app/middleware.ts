import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";
import {
  authPrefix,
  authRoutes,
  DEFAULT_REDIRECT,
  protectedRoutes,
  protectedRoutePatterns,
} from "./lib/routes";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isLoggedIn = !!session?.user;
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname);
  const isProtectedRouteRegex = protectedRoutePatterns.some((pattern) =>
    pattern.test(request.nextUrl.pathname)
  );
  const isApiAuthRoute = request.nextUrl.pathname.startsWith(authPrefix);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  if (!isLoggedIn && (isProtectedRoute || isProtectedRouteRegex)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)", "/"], // Specify the routes the middleware applies to
};
