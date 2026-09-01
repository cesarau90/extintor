import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirRol, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { ubicacionSchema } from "@/lib/validations/extintor.schema";

export async function GET() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      include: { _count: { select: { extintores: true } } },
      orderBy: [{ edificio: "asc" }, { piso: "asc" }, { area: "asc" }],
    });
    return NextResponse.json({ ubicaciones });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await exigirRol("ADMINISTRADOR");
    const body = await request.json().catch(() => null);
    const parsed = ubicacionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    const ubicacion = await prisma.ubicacion.create({ data: parsed.data });
    return NextResponse.json({ ubicacion }, { status: 201 });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
