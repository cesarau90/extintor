import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "extintor_session";

// Bajo /dashboard, algunas subrutas son exclusivas de ADMINISTRADOR.
const RUTAS_SOLO_ADMIN = ["/dashboard/usuarios", "/dashboard/extintores/nuevo"];

function esRutaSoloAdmin(pathname: string): boolean {
  if (RUTAS_SOLO_ADMIN.some((r) => pathname.startsWith(r))) return true;
  // /dashboard/extintores/[codigo]/editar
  if (/^\/dashboard\/extintores\/[^/]+\/editar/.test(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (esRutaSoloAdmin(pathname) && payload.rol !== "ADMINISTRADOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
