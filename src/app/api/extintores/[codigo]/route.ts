import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirRol, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { extintorUpdateSchema } from "@/lib/validations/extintor.schema";
import { obtenerExtintorPorCodigo } from "@/lib/services/extintor.service";

interface Params {
  params: Promise<{ codigo: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { codigo } = await params;
    const extintor = await obtenerExtintorPorCodigo(codigo);
    if (!extintor) throw new ApiError(404, "Extintor no encontrado");
    return NextResponse.json({ extintor });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await exigirRol("ADMINISTRADOR");
    const { codigo } = await params;

    const existente = await prisma.extintor.findUnique({ where: { codigo } });
    if (!existente) throw new ApiError(404, "Extintor no encontrado");

    const body = await request.json().catch(() => null);
    const parsed = extintorUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    if (parsed.data.codigo && parsed.data.codigo !== codigo) {
      const duplicado = await prisma.extintor.findUnique({
        where: { codigo: parsed.data.codigo },
      });
      if (duplicado) {
        throw new ApiError(409, `Ya existe un extintor con el código ${parsed.data.codigo}`);
      }
    }

    const extintor = await prisma.extintor.update({
      where: { codigo },
      data: parsed.data,
      include: { ubicacion: true },
    });

    return NextResponse.json({ extintor });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await exigirRol("ADMINISTRADOR");
    const { codigo } = await params;

    const existente = await prisma.extintor.findUnique({ where: { codigo } });
    if (!existente) throw new ApiError(404, "Extintor no encontrado");

    // Baja lógica: nunca se elimina físicamente para preservar el historial
    // de inspecciones asociado.
    const extintor = await prisma.extintor.update({
      where: { codigo },
      data: { activo: false },
    });

    return NextResponse.json({ extintor });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
