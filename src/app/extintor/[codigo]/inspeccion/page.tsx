import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { obtenerExtintorPorCodigo } from "@/lib/services/extintor.service";
import { InspeccionForm } from "@/components/extintor/InspeccionForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ codigo: string }>;
}

export default async function InspeccionPage({ params }: Props) {
  const { codigo } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?redirect=/extintor/${codigo}/inspeccion`);

  const extintor = await obtenerExtintorPorCodigo(codigo);
  if (!extintor) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-medium text-slate-500">Inspección de</p>
          <h1 className="text-2xl font-bold text-slate-900">{extintor.codigo}</h1>
          <p className="text-sm text-slate-500">
            {extintor.ubicacion.edificio} · {extintor.ubicacion.piso} · {extintor.ubicacion.area}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-5">
        <InspeccionForm codigo={extintor.codigo} />
      </div>
    </div>
  );
}
