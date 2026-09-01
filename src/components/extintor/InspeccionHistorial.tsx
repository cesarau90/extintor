import { Badge } from "@/components/ui/Badge";
import { formatearFechaHora } from "@/lib/utils";
import { CHECKLIST_INSPECCION } from "@/lib/constants";
import type { InspeccionConDetalle } from "@/types";

const RESPUESTA_PROBLEMA_POR_PREGUNTA = new Map(
  CHECKLIST_INSPECCION.map((c) => [c.pregunta, c.respuestaProblema])
);

/** Una respuesta es "problema" si coincide con la respuesta marcada como tal
 * para esa pregunta puntual (para la mayoría "No" es el problema, pero para
 * "¿presenta golpes o corrosión?" es al revés: "Sí" es el problema). */
function esRespuestaProblema(pregunta: string, respuesta: string): boolean {
  return RESPUESTA_PROBLEMA_POR_PREGUNTA.get(pregunta) === respuesta;
}

export function InspeccionHistorial({ inspecciones }: { inspecciones: InspeccionConDetalle[] }) {
  if (inspecciones.length === 0) {
    return (
      <p className="text-sm text-slate-500">Todavía no se registraron inspecciones.</p>
    );
  }

  return (
    <div className="space-y-3">
      {inspecciones.map((insp) => {
        const problemas = insp.respuestas.filter((r) =>
          esRespuestaProblema(r.pregunta, r.respuesta)
        );
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
                {insp.respuestas.map((r) => {
                  const esProblema = esRespuestaProblema(r.pregunta, r.respuesta);
                  return (
                    <li key={r.id} className="flex justify-between gap-3 text-slate-600">
                      <span>{r.pregunta}</span>
                      <span
                        className={
                          r.respuesta === "NO_APLICA"
                            ? "text-slate-400"
                            : esProblema
                            ? "font-semibold text-red-600"
                            : "font-semibold text-emerald-600"
                        }
                      >
                        {r.respuesta === "NO_APLICA" ? "N/A" : r.respuesta === "SI" ? "Sí" : "No"}
                      </span>
                    </li>
                  );
                })}
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
