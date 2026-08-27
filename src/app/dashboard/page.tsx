import Link from "next/link";
import { calcularDashboardStats, calcularAlertas } from "@/lib/services/extintor.service";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/extintor/EstadoBadge";
import { formatearFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, alertas] = await Promise.all([calcularDashboardStats(), calcularAlertas()]);

  const urgentes = [...alertas.vencidos, ...alertas.requierenMantenimiento, ...alertas.proximosAVencer].slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen general del estado de los extintores.</p>
      </div>

      <StatsCards stats={stats} />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Extintores que requieren atención</h2>
          <Link href="/dashboard/extintores" className="text-sm font-medium text-red-600 hover:underline">
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
              {urgentes.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <Link
                      href={`/extintor/${e.codigo}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {e.codigo}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {e.ubicacion.edificio} · {e.ubicacion.piso} · {e.ubicacion.area}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right text-xs text-slate-500">
                    <span>Vence {formatearFecha(e.fechaVencimiento)}</span>
                    <EstadoBadge estadoInfo={e.estadoInfo} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
