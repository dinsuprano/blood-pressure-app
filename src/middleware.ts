import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isAuth = req.cookies.get("auth")?.value === "true";
  const isLogin = req.nextUrl.pathname.startsWith("/login");

  if (!isAuth && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuth && isLogin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/records/:path*", "/login"],
};
