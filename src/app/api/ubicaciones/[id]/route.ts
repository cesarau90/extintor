import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirRol, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { ubicacionSchema } from "@/lib/validations/extintor.schema";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await exigirRol("ADMINISTRADOR");
    const { id } = await params;

    const existente = await prisma.ubicacion.findUnique({ where: { id } });
    if (!existente) throw new ApiError(404, "Ubicación no encontrada");

    const body = await request.json().catch(() => null);
    const parsed = ubicacionSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    const ubicacion = await prisma.ubicacion.update({
      where: { id },
      data: parsed.data,
      include: { _count: { select: { extintores: true } } },
    });

    return NextResponse.json({ ubicacion });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await exigirRol("ADMINISTRADOR");
    const { id } = await params;

    const existente = await prisma.ubicacion.findUnique({
      where: { id },
      include: { _count: { select: { extintores: true } } },
    });
    if (!existente) throw new ApiError(404, "Ubicación no encontrada");

    if (existente._count.extintores > 0) {
      throw new ApiError(
        409,
        `No se puede eliminar: tiene ${existente._count.extintores} extintor(es) asignado(s). Reasigná o eliminá esos extintores primero.`
      );
    }

    await prisma.ubicacion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
