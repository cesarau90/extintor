"use client";

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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
            <span aria-hidden>🧯</span>
            <span>Control de Extintores</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.filter((item) => !item.soloAdmin || rol === "ADMINISTRADOR").map(
              (item) => {
                const activo =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      activo
                        ? "bg-red-50 text-red-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
