"use client";

import { useState } from "react";
import Link from "next/link";
import { EstadoBadge } from "@/components/extintor/EstadoBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calcularEstado } from "@/lib/estado";
import { formatearFecha, formatearFechaInput } from "@/lib/utils";
import type { ExtintorConEstado } from "@/types";

export function AtencionItem({ extintor }: { extintor: ExtintorConEstado }) {
  const [abierto, setAbierto] = useState(false);
  const [fechaRecarga, setFechaRecarga] = useState(formatearFechaInput(extintor.fechaRecarga));
  const [fechaVencimiento, setFechaVencimiento] = useState(
    formatearFechaInput(extintor.fechaVencimiento)
  );
  const [requiereMantenimientoManual, setRequiereMantenimientoManual] = useState(
    extintor.requiereMantenimiento
  );
  const [problemasChecked, setProblemasChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cambiosAplicados, setCambiosAplicados] = useState<string[] | null>(null);

  // Estado "vivo" que se actualiza localmente después de guardar, sin
  // depender de recargar la página — así el aviso de qué cambió no
  // desaparece de golpe (se queda hasta que el usuario interactúe con
  // otra cosa, no por un timeout ni por perder la fila de la lista).
  const [datosActuales, setDatosActuales] = useState({
    fechaVencimiento: extintor.fechaVencimiento,
    requiereMantenimiento: extintor.requiereMantenimiento,
    problemasDetectados: extintor.problemasDetectados,
  });

  const estadoInfoActual = calcularEstado({
    fechaVencimiento: datosActuales.fechaVencimiento,
    requiereMantenimiento: datosActuales.requiereMantenimiento,
  });

  function abrirPanel() {
    setProblemasChecked({});
    setAbierto(true);
  }

  async function handleResolver(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const resueltosAhora = Object.entries(problemasChecked)
      .filter(([, marcado]) => marcado)
      .map(([pregunta]) => pregunta);

    try {
      const payload: Record<string, unknown> = { fechaRecarga, fechaVencimiento };
      if (datosActuales.problemasDetectados.length > 0) {
        if (resueltosAhora.length > 0) payload.problemasAResolver = resueltosAhora;
      } else {
        payload.requiereMantenimiento = requiereMantenimientoManual;
      }

      const res = await fetch(`/api/extintores/${extintor.codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar");
      }

      const data = await res.json();
      const nuevoRequiereMantenimiento: boolean = data.extintor.requiereMantenimiento;
      const nuevosPendientes = nuevoRequiereMantenimiento
        ? datosActuales.problemasDetectados.filter((p) => !resueltosAhora.includes(p))
        : [];

      const cambios: string[] = [];
      if (formatearFechaInput(extintor.fechaRecarga) !== fechaRecarga) {
        cambios.push(
          `Recarga: ${formatearFecha(extintor.fechaRecarga)} → ${formatearFecha(fechaRecarga)}`
        );
      }
      if (formatearFechaInput(datosActuales.fechaVencimiento) !== fechaVencimiento) {
        cambios.push(
          `Vencimiento: ${formatearFecha(datosActuales.fechaVencimiento)} → ${formatearFecha(
            fechaVencimiento
          )}`
        );
      }
      if (resueltosAhora.length > 0) {
        cambios.push(`Resuelto: ${resueltosAhora.join(" · ")}`);
      }
      if (datosActuales.requiereMantenimiento && !nuevoRequiereMantenimiento) {
        cambios.push("✔ Ya no requiere mantenimiento");
      }

      setDatosActuales({
        fechaVencimiento: new Date(fechaVencimiento),
        requiereMantenimiento: nuevoRequiereMantenimiento,
        problemasDetectados: nuevosPendientes,
      });
      setCambiosAplicados(cambios.length > 0 ? cambios : ["No había cambios para guardar."]);
      setAbierto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 px-5 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href={`/extintor/${extintor.codigo}`} className="font-medium text-slate-900 hover:underline">
            {extintor.codigo}
          </Link>
          <p className="truncate text-xs text-slate-500">
            {extintor.ubicacion.edificio} · {extintor.ubicacion.piso} · {extintor.ubicacion.area}
          </p>
          {datosActuales.problemasDetectados.length > 0 && (
            <p className="truncate text-xs text-amber-700">
              ⚠ {datosActuales.problemasDetectados.join(" · ")}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 sm:justify-end sm:text-right">
          <span className="whitespace-nowrap">
            Vence {formatearFecha(datosActuales.fechaVencimiento)}
          </span>
          <EstadoBadge estadoInfo={estadoInfoActual} />
          <button
            type="button"
            onClick={() => (abierto ? setAbierto(false) : abrirPanel())}
            className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            {abierto ? "Cerrar" : "Resolver"}
          </button>
        </div>
      </div>

      {cambiosAplicados && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          ✅ {extintor.codigo} actualizado — {cambiosAplicados.join(" · ")}
        </div>
      )}

      {abierto && (
        <form
          onSubmit={handleResolver}
          className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
        >
          <Input
            type="date"
            label="Fecha de recarga"
            value={fechaRecarga}
            onChange={(e) => setFechaRecarga(e.target.value)}
          />
          <Input
            type="date"
            label="Fecha de vencimiento"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
          />

          {datosActuales.problemasDetectados.length > 0 ? (
            <div className="space-y-1.5 sm:col-span-3">
              <p className="text-xs font-medium text-slate-600">
                Marcá lo que ya se solucionó (podés tildar solo algunas si falta terminar el resto):
              </p>
              {datosActuales.problemasDetectados.map((p) => (
                <label key={p} className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!problemasChecked[p]}
                    onChange={(e) =>
                      setProblemasChecked((prev) => ({ ...prev, [p]: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  {p}
                </label>
              ))}
            </div>
          ) : (
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={requiereMantenimientoManual}
                onChange={(e) => setRequiereMantenimientoManual(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Requiere mantenimiento
            </label>
          )}

          {error && (
            <p className="sm:col-span-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 sm:col-span-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Guardar
            </Button>
          </div>
        </form>
      )}
    </li>
  );
}
