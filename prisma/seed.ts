import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function fechaEnDias(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Sembrando datos de prueba...");

  // --- Limpieza de datos previos (extintores, ubicaciones e historial) ---
  // Se borran en este orden porque Ubicacion -> Extintor no tiene cascade.
  // Extintor -> Inspeccion -> RespuestaInspeccion sí tienen cascade en el
  // schema, así que borrar los extintores arrastra su historial.
  await prisma.extintor.deleteMany();
  await prisma.ubicacion.deleteMany();
  console.log("Datos anteriores de extintores/ubicaciones eliminados.");

  // --- Usuarios (se conservan si ya existían) ---
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordInspector = await bcrypt.hash("inspector123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@escuela.edu" },
    update: {},
    create: {
      nombre: "Administrador General",
      email: "admin@escuela.edu",
      passwordHash: passwordAdmin,
      rol: "ADMINISTRADOR",
    },
  });

  const inspector = await prisma.usuario.upsert({
    where: { email: "inspector@escuela.edu" },
    update: {},
    create: {
      nombre: "Inspector de Turno",
      email: "inspector@escuela.edu",
      passwordHash: passwordInspector,
      rol: "INSPECTOR",
    },
  });

  // --- Ubicaciones: zonas típicas de una institución educativa ---
  const [
    ubPasilloPrincipal,
    ubRecepcion,
    ubAula101,
    ubBiblioteca,
    ubComedor,
    ubCocina,
    ubSalaProfesores,
    ubLabCiencias,
    ubLabInformatica,
    ubGimnasio,
  ] = await Promise.all([
    prisma.ubicacion.create({
      data: { edificio: "Edificio A", piso: "Planta baja", area: "Pasillo principal" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio A", piso: "Planta baja", area: "Recepción / Dirección" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio A", piso: "1er piso", area: "Aula 101" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio A", piso: "1er piso", area: "Biblioteca" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio B", piso: "Planta baja", area: "Comedor / Cafetería" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio B", piso: "Planta baja", area: "Cocina" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio B", piso: "1er piso", area: "Sala de profesores" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio C", piso: "Planta baja", area: "Laboratorio de ciencias" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio C", piso: "1er piso", area: "Laboratorio de informática" },
    }),
    prisma.ubicacion.create({
      data: { edificio: "Edificio C", piso: "Planta baja", area: "Gimnasio / Salón de usos múltiples" },
    }),
  ]);

  console.log("10 ubicaciones creadas.");

  // --- Extintores: EXT-001 a EXT-010, códigos y series fijos ---
  const extintoresData = [
    {
      codigo: "EXT-001",
      numeroSerie: "SN-2026-0001",
      ubicacionId: ubPasilloPrincipal.id,
      ubicacionDescripcion: "Pasillo frente al laboratorio",
      tipoAgente: "CO2" as const,
      capacidad: 4.5,
      unidadCapacidad: "KG" as const,
      fechaFabricacion: new Date("2025-03-01"),
      fechaRecarga: new Date("2026-03-15"),
      fechaVencimiento: new Date("2027-03-15"),
      tipoServicio: "RECARGA" as const,
      observaciones: "Extintor de ejemplo del enunciado original.",
    },
    {
      codigo: "EXT-002",
      numeroSerie: "SN-2026-0002",
      ubicacionId: ubRecepcion.id,
      ubicacionDescripcion: "Junto a la puerta de entrada principal",
      tipoAgente: "PQS" as const,
      capacidad: 5,
      unidadCapacidad: "KG" as const,
      fechaFabricacion: new Date("2024-06-01"),
      fechaRecarga: fechaEnDias(-165),
      fechaVencimiento: fechaEnDias(200),
      tipoServicio: "NUEVO" as const,
    },
    {
      codigo: "EXT-003",
      numeroSerie: "SN-2026-0003",
      ubicacionId: ubAula101.id,
      ubicacionDescripcion: "Junto a la puerta del aula",
      tipoAgente: "AGUA" as const,
      capacidad: 9,
      unidadCapacidad: "L" as const,
      fechaFabricacion: new Date("2023-04-10"),
      fechaRecarga: fechaEnDias(-350),
      fechaVencimiento: fechaEnDias(15),
      tipoServicio: "MANTENIMIENTO" as const,
      observaciones: "Próximo a vencer, programar recarga.",
    },
    {
      codigo: "EXT-004",
      numeroSerie: "SN-2026-0004",
      ubicacionId: ubBiblioteca.id,
      ubicacionDescripcion: "Entrada de la biblioteca",
      tipoAgente: "CO2" as const,
      capacidad: 5,
      unidadCapacidad: "KG" as const,
      fechaFabricacion: new Date("2025-01-15"),
      fechaRecarga: fechaEnDias(-90),
      fechaVencimiento: fechaEnDias(270),
      tipoServicio: "INSPECCION" as const,
      observaciones: "CO2 elegido para no dañar el material bibliográfico.",
    },
    {
      codigo: "EXT-005",
      numeroSerie: "SN-2026-0005",
      ubicacionId: ubComedor.id,
      ubicacionDescripcion: "Pared junto a la salida del comedor",
      tipoAgente: "PQS" as const,
      capacidad: 5,
      unidadCapacidad: "KG" as const,
      fechaFabricacion: new Date("2021-05-20"),
      fechaRecarga: fechaEnDias(-410),
      fechaVencimiento: fechaEnDias(-40),
      tipoServicio: "RECARGA" as const,
      observaciones: "Vencido, requiere recarga urgente.",
    },
    {
      codigo: "EXT-006",
      numeroSerie: "SN-2026-0006",
      ubicacionId: ubCocina.id,
      ubicacionDescripcion: "Sobre la campana extractora",
      tipoAgente: "WET_CHEMICAL" as const,
      capacidad: 6,
      unidadCapacidad: "L" as const,
      fechaFabricacion: new Date("2025-02-10"),
      fechaRecarga: fechaEnDias(-100),
      fechaVencimiento: fechaEnDias(260),
      tipoServicio: "NUEVO" as const,
      observaciones: "Agente húmedo (clase K), apto para grasas de cocina.",
    },
    {
      codigo: "EXT-007",
      numeroSerie: "SN-2026-0007",
      ubicacionId: ubSalaProfesores.id,
      ubicacionDescripcion: "Pasillo del gimnasio",
      tipoAgente: "PQS_PURPURA_K" as const,
      capacidad: 5,
      unidadCapacidad: "KG" as const,
      fechaFabricacion: new Date("2024-11-01"),
      fechaRecarga: fechaEnDias(-60),
      fechaVencimiento: fechaEnDias(300),
      tipoServicio: "INSPECCION" as const,
      requiereMantenimiento: true,
      observaciones: "El manómetro marca fuera de rango.",
    },
    {
      codigo: "EXT-008",
      numeroSerie: "SN-2026-0008",
      ubicacionId: ubLabCiencias.id,
      ubicacionDescripcion: "Junto a la mesada principal",
      tipoAgente: "ESPUMA" as const,
      capacidad: 6,
      unidadCapacidad: "L" as const,
      fechaFabricacion: new Date("2023-01-10"),
      fechaRecarga: fechaEnDias(-345),
      fechaVencimiento: fechaEnDias(20),
      tipoServicio: "MANTENIMIENTO" as const,
      observaciones: "Programar recarga a la brevedad.",
    },
    {
      codigo: "EXT-009",
      numeroSerie: "SN-2026-0009",
      ubicacionId: ubLabInformatica.id,
      ubicacionDescripcion: "Entrada del laboratorio",
      tipoAgente: "CO2" as const,
      capacidad: 5,
      unidadCapacidad: "KG" as const,
      fechaFabricacion: new Date("2025-06-01"),
      fechaRecarga: fechaEnDias(-45),
      fechaVencimiento: fechaEnDias(320),
      tipoServicio: "NUEVO" as const,
      observaciones: "CO2 elegido por la presencia de equipo eléctrico/electrónico.",
    },
    {
      codigo: "EXT-010",
      numeroSerie: "SN-2026-0010",
      ubicacionId: ubGimnasio.id,
      ubicacionDescripcion: "Depósito de mantenimiento del gimnasio",
      tipoAgente: "AGUA" as const,
      capacidad: 9,
      unidadCapacidad: "L" as const,
      fechaFabricacion: new Date("2020-08-15"),
      fechaRecarga: fechaEnDias(-400),
      fechaVencimiento: fechaEnDias(-10),
      tipoServicio: "RECARGA" as const,
      observaciones: "Vencido, requiere recarga urgente.",
    },
  ];

  const extintoresCreados = new Map<string, string>(); // codigo -> id
  for (const data of extintoresData) {
    const extintor = await prisma.extintor.create({ data });
    extintoresCreados.set(extintor.codigo, extintor.id);
  }

  console.log(`${extintoresData.length} extintores creados (EXT-001 a EXT-010).`);

  // --- Inspecciones de ejemplo ---
  await prisma.inspeccion.create({
    data: {
      extintorId: extintoresCreados.get("EXT-001")!,
      inspectorId: inspector.id,
      aprobada: true,
      observaciones: "Todo en orden durante la inspección mensual.",
      respuestas: {
        create: [
          { pregunta: "¿El extintor se encuentra en su lugar?", respuesta: "SI" },
          { pregunta: "¿El acceso al extintor está libre?", respuesta: "SI" },
          { pregunta: "¿El extintor presenta golpes o corrosión?", respuesta: "NO" },
          { pregunta: "¿El pasador de seguridad está colocado?", respuesta: "SI" },
          { pregunta: "¿El sello está intacto?", respuesta: "SI" },
          { pregunta: "¿La manguera está en buen estado?", respuesta: "SI" },
          { pregunta: "¿La etiqueta es legible?", respuesta: "SI" },
          { pregunta: "¿El manómetro está en rango correcto?", respuesta: "SI" },
          { pregunta: "¿El extintor se encuentra vigente?", respuesta: "SI" },
        ],
      },
    },
  });

  await prisma.inspeccion.create({
    data: {
      extintorId: extintoresCreados.get("EXT-004")!,
      inspectorId: inspector.id,
      aprobada: true,
      observaciones: "Sin novedades.",
      respuestas: {
        create: [
          { pregunta: "¿El extintor se encuentra en su lugar?", respuesta: "SI" },
          { pregunta: "¿El acceso al extintor está libre?", respuesta: "SI" },
          { pregunta: "¿El extintor presenta golpes o corrosión?", respuesta: "NO" },
          { pregunta: "¿El pasador de seguridad está colocado?", respuesta: "SI" },
          { pregunta: "¿El sello está intacto?", respuesta: "SI" },
          { pregunta: "¿La manguera está en buen estado?", respuesta: "SI" },
          { pregunta: "¿La etiqueta es legible?", respuesta: "SI" },
          { pregunta: "¿El manómetro está en rango correcto?", respuesta: "SI" },
          { pregunta: "¿El extintor se encuentra vigente?", respuesta: "SI" },
        ],
      },
    },
  });

  // Inspección que detectó el problema de EXT-007
  await prisma.inspeccion.create({
    data: {
      extintorId: extintoresCreados.get("EXT-007")!,
      inspectorId: inspector.id,
      aprobada: false,
      observaciones: "El manómetro marca fuera de rango, se solicitó mantenimiento.",
      respuestas: {
        create: [
          { pregunta: "¿El extintor se encuentra en su lugar?", respuesta: "SI" },
          { pregunta: "¿El acceso al extintor está libre?", respuesta: "SI" },
          { pregunta: "¿El extintor presenta golpes o corrosión?", respuesta: "NO" },
          { pregunta: "¿El pasador de seguridad está colocado?", respuesta: "SI" },
          { pregunta: "¿El sello está intacto?", respuesta: "SI" },
          { pregunta: "¿La manguera está en buen estado?", respuesta: "SI" },
          { pregunta: "¿La etiqueta es legible?", respuesta: "SI" },
          { pregunta: "¿El manómetro está en rango correcto?", respuesta: "NO" },
          { pregunta: "¿El extintor se encuentra vigente?", respuesta: "SI" },
        ],
      },
    },
  });

  console.log("Seed completado:");
  console.log(`  Admin:      ${admin.email} / admin123`);
  console.log(`  Inspector:  ${inspector.email} / inspector123`);
  console.log(`  Ubicaciones: 10`);
  console.log(`  Extintores:  ${[...extintoresCreados.keys()].join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
