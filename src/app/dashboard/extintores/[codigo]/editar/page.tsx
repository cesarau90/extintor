import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerExtintorPorCodigo } from "@/lib/services/extintor.service";
import { ExtintorForm } from "@/components/extintor/ExtintorForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ codigo: string }>;
}

export default async function EditarExtintorPage({ params }: Props) {
  const { codigo } = await params;
  const [extintor, ubicaciones] = await Promise.all([
    obtenerExtintorPorCodigo(codigo),
    prisma.ubicacion.findMany({ orderBy: [{ edificio: "asc" }, { piso: "asc" }, { area: "asc" }] }),
  ]);

  if (!extintor) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar {extintor.codigo}</h1>
        <p className="text-sm text-slate-500">Actualizá los datos del extintor.</p>
      </div>
      <ExtintorForm modo="editar" ubicaciones={ubicaciones} extintor={extintor} />
    </div>
  );
}
