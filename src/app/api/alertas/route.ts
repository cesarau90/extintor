import { NextResponse } from "next/server";
import { manejarErrorApi } from "@/lib/api-helpers";
import { calcularAlertas } from "@/lib/services/extintor.service";

/**
 * Devuelve los extintores que requieren atención: próximos a vencer,
 * vencidos y con mantenimiento pendiente.
 *
 * Esta misma función (calcularAlertas) puede invocarse desde un job
 * programado diario (cron) para, en el futuro, disparar notificaciones
 * por correo electrónico. Ver README sección "Alertas y tareas programadas".
 */
export async function GET() {
  try {
    const alertas = await calcularAlertas();
    return NextResponse.json(alertas);
  } catch (error) {
    return manejarErrorApi(error);
  }
}
