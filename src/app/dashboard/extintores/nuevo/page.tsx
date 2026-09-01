import { prisma } from "@/lib/prisma";
import { sugerirCodigoYSerie } from "@/lib/services/extintor.service";
import { ExtintorForm } from "@/components/extintor/ExtintorForm";

export const dynamic = "force-dynamic";

export default async function NuevoExtintorPage() {
  const [ubicaciones, sugerencia] = await Promise.all([
    prisma.ubicacion.findMany({
      orderBy: [{ edificio: "asc" }, { piso: "asc" }, { area: "asc" }],
    }),
    sugerirCodigoYSerie(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo extintor</h1>
        <p className="text-sm text-slate-500">Registrá un extintor nuevo en el sistema.</p>
      </div>
      <ExtintorForm
        modo="crear"
        ubicaciones={ubicaciones}
        codigoSugerido={sugerencia.codigo}
        numeroSerieSugerido={sugerencia.numeroSerie}
      />
    </div>
  );
}
