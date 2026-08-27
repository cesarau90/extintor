import { Badge } from "@/components/ui/Badge";
import { formatearFechaHora } from "@/lib/utils";
import type { InspeccionConDetalle } from "@/types";

export function InspeccionHistorial({ inspecciones }: { inspecciones: InspeccionConDetalle[] }) {
  if (inspecciones.length === 0) {
    return (
      <p className="text-sm text-slate-500">Todavía no se registraron inspecciones.</p>
    );
  }

  return (
    <div className="space-y-3">
      {inspecciones.map((insp) => {
        const problemas = insp.respuestas.filter((r) => r.respuesta === "NO");
        return (
          <details key={insp.id} className="rounded-lg border border-slate-200 bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">{formatearFechaHora(insp.fecha)}</p>
                <p className="text-xs text-slate-500">Inspector: {insp.inspector.nombre}</p>
              </div>
              <Badge color={insp.aprobada ? "verde" : "amarillo"}>
                {insp.aprobada ? "Sin novedades" : "Con observaciones"}
              </Badge>
            </summary>
            <div className="space-y-3 border-t border-slate-100 p-4 text-sm">
              <ul className="space-y-1">
                {insp.respuestas.map((r) => (
                  <li key={r.id} className="flex justify-between gap-3 text-slate-600">
                    <span>{r.pregunta}</span>
                    <span
                      className={
                        r.respuesta === "NO"
                          ? "font-semibold text-red-600"
                          : r.respuesta === "SI"
                          ? "font-semibold text-emerald-600"
                          : "text-slate-400"
                      }
                    >
                      {r.respuesta === "NO_APLICA" ? "N/A" : r.respuesta === "SI" ? "Sí" : "No"}
                    </span>
                  </li>
                ))}
              </ul>
              {insp.observaciones && (
                <p className="rounded-lg bg-slate-50 p-3 text-slate-600">{insp.observaciones}</p>
              )}
              {problemas.length > 0 && (
                <p className="text-xs font-medium text-amber-700">
                  Se detectaron {problemas.length} punto(s) que requieren mantenimiento.
                </p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
