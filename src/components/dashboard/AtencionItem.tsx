"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EstadoBadge } from "@/components/extintor/EstadoBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatearFecha, formatearFechaInput } from "@/lib/utils";
import type { ExtintorConEstado } from "@/types";

export function AtencionItem({ extintor }: { extintor: ExtintorConEstado }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [fechaRecarga, setFechaRecarga] = useState(formatearFechaInput(extintor.fechaRecarga));
  const [fechaVencimiento, setFechaVencimiento] = useState(
    formatearFechaInput(extintor.fechaVencimiento)
  );
  const [requiereMantenimiento, setRequiereMantenimiento] = useState(
    extintor.requiereMantenimiento
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cambiosAplicados, setCambiosAplicados] = useState<string[] | null>(null);

  async function handleResolver(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/extintores/${extintor.codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaRecarga, fechaVencimiento, requiereMantenimiento }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar");
      }

      const cambios: string[] = [];
      if (formatearFechaInput(extintor.fechaRecarga) !== fechaRecarga) {
        cambios.push(
          `Recarga: ${formatearFecha(extintor.fechaRecarga)} → ${formatearFecha(fechaRecarga)}`
        );
      }
      if (formatearFechaInput(extintor.fechaVencimiento) !== fechaVencimiento) {
        cambios.push(
          `Vencimiento: ${formatearFecha(extintor.fechaVencimiento)} → ${formatearFecha(fechaVencimiento)}`
        );
      }
      if (extintor.requiereMantenimiento !== requiereMantenimiento) {
        cambios.push(
          requiereMantenimiento
            ? "Se marcó que requiere mantenimiento"
            : "Se resolvió el mantenimiento pendiente"
        );
      }

      setCambiosAplicados(cambios.length > 0 ? cambios : ["No había cambios para guardar."]);
      setAbierto(false);
      router.refresh();
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
          {extintor.problemasDetectados.length > 0 && (
            <p className="truncate text-xs text-amber-700">
              ⚠ {extintor.problemasDetectados.join(" · ")}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 sm:justify-end sm:text-right">
          <span className="whitespace-nowrap">Vence {formatearFecha(extintor.fechaVencimiento)}</span>
          <EstadoBadge estadoInfo={extintor.estadoInfo} />
          <button
            type="button"
            onClick={() => {
              setCambiosAplicados(null);
              setAbierto((v) => !v);
            }}
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
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={requiereMantenimiento}
              onChange={(e) => setRequiereMantenimiento(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            Requiere mantenimiento
          </label>

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
