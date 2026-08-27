import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirRol, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { extintorSchema } from "@/lib/validations/extintor.schema";
import { listarExtintores } from "@/lib/services/extintor.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const extintores = await listarExtintores({
      busqueda: searchParams.get("busqueda") ?? undefined,
      edificio: searchParams.get("edificio") ?? undefined,
      estado: searchParams.get("estado") ?? undefined,
      tipoAgente: searchParams.get("tipoAgente") ?? undefined,
    });
    return NextResponse.json({ extintores });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await exigirRol("ADMINISTRADOR");

    const body = await request.json().catch(() => null);
    const parsed = extintorSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    const existente = await prisma.extintor.findUnique({
      where: { codigo: parsed.data.codigo },
    });
    if (existente) {
      throw new ApiError(409, `Ya existe un extintor con el código ${parsed.data.codigo}`);
    }

    const extintor = await prisma.extintor.create({
      data: {
        ...parsed.data,
        numeroSerie: parsed.data.numeroSerie || null,
        ubicacionDescripcion: parsed.data.ubicacionDescripcion || null,
        foto: parsed.data.foto || null,
        observaciones: parsed.data.observaciones || null,
      },
      include: { ubicacion: true },
    });

    return NextResponse.json({ extintor }, { status: 201 });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
