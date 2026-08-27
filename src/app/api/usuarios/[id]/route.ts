import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirRol, manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { usuarioUpdateSchema } from "@/lib/validations/usuario.schema";
import { hashPassword } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await exigirRol("ADMINISTRADOR");
    const { id } = await params;

    const existente = await prisma.usuario.findUnique({ where: { id } });
    if (!existente) throw new ApiError(404, "Usuario no encontrado");

    const body = await request.json().catch(() => null);
    const parsed = usuarioUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Datos inválidos", parsed.error.flatten());
    }

    const { password, ...resto } = parsed.data;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...resto,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
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

    return NextResponse.json({ usuario });
  } catch (error) {
    return manejarErrorApi(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await exigirRol("ADMINISTRADOR");
    const { id } = await params;

    if (session.sub === id) {
      throw new ApiError(400, "No puede desactivar su propio usuario");
    }

    const existente = await prisma.usuario.findUnique({ where: { id } });
    if (!existente) throw new ApiError(404, "Usuario no encontrado");

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    });

    return NextResponse.json({ usuario });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
