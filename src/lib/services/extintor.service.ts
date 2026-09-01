import { prisma } from "@/lib/prisma";
import { calcularEstado, DIAS_ALERTA_VENCIMIENTO } from "@/lib/estado";
import { esRespuestaProblema } from "@/lib/constants";
import type { ExtintorConEstado } from "@/types";
import type { Prisma } from "@prisma/client";

const INCLUDE_ULTIMA_INSPECCION = {
  ubicacion: true,
  inspecciones: {
    select: { fecha: true, respuestas: { select: { pregunta: true, respuesta: true } } },
    orderBy: { fecha: "desc" as const },
    take: 1,
  },
} satisfies Prisma.ExtintorInclude;

function conEstado(
  extintor: Prisma.ExtintorGetPayload<{ include: typeof INCLUDE_ULTIMA_INSPECCION }>
): ExtintorConEstado {
  const { inspecciones, ...resto } = extintor;
  const ultimaInspeccion = inspecciones[0];

  // Los problemas puntuales solo se pueden mostrar si el estado actual
  // "requiere mantenimiento" viene de esa última inspección: si alguien
  // prendió la bandera a mano desde el formulario, no hay checklist que
  // explique el motivo.
  const problemasDetectados =
    extintor.requiereMantenimiento && ultimaInspeccion
      ? ultimaInspeccion.respuestas
          .filter((r) => esRespuestaProblema(r.pregunta, r.respuesta))
          .map((r) => r.pregunta)
      : [];

  return {
    ...resto,
    estadoInfo: calcularEstado({
      fechaVencimiento: extintor.fechaVencimiento,
      requiereMantenimiento: extintor.requiereMantenimiento,
    }),
    ultimaInspeccion: ultimaInspeccion?.fecha ?? null,
    problemasDetectados,
  };
}

export interface ExtintorFiltros {
  busqueda?: string;
  edificio?: string;
  estado?: string;
  tipoAgente?: string;
  incluirInactivos?: boolean;
}

export async function listarExtintores(
  filtros: ExtintorFiltros = {}
): Promise<ExtintorConEstado[]> {
  const where: Prisma.ExtintorWhereInput = {
    activo: filtros.incluirInactivos ? undefined : true,
  };

  if (filtros.busqueda) {
    where.OR = [
      { codigo: { contains: filtros.busqueda, mode: "insensitive" } },
      { numeroSerie: { contains: filtros.busqueda, mode: "insensitive" } },
      { ubicacionDescripcion: { contains: filtros.busqueda, mode: "insensitive" } },
    ];
  }

  if (filtros.tipoAgente) {
    where.tipoAgente = filtros.tipoAgente as Prisma.EnumTipoAgenteFilter["equals"];
  }

  if (filtros.edificio) {
    where.ubicacion = { edificio: filtros.edificio };
  }

  const extintores = await prisma.extintor.findMany({
    where,
    include: INCLUDE_ULTIMA_INSPECCION,
    orderBy: { codigo: "asc" },
  });

  let resultado = extintores.map(conEstado);

  if (filtros.estado === "ATENCION") {
    // Filtro combinado: cualquier extintor que no esté simplemente vigente
    // (vencido, próximo a vencer o que requiere mantenimiento).
    resultado = resultado.filter((e) => e.estadoInfo.estado !== "VIGENTE");
  } else if (filtros.estado) {
    resultado = resultado.filter((e) => e.estadoInfo.estado === filtros.estado);
  }

  return resultado;
}

export async function obtenerExtintorPorCodigo(
  codigo: string
): Promise<ExtintorConEstado | null> {
  const extintor = await prisma.extintor.findUnique({
    where: { codigo },
    include: INCLUDE_ULTIMA_INSPECCION,
  });
  if (!extintor) return null;
  return conEstado(extintor);
}

export async function calcularDashboardStats() {
  const extintores = await listarExtintores();
  const hoy = new Date();
  const treintaDiasAtras = new Date(hoy);
  treintaDiasAtras.setDate(hoy.getDate() - 30);

  const inspeccionesPendientes = extintores.filter(
    (e) => !e.ultimaInspeccion || e.ultimaInspeccion < treintaDiasAtras
  ).length;

  return {
    total: extintores.length,
    vigentes: extintores.filter((e) => e.estadoInfo.estado === "VIGENTE").length,
    proximosAVencer: extintores.filter((e) => e.estadoInfo.estado === "PROXIMO_A_VENCER")
      .length,
    vencidos: extintores.filter((e) => e.estadoInfo.estado === "VENCIDO").length,
    requierenMantenimiento: extintores.filter(
      (e) => e.estadoInfo.estado === "REQUIERE_MANTENIMIENTO"
    ).length,
    inspeccionesPendientes,
  };
}

/**
 * Sugiere el próximo código (EXT-###) y número de serie (SN-AAAA-####)
 * siguiendo la numeración ya usada, para que al crear un extintor no se
 * puedan escribir valores arbitrarios: el formulario los muestra fijos.
 */
export async function sugerirCodigoYSerie(): Promise<{
  codigo: string;
  numeroSerie: string;
}> {
  const extintores = await prisma.extintor.findMany({
    select: { codigo: true, numeroSerie: true },
  });

  let maxCodigo = 0;
  let maxSerie = 0;

  for (const e of extintores) {
    const mCodigo = e.codigo.match(/^EXT-(\d+)$/);
    if (mCodigo) maxCodigo = Math.max(maxCodigo, parseInt(mCodigo[1], 10));

    const mSerie = e.numeroSerie?.match(/^SN-\d{4}-(\d+)$/);
    if (mSerie) maxSerie = Math.max(maxSerie, parseInt(mSerie[1], 10));
  }

  const anio = new Date().getFullYear();

  return {
    codigo: `EXT-${String(maxCodigo + 1).padStart(3, "0")}`,
    numeroSerie: `SN-${anio}-${String(maxSerie + 1).padStart(4, "0")}`,
  };
}

export async function calcularAlertas() {
  const extintores = await listarExtintores();
  return {
    proximosAVencer: extintores.filter(
      (e) => e.estadoInfo.estado === "PROXIMO_A_VENCER"
    ),
    vencidos: extintores.filter((e) => e.estadoInfo.estado === "VENCIDO"),
    requierenMantenimiento: extintores.filter(
      (e) => e.estadoInfo.estado === "REQUIERE_MANTENIMIENTO"
    ),
    diasAlerta: DIAS_ALERTA_VENCIMIENTO,
  };
}
