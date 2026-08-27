import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatearFecha(fecha: Date | string | null | undefined): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatearFechaHora(fecha: Date | string | null | undefined): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formatea una fecha a "yyyy-MM-dd" para usar como value de <input type="date"> */
export function formatearFechaInput(fecha: Date | string | null | undefined): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toISOString().slice(0, 10);
}
