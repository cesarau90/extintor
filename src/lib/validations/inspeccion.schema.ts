import { z } from "zod";

export const respuestaInspeccionSchema = z.object({
  pregunta: z.string().min(1),
  respuesta: z.enum(["SI", "NO", "NO_APLICA"]),
});

export const inspeccionSchema = z.object({
  observaciones: z.string().trim().optional().nullable(),
  foto: z.string().trim().optional().nullable(),
  respuestas: z.array(respuestaInspeccionSchema).min(1, "Debe responder el checklist"),
});

export type InspeccionInput = z.infer<typeof inspeccionSchema>;
