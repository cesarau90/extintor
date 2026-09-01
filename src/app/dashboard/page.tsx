import Link from "next/link";
import { calcularDashboardStats, calcularAlertas } from "@/lib/services/extintor.service";
import { getSession } from "@/lib/auth";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EstadoBadge } from "@/components/extintor/EstadoBadge";
import { AtencionItem } from "@/components/dashboard/AtencionItem";
import { formatearFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MAX_VISIBLES_EN_DASHBOARD = 8;

export default async function DashboardPage() {
  const [stats, alertas, session] = await Promise.all([
    calcularDashboardStats(),
    calcularAlertas(),
    getSession(),
  ]);

  const esAdmin = session?.rol === "ADMINISTRADOR";

  const conProblema = [
    ...alertas.vencidos,
    ...alertas.requierenMantenimiento,
    ...alertas.proximosAVencer,
  ];
  const urgentes = conProblema.slice(0, MAX_VISIBLES_EN_DASHBOARD);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Resumen general del estado de los extintores.</p>
        </div>
        {conProblema.length > 0 && (
          <Link href="/dashboard/extintores?estado=ATENCION" className="shrink-0">
            <Button variant="primary" className="w-full sm:w-auto">
              ⚠ Ver {conProblema.length} con problema{conProblema.length === 1 ? "" : "s"}
            </Button>
          </Link>
        )}
      </div>

      <StatsCards stats={stats} />

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Extintores que requieren atención</h2>
          <Link
            href="/dashboard/extintores?estado=ATENCION"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Ver todos →
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {urgentes.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No hay extintores que requieran atención en este momento.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {urgentes.map((e) =>
                esAdmin ? (
                  <AtencionItem key={e.id} extintor={e} />
                ) : (
                  <li
                    key={e.id}
                    className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/extintor/${e.codigo}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {e.codigo}
                      </Link>
                      <p className="truncate text-xs text-slate-500">
                        {e.ubicacion.edificio} · {e.ubicacion.piso} · {e.ubicacion.area}
                      </p>
                      {e.problemasDetectados.length > 0 && (
                        <p className="truncate text-xs text-amber-700">
                          ⚠ {e.problemasDetectados.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 sm:justify-end sm:text-right">
                      <span>Vence {formatearFecha(e.fechaVencimiento)}</span>
                      <EstadoBadge estadoInfo={e.estadoInfo} />
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
          {conProblema.length > MAX_VISIBLES_EN_DASHBOARD && (
            <div className="border-t border-slate-100 px-5 py-3 text-center">
              <Link
                href="/dashboard/extintores?estado=ATENCION"
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Ver los {conProblema.length - MAX_VISIBLES_EN_DASHBOARD} restantes →
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
