import { prisma } from "@/lib/prisma";
import { UbicacionesManager } from "@/components/ubicaciones/UbicacionesManager";

export const dynamic = "force-dynamic";

export default async function UbicacionesPage() {
  const ubicaciones = await prisma.ubicacion.findMany({
    include: { _count: { select: { extintores: true } } },
    orderBy: [{ edificio: "asc" }, { piso: "asc" }, { area: "asc" }],
  });

  return <UbicacionesManager ubicaciones={ubicaciones} />;
}
