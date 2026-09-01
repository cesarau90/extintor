import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listarExtintores } from "@/lib/services/extintor.service";
import { getSession } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExtintoresFiltros } from "@/components/dashboard/ExtintoresFiltros";
import { ExtintoresTable } from "@/components/dashboard/ExtintoresTable";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    busqueda?: string;
    edificio?: string;
    estado?: string;
    tipoAgente?: string;
  }>;
}

export default async function ExtintoresPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getSession();

  const [extintores, ubicaciones] = await Promise.all([
    listarExtintores(params),
    prisma.ubicacion.findMany({ select: { edificio: true }, distinct: ["edificio"] }),
  ]);

  const edificios = ubicaciones.map((u) => u.edificio).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Extintores</h1>
          <p className="text-sm text-slate-500">
            {extintores.length} extintor{extintores.length === 1 ? "" : "es"} encontrado
            {extintores.length === 1 ? "" : "s"}.
          </p>
        </div>
        {session?.rol === "ADMINISTRADOR" && (
          <Link href="/dashboard/extintores/nuevo" className="shrink-0">
            <Button className="w-full sm:w-auto">+ Nuevo extintor</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardBody>
          <ExtintoresFiltros edificios={edificios} />
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400 sm:hidden">
          Desliza hacia los costados para ver toda la tabla →
        </p>
        <ExtintoresTable extintores={extintores} rol={session!.rol} />
      </Card>
    </div>
  );
}
