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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((s) => (
        <Link key={s.key} href={s.href}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody className="flex flex-col gap-2">
              <span className="text-xl">{s.emoji}</span>
              <span className={`text-2xl font-bold ${s.valueClass}`}>{stats[s.key]}</span>
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
