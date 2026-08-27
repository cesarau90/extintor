-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "TipoAgente" AS ENUM ('PQS', 'CO2', 'ESPUMA', 'AGUA', 'HFC', 'PQS_PURPURA_K', 'WET_CHEMICAL', 'OTRO');

-- CreateEnum
CREATE TYPE "UnidadCapacidad" AS ENUM ('KG', 'L');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('NUEVO', 'RECARGA', 'MANTENIMIENTO', 'INSPECCION');

-- CreateEnum
CREATE TYPE "RespuestaChecklist" AS ENUM ('SI', 'NO', 'NO_APLICA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'INSPECTOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" TEXT NOT NULL,
    "edificio" TEXT NOT NULL,
    "piso" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extintores" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "ubicacionId" TEXT NOT NULL,
    "ubicacionDescripcion" TEXT,
    "tipoAgente" "TipoAgente" NOT NULL,
    "capacidad" DOUBLE PRECISION NOT NULL,
    "unidadCapacidad" "UnidadCapacidad" NOT NULL,
    "fechaFabricacion" TIMESTAMP(3),
    "fechaRecarga" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "tipoServicio" "TipoServicio" NOT NULL DEFAULT 'NUEVO',
    "requiereMantenimiento" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "foto" TEXT,
    "observaciones" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extintores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspecciones" (
    "id" TEXT NOT NULL,
    "extintorId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aprobada" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "foto" TEXT,

    CONSTRAINT "inspecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_inspeccion" (
    "id" TEXT NOT NULL,
    "inspeccionId" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" "RespuestaChecklist" NOT NULL,

    CONSTRAINT "respuestas_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "extintores_codigo_key" ON "extintores"("codigo");

-- AddForeignKey
ALTER TABLE "extintores" ADD CONSTRAINT "extintores_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_extintorId_fkey" FOREIGN KEY ("extintorId") REFERENCES "extintores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_inspeccion" ADD CONSTRAINT "respuestas_inspeccion_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
