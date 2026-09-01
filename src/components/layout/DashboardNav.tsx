"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Rol } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  soloAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/extintores", label: "Extintores" },
  { href: "/dashboard/ubicaciones", label: "Ubicaciones", soloAdmin: true },
  { href: "/dashboard/usuarios", label: "Usuarios", soloAdmin: true },
];

export function DashboardNav({
  nombre,
  rol,
}: {
  nombre: string;
  rol: Rol;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.soloAdmin || rol === "ADMINISTRADOR");

  function esActivo(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
            <span aria-hidden>🧯</span>
            <span>Control de Extintores</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  esActivo(item.href) ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="text-right text-sm">
            <p className="font-medium text-slate-900">{nombre}</p>
            <p className="text-xs text-slate-500">
              {rol === "ADMINISTRADOR" ? "Administrador" : "Inspector"}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Salir
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <span className="text-xl">{menuAbierto ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuAbierto && (
        <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAbierto(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  esActivo(item.href) ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="text-sm">
              <p className="font-medium text-slate-900">{nombre}</p>
              <p className="text-xs text-slate-500">
                {rol === "ADMINISTRADOR" ? "Administrador" : "Inspector"}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Salir
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
