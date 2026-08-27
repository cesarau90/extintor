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

export type ExtintorConEstado = ExtintorConUbicacion & {
  estadoInfo: EstadoInfo;
  ultimaInspeccion: Date | null;
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
