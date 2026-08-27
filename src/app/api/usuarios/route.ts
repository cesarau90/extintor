import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirRol, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { usuarioSchema } from "@/lib/validations/usuario.schema";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    await exigirRol("ADMINISTRADOR");
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json({ usuarios });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await exigirRol("ADMINISTRADOR");
    const body = await request.json().catch(() => null);
    const parsed = usuarioSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    const existente = await prisma.usuario.findUnique({
      where: { email: parsed.data.email },
    });
    if (existente) {
      throw new ApiError(409, "Ya existe un usuario con ese email");
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const usuario = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        passwordHash,
        rol: parsed.data.rol,
        activo: parsed.data.activo ?? true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ usuario }, { status: 201 });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
