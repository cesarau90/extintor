import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ usuario: null }, { status: 200 });
  }
  return NextResponse.json({
    usuario: {
      id: session.sub,
      nombre: session.nombre,
      email: session.email,
      rol: session.rol,
    },
  });
}
