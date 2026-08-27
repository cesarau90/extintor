/**
 * Cálculo del estado de un extintor.
 *
 * El estado NUNCA se guarda como un valor manual: siempre se deriva de
 * fechaVencimiento + requiereMantenimiento en el momento de la consulta.
 */

export type EstadoExtintor =
  | "VIGENTE"
  | "PROXIMO_A_VENCER"
  | "VENCIDO"
  | "REQUIERE_MANTENIMIENTO";

export const DIAS_ALERTA_VENCIMIENTO = 30;

export interface EstadoInfo {
  estado: EstadoExtintor;
  diasParaVencer: number;
  label: string;
  color: "verde" | "amarillo" | "rojo";
  emoji: string;
}

export function calcularDiasParaVencer(fechaVencimiento: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((vencimiento.getTime() - hoy.getTime()) / msPorDia);
}

export function calcularEstado(params: {
  fechaVencimiento: Date;
  requiereMantenimiento: boolean;
}): EstadoInfo {
  const diasParaVencer = calcularDiasParaVencer(params.fechaVencimiento);

  // "Requiere mantenimiento" detectado en una inspección tiene prioridad
  // visual sobre el semáforo de vencimiento.
  if (params.requiereMantenimiento) {
    return {
      estado: "REQUIERE_MANTENIMIENTO",
      diasParaVencer,
      label: "Requiere mantenimiento",
      color: "amarillo",
      emoji: "⚠️",
    };
  }

  if (diasParaVencer < 0) {
    return {
      estado: "VENCIDO",
      diasParaVencer,
      label: "Vencido",
      color: "rojo",
      emoji: "🔴",
    };
  }

  if (diasParaVencer <= DIAS_ALERTA_VENCIMIENTO) {
    return {
      estado: "PROXIMO_A_VENCER",
      diasParaVencer,
      label: "Próximo a vencer",
      color: "amarillo",
      emoji: "🟡",
    };
  }

  return {
    estado: "VIGENTE",
    diasParaVencer,
    label: "Vigente",
    color: "verde",
    emoji: "🟢",
  };
}
