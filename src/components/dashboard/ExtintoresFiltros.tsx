"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input, Select } from "@/components/ui/Input";
import { TIPOS_AGENTE } from "@/lib/constants";

const ESTADOS = [
  { value: "VIGENTE", label: "Vigente" },
  { value: "PROXIMO_A_VENCER", label: "Próximo a vencer" },
  { value: "VENCIDO", label: "Vencido" },
  { value: "REQUIERE_MANTENIMIENTO", label: "Requiere mantenimiento" },
];

export function ExtintoresFiltros({ edificios }: { edificios: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") ?? "");

  function actualizarParam(nombre: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(nombre, valor);
    else params.delete(nombre);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (busqueda !== (searchParams.get("busqueda") ?? "")) {
        actualizarParam("busqueda", busqueda);
      }
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Buscar por código, serie o ubicación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <Select
        defaultValue={searchParams.get("edificio") ?? ""}
        onChange={(e) => actualizarParam("edificio", e.target.value)}
      >
        <option value="">Todos los edificios</option>
        {edificios.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("estado") ?? ""}
        onChange={(e) => actualizarParam("estado", e.target.value)}
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("tipoAgente") ?? ""}
        onChange={(e) => actualizarParam("tipoAgente", e.target.value)}
      >
        <option value="">Todos los agentes</option>
        {TIPOS_AGENTE.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
