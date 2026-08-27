import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getExtintorUrl } from "@/lib/qr";
import { Card, CardBody } from "@/components/ui/Card";
import { QrPrintButton } from "@/components/extintor/QrActions";

interface Props {
  params: Promise<{ codigo: string }>;
}

export default async function QrExtintorPage({ params }: Props) {
  const { codigo } = await params;
  const extintor = await prisma.extintor.findUnique({ where: { codigo } });
  if (!extintor) notFound();

  const url = getExtintorUrl(codigo);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Código QR — {codigo}</h1>
        <p className="text-sm text-slate-500">
          Pegá este código en el extintor físico. Al escanearlo se abre su ficha.
        </p>
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardBody className="flex flex-col items-center gap-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/extintores/${codigo}/qr`}
            alt={`Código QR de ${codigo}`}
            width={280}
            height={280}
            className="h-64 w-64"
          />
          <div>
            <p className="text-lg font-bold text-slate-900">{codigo}</p>
            <p className="break-all text-xs text-slate-500">{url}</p>
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <a href={`/api/extintores/${codigo}/qr`} download={`qr-${codigo}.png`}>
          <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Descargar QR
          </button>
        </a>
        <QrPrintButton />
        <Link
          href={`/extintor/${codigo}`}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Ver ficha
        </Link>
      </div>
    </div>
  );
}
