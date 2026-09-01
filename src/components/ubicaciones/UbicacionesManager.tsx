"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { UbicacionConConteo } from "@/types";

interface FormValores {
  edificio: string;
  piso: string;
  area: string;
  descripcion: string;
}

const VACIO: FormValores = { edificio: "", piso: "", area: "", descripcion: "" };

export function UbicacionesManager({ ubicaciones }: { ubicaciones: UbicacionConConteo[] }) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState<FormValores>(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<FormValores>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ubicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo crear la ubicación");
      }
      setNuevo(VACIO);
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicion(u: UbicacionConConteo) {
    setEditandoId(u.id);
    setEdicion({
      edificio: u.edificio,
      piso: u.piso,
      area: u.area,
      descripcion: u.descripcion ?? "",
    });
    setError(null);
  }

  async function guardarEdicion(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ubicaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edicion),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar");
      }
      setEditandoId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(u: UbicacionConConteo) {
    if (u._count.extintores > 0) return;
    if (!confirm(`¿Eliminar "${u.edificio} · ${u.piso} · ${u.area}"?`)) return;
    const res = await fetch(`/api/ubicaciones/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "No se pudo eliminar");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ubicaciones</h1>
          <p className="text-sm text-slate-500">Edificios, pisos y áreas donde hay extintores.</p>
        </div>
        <Button onClick={() => setMostrarForm((v) => !v)} className="w-full sm:w-auto">
          {mostrarForm ? "Cancelar" : "+ Nueva ubicación"}
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Nueva ubicación</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Edificio"
                required
                value={nuevo.edificio}
                onChange={(e) => setNuevo({ ...nuevo, edificio: e.target.value })}
                placeholder="Edificio A"
              />
              <Input
                label="Piso"
                required
                value={nuevo.piso}
                onChange={(e) => setNuevo({ ...nuevo, piso: e.target.value })}
                placeholder="Planta baja"
              />
              <Input
                label="Área"
                required
                value={nuevo.area}
                onChange={(e) => setNuevo({ ...nuevo, area: e.target.value })}
                placeholder="Pasillo"
              />
              <Textarea
                label="Descripción (opcional)"
                value={nuevo.descripcion}
                onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
                className="sm:col-span-2"
              />
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" loading={loading}>
                  Crear ubicación
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {error && !mostrarForm && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Edificio</th>
                <th className="px-4 py-3 font-semibold">Piso</th>
                <th className="px-4 py-3 font-semibold">Área</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Extintores</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ubicaciones.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Todavía no hay ubicaciones cargadas.
                  </td>
                </tr>
              )}
              {ubicaciones.map((u) =>
                editandoId === u.id ? (
                  <tr key={u.id} className="bg-slate-50">
                    <td className="px-4 py-2">
                      <Input
                        value={edicion.edificio}
                        onChange={(e) => setEdicion({ ...edicion, edificio: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={edicion.piso}
                        onChange={(e) => setEdicion({ ...edicion, piso: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={edicion.area}
                        onChange={(e) => setEdicion({ ...edicion, area: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={edicion.descripcion}
                        onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u._count.extintores}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => guardarEdicion(u.id)}
                          disabled={loading}
                          className="font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="text-slate-500 hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.edificio}</td>
                    <td className="px-4 py-3 text-slate-600">{u.piso}</td>
                    <td className="px-4 py-3 text-slate-600">{u.area}</td>
                    <td className="px-4 py-3 text-slate-500">{u.descripcion || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge color={u._count.extintores > 0 ? "azul" : "gris"}>
                        {u._count.extintores}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => iniciarEdicion(u)}
                          className="font-medium text-slate-600 hover:underline"
                        >
                          Editar
                        </button>
                        {u._count.extintores === 0 ? (
                          <button
                            onClick={() => handleEliminar(u)}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        ) : (
                          <span
                            className="text-slate-300"
                            title="No se puede eliminar: tiene extintores asignados"
                          >
                            Eliminar
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
