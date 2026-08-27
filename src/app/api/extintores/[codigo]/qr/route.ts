import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manejarErrorApi, ApiError } from "@/lib/api-helpers";
import { generarQrPng } from "@/lib/qr";

interface Params {
  params: Promise<{ codigo: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { codigo } = await params;
    const extintor = await prisma.extintor.findUnique({ where: { codigo } });
    if (!extintor) throw new ApiError(404, "Extintor no encontrado");

    const png = await generarQrPng(codigo);

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="qr-${codigo}.png"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return manejarErrorApi(error);
  }
}
