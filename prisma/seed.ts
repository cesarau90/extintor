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

  // --- Usuarios ---
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

  // --- Ubicaciones ---
  const ubicacionA = await prisma.ubicacion.create({
    data: { edificio: "Edificio A", piso: "Planta baja", area: "Pasillo" },
  });

  const ubicacionB = await prisma.ubicacion.create({
    data: { edificio: "Edificio B", piso: "1er piso", area: "Sala de profesores" },
  });

  const ubicacionC = await prisma.ubicacion.create({
    data: { edificio: "Edificio C", piso: "2do piso", area: "Laboratorio de ciencias" },
  });

  // --- Extintores ---

  // EXT-001: extintor de ejemplo del enunciado (vigente)
  const ext001 = await prisma.extintor.create({
    data: {
      codigo: "EXT-001",
      numeroSerie: "SN-2026-0001",
      ubicacionId: ubicacionA.id,
      ubicacionDescripcion: "Pasillo frente al laboratorio",
      tipoAgente: "CO2",
      capacidad: 4.5,
      unidadCapacidad: "KG",
      fechaFabricacion: new Date("2025-03-01"),
      fechaRecarga: new Date("2026-03-15"),
      fechaVencimiento: new Date("2027-03-15"),
      tipoServicio: "RECARGA",
      observaciones: "Extintor de ejemplo cargado por el seed inicial.",
    },
  });

  // Vigente (vence en 200 días)
  const ext002 = await prisma.extintor.create({
    data: {
      codigo: "EXT-002",
      numeroSerie: "SN-2026-0002",
      ubicacionId: ubicacionB.id,
      ubicacionDescripcion: "Junto a la puerta de entrada",
      tipoAgente: "PQS",
      capacidad: 5,
      unidadCapacidad: "KG",
      fechaFabricacion: new Date("2024-06-01"),
      fechaRecarga: fechaEnDias(-165),
      fechaVencimiento: fechaEnDias(200),
      tipoServicio: "NUEVO",
    },
  });

  // Próximo a vencer (vence en 15 días)
  const ext003 = await prisma.extintor.create({
    data: {
      codigo: "EXT-003",
      numeroSerie: "SN-2026-0003",
      ubicacionId: ubicacionC.id,
      ubicacionDescripcion: "Junto a la mesada principal",
      tipoAgente: "ESPUMA",
      capacidad: 6,
      unidadCapacidad: "L",
      fechaFabricacion: new Date("2023-01-10"),
      fechaRecarga: fechaEnDias(-350),
      fechaVencimiento: fechaEnDias(15),
      tipoServicio: "MANTENIMIENTO",
      observaciones: "Programar recarga a la brevedad.",
    },
  });

  // Vencido (venció hace 40 días)
  const ext004 = await prisma.extintor.create({
    data: {
      codigo: "EXT-004",
      numeroSerie: "SN-2026-0004",
      ubicacionId: ubicacionA.id,
      ubicacionDescripcion: "Depósito de mantenimiento",
      tipoAgente: "AGUA",
      capacidad: 9,
      unidadCapacidad: "L",
      fechaFabricacion: new Date("2021-05-20"),
      fechaRecarga: fechaEnDias(-410),
      fechaVencimiento: fechaEnDias(-40),
      tipoServicio: "RECARGA",
      observaciones: "Vencido, requiere recarga urgente.",
    },
  });

  // Requiere mantenimiento (vigente pero con problema detectado en inspección)
  const ext005 = await prisma.extintor.create({
    data: {
      codigo: "EXT-005",
      numeroSerie: "SN-2026-0005",
      ubicacionId: ubicacionB.id,
      ubicacionDescripcion: "Pasillo del gimnasio",
      tipoAgente: "PQS_PURPURA_K",
      capacidad: 5,
      unidadCapacidad: "KG",
      fechaFabricacion: new Date("2024-11-01"),
      fechaRecarga: fechaEnDias(-60),
      fechaVencimiento: fechaEnDias(300),
      tipoServicio: "INSPECCION",
      requiereMantenimiento: true,
      observaciones: "El manómetro marca fuera de rango.",
    },
  });

  // --- Inspección de ejemplo para EXT-001 ---
  await prisma.inspeccion.create({
    data: {
      extintorId: ext001.id,
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

  // --- Inspección que detectó el problema de EXT-005 ---
  await prisma.inspeccion.create({
    data: {
      extintorId: ext005.id,
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
  console.log(
    `  Extintores: ${ext001.codigo}, ${ext002.codigo}, ${ext003.codigo}, ${ext004.codigo}, ${ext005.codigo}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
