import { NextRequest, NextResponse } from "next/server";
import { calcularAlertas } from "@/lib/services/extintor.service";

/**
 * Endpoint pensado para ser invocado diariamente por un scheduler externo
 * (Vercel Cron, cron-job.org, un cron de servidor, etc.) protegido con un
 * secreto compartido en el header Authorization.
 *
 * Hoy solo registra las alertas en el log del servidor. Cuando se agregue
 * envío de correo/notificaciones, el punto de extensión es este handler:
 * por cada extintor en `vencidos` / `proximosAVencer` / `requierenMantenimiento`
 * se debe disparar el envío correspondiente.
 *
 * Configuración sugerida (vercel.json):
 * { "crons": [{ "path": "/api/cron/alertas", "schedule": "0 7 * * *" }] }
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const alertas = await calcularAlertas();

  console.log(
    `[cron/alertas] ${new Date().toISOString()} - vencidos: ${alertas.vencidos.length}, ` +
      `próximos a vencer: ${alertas.proximosAVencer.length}, ` +
      `requieren mantenimiento: ${alertas.requierenMantenimiento.length}`
  );

  // TODO: integrar envío de correo electrónico / notificaciones push aquí.

  return NextResponse.json({
    ejecutadoEn: new Date().toISOString(),
    resumen: {
      vencidos: alertas.vencidos.length,
      proximosAVencer: alertas.proximosAVencer.length,
      requierenMantenimiento: alertas.requierenMantenimiento.length,
    },
  });
}
