"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { TIPOS_AGENTE, UNIDADES_CAPACIDAD, TIPOS_SERVICIO } from "@/lib/constants";
import { formatearFechaInput } from "@/lib/utils";
import type { Ubicacion } from "@prisma/client";
import type { ExtintorConEstado } from "@/types";

interface Props {
  modo: "crear" | "editar";
  ubicaciones: Ubicacion[];
  extintor?: ExtintorConEstado;
}

export function ExtintorForm({ modo, ubicaciones, extintor }: Props) {
  const router = useRouter();
  const [nuevaUbicacion, setNuevaUbicacion] = useState(ubicaciones.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      let ubicacionId = form.get("ubicacionId") as string;

      if (nuevaUbicacion) {
        const resUbicacion = await fetch("/api/ubicaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            edificio: form.get("edificio"),
            piso: form.get("piso"),
            area: form.get("area"),
          }),
        });
        if (!resUbicacion.ok) {
          const data = await resUbicacion.json().catch(() => ({}));
          throw new Error(data.error ?? "No se pudo crear la ubicación");
        }
        const data = await resUbicacion.json();
        ubicacionId = data.ubicacion.id;
      }

      const payload = {
        // En modo "editar" el input de código está deshabilitado y por lo
        // tanto no viaja en el FormData: no incluir la clave evita mandar
        // `codigo: null` y romper la validación del PUT.
        ...(modo === "crear" ? { codigo: form.get("codigo") } : {}),
        numeroSerie: form.get("numeroSerie") || null,
        ubicacionId,
        ubicacionDescripcion: form.get("ubicacionDescripcion") || null,
        tipoAgente: form.get("tipoAgente"),
        capacidad: Number(form.get("capacidad")),
        unidadCapacidad: form.get("unidadCapacidad"),
        fechaFabricacion: form.get("fechaFabricacion") || null,
        fechaRecarga: form.get("fechaRecarga"),
        fechaVencimiento: form.get("fechaVencimiento"),
        tipoServicio: form.get("tipoServicio"),
        foto: form.get("foto") || null,
        observaciones: form.get("observaciones") || null,
      };

      const url = modo === "crear" ? "/api/extintores" : `/api/extintores/${extintor!.codigo}`;
      const method = modo === "crear" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar el extintor");
      }

      const data = await res.json();
      router.push(`/extintor/${data.extintor.codigo}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Datos generales</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="codigo"
            label="Código"
            required
            disabled={modo === "editar"}
            defaultValue={extintor?.codigo}
            placeholder="EXT-001"
          />
          <Input
            name="numeroSerie"
            label="Número de serie"
            defaultValue={extintor?.numeroSerie ?? ""}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Ubicación</h2>
          {ubicaciones.length > 0 && (
            <button
              type="button"
              onClick={() => setNuevaUbicacion((v) => !v)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              {nuevaUbicacion ? "Elegir ubicación existente" : "+ Nueva ubicación"}
            </button>
          )}
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {nuevaUbicacion ? (
            <>
              <Input name="edificio" label="Edificio" required placeholder="Edificio A" />
              <Input name="piso" label="Piso" required placeholder="Planta baja" />
              <Input name="area" label="Área" required placeholder="Pasillo" />
            </>
          ) : (
            <Select
              name="ubicacionId"
              label="Ubicación"
              required
              defaultValue={extintor?.ubicacionId}
              className="sm:col-span-2"
            >
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.edificio} · {u.piso} · {u.area}
                </option>
              ))}
            </Select>
          )}
          <Textarea
            name="ubicacionDescripcion"
            label="Descripción puntual de la ubicación"
            hint='Ej: "Pasillo frente al laboratorio"'
            defaultValue={extintor?.ubicacionDescripcion ?? ""}
            className="sm:col-span-2"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Especificaciones técnicas</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select name="tipoAgente" label="Agente" required defaultValue={extintor?.tipoAgente ?? "PQS"}>
            {TIPOS_AGENTE.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
          <Input
            name="capacidad"
            type="number"
            step="0.1"
            min="0"
            label="Capacidad"
            required
            defaultValue={extintor?.capacidad}
          />
          <Select
            name="unidadCapacidad"
            label="Unidad"
            required
            defaultValue={extintor?.unidadCapacidad ?? "KG"}
          >
            {UNIDADES_CAPACIDAD.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
          <Input
            name="fechaFabricacion"
            type="date"
            label="Fecha de fabricación"
            defaultValue={formatearFechaInput(extintor?.fechaFabricacion)}
          />
          <Input
            name="fechaRecarga"
            type="date"
            label="Fecha de recarga"
            required
            defaultValue={formatearFechaInput(extintor?.fechaRecarga) || formatearFechaInput(new Date())}
          />
          <Input
            name="fechaVencimiento"
            type="date"
            label="Fecha de vencimiento"
            required
            defaultValue={formatearFechaInput(extintor?.fechaVencimiento)}
          />
          <Select
            name="tipoServicio"
            label="Tipo de servicio"
            required
            defaultValue={extintor?.tipoServicio ?? "NUEVO"}
          >
            {TIPOS_SERVICIO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Fotografía y observaciones</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4">
          <Input
            name="foto"
            label="URL de la fotografía"
            hint="Enlace a una imagen ya subida (ej. a un bucket de almacenamiento)"
            defaultValue={extintor?.foto ?? ""}
          />
          <Textarea
            name="observaciones"
            label="Observaciones"
            defaultValue={extintor?.observaciones ?? ""}
          />
        </CardBody>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {modo === "crear" ? "Crear extintor" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
