import Link from "next/link";
import { EstadoBadge } from "@/components/extintor/EstadoBadge";
import { formatearFecha } from "@/lib/utils";
import { labelTipoAgente } from "@/lib/constants";
import type { ExtintorConEstado } from "@/types";
import type { Rol } from "@/lib/auth";

export function ExtintoresTable({
  extintores,
  rol,
}: {
  extintores: ExtintorConEstado[];
  rol: Rol;
}) {
  if (extintores.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        No se encontraron extintores con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Código</th>
            <th className="px-4 py-3 font-semibold">Ubicación</th>
            <th className="px-4 py-3 font-semibold">Agente</th>
            <th className="px-4 py-3 font-semibold">Capacidad</th>
            <th className="px-4 py-3 font-semibold">Última inspección</th>
            <th className="px-4 py-3 font-semibold">Vencimiento</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {extintores.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{e.codigo}</td>
              <td className="px-4 py-3 text-slate-600">
                {e.ubicacion.edificio} · {e.ubicacion.piso} · {e.ubicacion.area}
              </td>
              <td className="px-4 py-3 text-slate-600">{labelTipoAgente(e.tipoAgente)}</td>
              <td className="px-4 py-3 text-slate-600">
                {e.capacidad} {e.unidadCapacidad === "KG" ? "kg" : "L"}
              </td>
              <td className="px-4 py-3 text-slate-600">{formatearFecha(e.ultimaInspeccion)}</td>
              <td className="px-4 py-3 text-slate-600">{formatearFecha(e.fechaVencimiento)}</td>
              <td className="px-4 py-3">
                <EstadoBadge estadoInfo={e.estadoInfo} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link href={`/extintor/${e.codigo}`} className="text-red-600 hover:underline">
                    Ver
                  </Link>
                  {rol === "ADMINISTRADOR" && (
                    <Link
                      href={`/dashboard/extintores/${e.codigo}/editar`}
                      className="text-slate-600 hover:underline"
                    >
                      Editar
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/extintores/${e.codigo}/qr`}
                    className="text-slate-600 hover:underline"
                  >
                    QR
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
