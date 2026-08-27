"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { CHECKLIST_INSPECCION } from "@/lib/constants";

type RespuestaValor = "SI" | "NO" | "NO_APLICA";

const OPCIONES: { value: RespuestaValor; label: string }[] = [
  { value: "SI", label: "Sí" },
  { value: "NO", label: "No" },
  { value: "NO_APLICA", label: "N/A" },
];

export function InspeccionForm({ codigo }: { codigo: string }) {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaValor>>({});
  const [observaciones, setObservaciones] = useState("");
  const [foto, setFoto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const faltan = CHECKLIST_INSPECCION.filter((c) => !respuestas[c.pregunta]).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (faltan > 0) {
      setError("Respondé todas las preguntas del checklist antes de guardar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/extintores/${codigo}/inspecciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observaciones: observaciones || null,
          foto: foto || null,
          respuestas: CHECKLIST_INSPECCION.map((c) => ({
            pregunta: c.pregunta,
            respuesta: respuestas[c.pregunta],
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar la inspección");
      }

      router.push(`/extintor/${codigo}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      {CHECKLIST_INSPECCION.map((item, i) => (
        <Card key={item.pregunta}>
          <CardBody className="space-y-3">
            <p className="text-sm font-medium text-slate-900">
              {i + 1}. {item.pregunta}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {OPCIONES.map((op) => {
                const seleccionado = respuestas[item.pregunta] === op.value;
                return (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() =>
                      setRespuestas((prev) => ({ ...prev, [item.pregunta]: op.value }))
                    }
                    className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                      seleccionado
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {op.label}
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      ))}

      <Textarea
        label="Observaciones"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Detalles adicionales sobre la inspección..."
      />

      <Input
        label="URL de fotografía (opcional)"
        value={foto}
        onChange={(e) => setFoto(e.target.value)}
        placeholder="https://..."
      />

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 sm:static sm:border-none sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Guardar inspección {faltan > 0 && `(${faltan} pendientes)`}
          </Button>
        </div>
      </div>
    </form>
  );
}
