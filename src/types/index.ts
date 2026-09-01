import type {
  Extintor,
  Ubicacion,
  Inspeccion,
  RespuestaInspeccion,
  Usuario,
} from "@prisma/client";
import type { EstadoInfo } from "@/lib/estado";

export type ExtintorConUbicacion = Extintor & {
  ubicacion: Ubicacion;
};

export type UbicacionConConteo = Ubicacion & {
  _count: { extintores: number };
};

export type ExtintorConEstado = ExtintorConUbicacion & {
  estadoInfo: EstadoInfo;
  ultimaInspeccion: Date | null;
  /** Preguntas del checklist que salieron mal en la última inspección
   * (solo tiene contenido cuando estadoInfo.estado === "REQUIERE_MANTENIMIENTO"
   * y ese estado vino de una inspección, no de un ajuste manual). */
  problemasDetectados: string[];
};

export type InspeccionConDetalle = Inspeccion & {
  respuestas: RespuestaInspeccion[];
  inspector: Pick<Usuario, "id" | "nombre" | "email">;
};

export type UsuarioPublico = Pick<
  Usuario,
  "id" | "nombre" | "email" | "rol" | "activo" | "createdAt"
>;

export interface DashboardStats {
  total: number;
  vigentes: number;
  proximosAVencer: number;
  vencidos: number;
  requierenMantenimiento: number;
  inspeccionesPendientes: number;
}
