import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import type { DashboardStats } from "@/types";

interface StatDef {
  key: keyof DashboardStats;
  label: string;
  emoji: string;
  href: string;
  valueClass: string;
}

const STATS: StatDef[] = [
  { key: "total", label: "Total extintores", emoji: "🧯", href: "/dashboard/extintores", valueClass: "text-slate-900" },
  { key: "vigentes", label: "Vigentes", emoji: "🟢", href: "/dashboard/extintores?estado=VIGENTE", valueClass: "text-emerald-600" },
  { key: "proximosAVencer", label: "Próximos a vencer", emoji: "🟡", href: "/dashboard/extintores?estado=PROXIMO_A_VENCER", valueClass: "text-amber-600" },
  { key: "vencidos", label: "Vencidos", emoji: "🔴", href: "/dashboard/extintores?estado=VENCIDO", valueClass: "text-red-600" },
  { key: "requierenMantenimiento", label: "Requieren mantenimiento", emoji: "⚠️", href: "/dashboard/extintores?estado=REQUIERE_MANTENIMIENTO", valueClass: "text-amber-700" },
  { key: "inspeccionesPendientes", label: "Inspecciones pendientes", emoji: "📋", href: "/dashboard/extintores", valueClass: "text-slate-900" },
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {STATS.map((s) => (
        <Link key={s.key} href={s.href} className="group block">
          <Card className="h-full transition-shadow group-hover:shadow-md group-hover:border-slate-300">
            <CardBody className="flex flex-col gap-1.5 p-4 sm:gap-2 sm:p-5">
              <span className="text-lg sm:text-xl">{s.emoji}</span>
              <span className={`text-xl font-bold sm:text-2xl ${s.valueClass}`}>{stats[s.key]}</span>
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <span className="text-xs font-medium text-slate-400 transition-colors group-hover:text-red-600">
                Ver →
              </span>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
