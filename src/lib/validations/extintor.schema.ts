import { z } from "zod";

export const extintorSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(3, "El código es requerido")
    .regex(/^[A-Za-z0-9-]+$/, "El código solo puede contener letras, números y guiones"),
  numeroSerie: z.string().trim().optional().nullable(),
  ubicacionId: z.string().min(1, "La ubicación es requerida"),
  ubicacionDescripcion: z.string().trim().optional().nullable(),
  tipoAgente: z.enum([
    "PQS",
    "CO2",
    "ESPUMA",
    "AGUA",
    "HFC",
    "PQS_PURPURA_K",
    "WET_CHEMICAL",
    "OTRO",
  ]),
  capacidad: z.coerce.number().positive("La capacidad debe ser mayor a 0"),
  unidadCapacidad: z.enum(["KG", "L"]),
  fechaFabricacion: z.coerce.date().optional().nullable(),
  fechaRecarga: z.coerce.date(),
  fechaVencimiento: z.coerce.date(),
  tipoServicio: z.enum(["NUEVO", "RECARGA", "MANTENIMIENTO", "INSPECCION"]),
  foto: z.string().trim().optional().nullable(),
  observaciones: z.string().trim().optional().nullable(),
  activo: z.boolean().optional(),
  requiereMantenimiento: z.boolean().optional(),
});

export const extintorUpdateSchema = extintorSchema.partial().extend({
  codigo: extintorSchema.shape.codigo.optional(),
});

export const ubicacionSchema = z.object({
  edificio: z.string().trim().min(1, "El edificio es requerido"),
  piso: z.string().trim().min(1, "El piso es requerido"),
  area: z.string().trim().min(1, "El área es requerida"),
  descripcion: z.string().trim().optional().nullable(),
});

export type ExtintorInput = z.infer<typeof extintorSchema>;
export type UbicacionInput = z.infer<typeof ubicacionSchema>;
