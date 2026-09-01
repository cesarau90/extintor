import { prisma } from "@/lib/prisma";
import { CHECKLIST_INSPECCION } from "@/lib/constants";
import type { InspeccionInput } from "@/lib/validations/inspeccion.schema";

/**
 * Determina si las respuestas de una inspección detectan un problema físico
 * en el equipo, cruzando cada pregunta con la respuesta que representa un
 * "problema" definida en CHECKLIST_INSPECCION.
 */
export function detectaProblema(respuestas: InspeccionInput["respuestas"]): boolean {
  return respuestas.some((r) => {
    const item = CHECKLIST_INSPECCION.find((c) => c.pregunta === r.pregunta);
    if (!item) return false;
    return r.respuesta === item.respuestaProblema;
  });
}

export async function crearInspeccion(params: {
  extintorId: string;
  inspectorId: string;
  data: InspeccionInput;
}) {
  const { extintorId, inspectorId, data } = params;
  const requiereMantenimiento = detectaProblema(data.respuestas);

  return prisma.$transaction(async (tx) => {
    const inspeccion = await tx.inspeccion.create({
      data: {
        extintorId,
        inspectorId,
        observaciones: data.observaciones || null,
        foto: data.foto || null,
        aprobada: !requiereMantenimiento,
        respuestas: {
          create: data.respuestas.map((r) => ({
            pregunta: r.pregunta,
            respuesta: r.respuesta,
          })),
        },
      },
      include: { respuestas: true, inspector: { select: { id: true, nombre: true, email: true } } },
    });

    // Sincronizar siempre (no solo activar): una inspección nueva sin
    // problemas debe "cerrar" el aviso de mantenimiento que haya dejado una
    // inspección anterior.
    await tx.extintor.update({
      where: { id: extintorId },
      data: { requiereMantenimiento },
    });

    return inspeccion;
  });
}

export async function listarInspecciones(extintorId: string) {
  return prisma.inspeccion.findMany({
    where: { extintorId },
    include: {
      respuestas: true,
      inspector: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { fecha: "desc" },
  });
}
