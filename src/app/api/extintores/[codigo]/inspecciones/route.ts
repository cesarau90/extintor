import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirSesion, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { inspeccionSchema } from "@/lib/validations/inspeccion.schema";
import { crearInspeccion, listarInspecciones } from "@/lib/services/inspeccion.service";

interface Params {
  params: Promise<{ codigo: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { codigo } = await params;
    const extintor = await prisma.extintor.findUnique({ where: { codigo } });
    if (!extintor) throw new ApiError(404, "Extintor no encontrado");

    const inspecciones = await listarInspecciones(extintor.id);
    return NextResponse.json({ inspecciones });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Cualquier usuario autenticado (ADMINISTRADOR o INSPECTOR) puede
    // registrar inspecciones. Un visitante sin sesión no puede.
    const session = await exigirSesion();
    const { codigo } = await params;

    const extintor = await prisma.extintor.findUnique({ where: { codigo } });
    if (!extintor) throw new ApiError(404, "Extintor no encontrado");

    const body = await request.json().catch(() => null);
    const parsed = inspeccionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    const inspeccion = await crearInspeccion({
      extintorId: extintor.id,
      inspectorId: session.sub,
      data: parsed.data,
    });

    return NextResponse.json({ inspeccion }, { status: 201 });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
