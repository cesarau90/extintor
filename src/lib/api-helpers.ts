import { NextResponse } from "next/server";
import { getSession, type SessionPayload, type Rol } from "@/lib/auth";

export class ApiError extends Error {
  constructor(public status: number, message: string, public detalles?: unknown) {
    super(message);
  }
}

/** Exige sesión iniciada; lanza ApiError 401 si no la hay. */
export async function exigirSesion(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Debe iniciar sesión");
  return session;
}

/** Exige sesión con un rol específico; lanza ApiError 401/403. */
export async function exigirRol(rol: Rol): Promise<SessionPayload> {
  const session = await exigirSesion();
  if (session.rol !== rol) throw new ApiError(403, "No tiene permisos para esta acción");
  return session;
}

export function manejarErrorApi(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, detalles: error.detalles },
      { status: error.status }
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
