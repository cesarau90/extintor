import { prisma } from "@/lib/prisma";
import { esRespuestaProblema } from "@/lib/constants";
import type { InspeccionInput } from "@/lib/validations/inspeccion.schema";

/**
 * Determina si las respuestas de una inspección detectan un problema físico
 * en el equipo, cruzando cada pregunta con la respuesta que representa un
 * "problema" definida en CHECKLIST_INSPECCION.
 */
export function detectaProblema(respuestas: InspeccionInput["respuestas"]): boolean {
  return respuestas.some((r) => esRespuestaProblema(r.pregunta, r.respuesta));
}

/** Lista en texto plano las preguntas cuya respuesta representó un problema. */
export function listarProblemas(respuestas: InspeccionInput["respuestas"]): string[] {
  return respuestas.filter((r) => esRespuestaProblema(r.pregunta, r.respuesta)).map((r) => r.pregunta);
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
    // inspección anterior. problemasResueltos se reinicia porque es un
    // checklist nuevo: lo que se haya tildado sobre la inspección vieja ya
    // no aplica.
    await tx.extintor.update({
      where: { id: extintorId },
      data: { requiereMantenimiento, problemasResueltos: [] },
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
