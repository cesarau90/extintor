"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatearFecha } from "@/lib/utils";
import type { UsuarioPublico } from "@/types";

export function UsuariosManager({
  usuarios,
  usuarioActualId,
}: {
  usuarios: UsuarioPublico[];
  usuarioActualId: string;
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.get("nombre"),
          email: form.get("email"),
          password: form.get("password"),
          rol: form.get("rol"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo crear el usuario");
      }
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleDesactivar(id: string) {
    if (!confirm("¿Desactivar este usuario? No podrá volver a iniciar sesión.")) return;
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleToggleActivo(id: string, activo: boolean) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">Administradores e inspectores del sistema.</p>
        </div>
        <Button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Nuevo usuario"}
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Nuevo usuario</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="nombre" label="Nombre completo" required />
              <Input name="email" type="email" label="Email" required />
              <Input name="password" type="password" label="Contraseña" required minLength={6} />
              <Select name="rol" label="Rol" required defaultValue="INSPECTOR">
                <option value="INSPECTOR">Inspector</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </Select>
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" loading={loading}>
                  Crear usuario
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Desde</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge color={u.rol === "ADMINISTRADOR" ? "azul" : "gris"}>
                      {u.rol === "ADMINISTRADOR" ? "Administrador" : "Inspector"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={u.activo ? "verde" : "rojo"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatearFecha(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.id === usuarioActualId ? (
                      <span className="text-xs text-slate-400">Vos</span>
                    ) : u.activo ? (
                      <button
                        onClick={() => handleDesactivar(u.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleActivo(u.id, true)}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
