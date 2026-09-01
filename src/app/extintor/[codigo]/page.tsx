import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerExtintorPorCodigo } from "@/lib/services/extintor.service";
import { listarInspecciones } from "@/lib/services/inspeccion.service";
import { getSession } from "@/lib/auth";
import { EstadoBadge } from "@/components/extintor/EstadoBadge";
import { ExtintorIcon } from "@/components/extintor/ExtintorIcon";
import { InspeccionHistorial } from "@/components/extintor/InspeccionHistorial";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatearFecha } from "@/lib/utils";
import { labelTipoAgente, labelTipoServicio } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ codigo: string }>;
}

export default async function FichaExtintorPage({ params }: Props) {
  const { codigo } = await params;
  const [extintor, session] = await Promise.all([
    obtenerExtintorPorCodigo(codigo),
    getSession(),
  ]);

  if (!extintor) notFound();

  const inspecciones = await listarInspecciones(extintor.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {session ? (
                <Link href="/dashboard" className="hover:underline">
                  ← Volver al panel
                </Link>
              ) : (
                "Ficha del extintor"
              )}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{extintor.codigo}</h1>
          </div>
          <EstadoBadge estadoInfo={extintor.estadoInfo} />
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <Card className="overflow-hidden">
          {extintor.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={extintor.foto} alt={extintor.codigo} className="h-56 w-full object-cover" />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-slate-100">
              <ExtintorIcon className="h-20 w-20 text-slate-300" />
            </div>
          )}
        </Card>

        {extintor.problemasDetectados.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardBody className="space-y-1.5">
              <h2 className="text-sm font-semibold text-amber-800">
                ⚠ Qué se detectó en la última inspección
              </h2>
              <ul className="list-disc space-y-0.5 pl-4 text-sm text-amber-800">
                {extintor.problemasDetectados.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ubicación
            </h2>
            <p className="font-medium text-slate-900">{extintor.ubicacion.edificio}</p>
            <p className="text-slate-600">{extintor.ubicacion.piso}</p>
            <p className="text-slate-600">{extintor.ubicacion.area}</p>
            {extintor.ubicacionDescripcion && (
              <p className="pt-1 text-sm text-slate-500">{extintor.ubicacionDescripcion}</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Información
            </h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-500">Agente</dt>
              <dd className="text-right font-medium text-slate-900">
                {labelTipoAgente(extintor.tipoAgente)}
              </dd>
              <dt className="text-slate-500">Capacidad</dt>
              <dd className="text-right font-medium text-slate-900">
                {extintor.capacidad} {extintor.unidadCapacidad === "KG" ? "kg" : "L"}
              </dd>
              <dt className="text-slate-500">Número de serie</dt>
              <dd className="text-right font-medium text-slate-900">
                {extintor.numeroSerie || "—"}
              </dd>
              <dt className="text-slate-500">Última recarga</dt>
              <dd className="text-right font-medium text-slate-900">
                {formatearFecha(extintor.fechaRecarga)}
              </dd>
              <dt className="text-slate-500">Vencimiento</dt>
              <dd className="text-right font-medium text-slate-900">
                {formatearFecha(extintor.fechaVencimiento)}
              </dd>
              <dt className="text-slate-500">Último servicio</dt>
              <dd className="text-right font-medium text-slate-900">
                {labelTipoServicio(extintor.tipoServicio)}
              </dd>
            </dl>
            {extintor.observaciones && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {extintor.observaciones}
              </p>
            )}
          </CardBody>
        </Card>

        {session ? (
          <Link href={`/extintor/${extintor.codigo}/inspeccion`} className="block">
            <Button className="w-full" size="lg">
              Realizar inspección
            </Button>
          </Link>
        ) : (
          <Card>
            <CardBody className="text-center text-sm text-slate-500">
              <Link href={`/login?redirect=/extintor/${extintor.codigo}/inspeccion`} className="font-medium text-red-600 hover:underline">
                Iniciá sesión
              </Link>{" "}
              para registrar una inspección.
            </CardBody>
          </Card>
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Historial de inspecciones
          </h2>
          <InspeccionHistorial inspecciones={inspecciones} />
        </div>
      </div>
    </div>
  );
}
