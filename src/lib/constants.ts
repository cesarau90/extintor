export const TIPOS_AGENTE = [
  { value: "PQS", label: "PQS" },
  { value: "CO2", label: "CO2" },
  { value: "ESPUMA", label: "Espuma" },
  { value: "AGUA", label: "Agua" },
  { value: "HFC", label: "HFC" },
  { value: "PQS_PURPURA_K", label: "PQS Púrpura K" },
  { value: "WET_CHEMICAL", label: "Wet Chemical" },
  { value: "OTRO", label: "Otro" },
] as const;

export const UNIDADES_CAPACIDAD = [
  { value: "KG", label: "kg" },
  { value: "L", label: "L" },
] as const;

export const TIPOS_SERVICIO = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "RECARGA", label: "Recarga" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "INSPECCION", label: "Inspección" },
] as const;

/**
 * Checklist fijo utilizado en cada inspección.
 * `respuestaProblema` indica qué respuesta de esa pregunta representa un
 * problema detectado (dispara "Requiere mantenimiento"). La mayoría de las
 * preguntas son afirmativas ("Sí" = bien, "No" = problema), salvo la de
 * golpes/corrosión, que es negativa ("Sí" = problema).
 */
export const CHECKLIST_INSPECCION: { pregunta: string; respuestaProblema: "SI" | "NO" }[] = [
  { pregunta: "¿El extintor se encuentra en su lugar?", respuestaProblema: "NO" },
  { pregunta: "¿El acceso al extintor está libre?", respuestaProblema: "NO" },
  { pregunta: "¿El extintor presenta golpes o corrosión?", respuestaProblema: "SI" },
  { pregunta: "¿El pasador de seguridad está colocado?", respuestaProblema: "NO" },
  { pregunta: "¿El sello está intacto?", respuestaProblema: "NO" },
  { pregunta: "¿La manguera está en buen estado?", respuestaProblema: "NO" },
  { pregunta: "¿La etiqueta es legible?", respuestaProblema: "NO" },
  { pregunta: "¿El manómetro está en rango correcto?", respuestaProblema: "NO" },
  { pregunta: "¿El extintor se encuentra vigente?", respuestaProblema: "NO" },
];

export const PREGUNTAS_INSPECCION = CHECKLIST_INSPECCION.map((c) => c.pregunta);

const RESPUESTA_PROBLEMA_POR_PREGUNTA = new Map(
  CHECKLIST_INSPECCION.map((c) => [c.pregunta, c.respuestaProblema])
);

/** Indica si una respuesta puntual representa un problema para esa pregunta
 * (para la mayoría "No" es el problema, salvo "golpes o corrosión" que es
 * al revés: "Sí" es el problema). Usado tanto para decidir si una
 * inspección aprueba, como para mostrar qué se detectó. */
export function esRespuestaProblema(pregunta: string, respuesta: string): boolean {
  return RESPUESTA_PROBLEMA_POR_PREGUNTA.get(pregunta) === respuesta;
}

export function labelTipoAgente(value: string): string {
  return TIPOS_AGENTE.find((t) => t.value === value)?.label ?? value;
}

export function labelTipoServicio(value: string): string {
  return TIPOS_SERVICIO.find((t) => t.value === value)?.label ?? value;
}

export const EDIFICIOS_SUGERIDOS = ["Edificio A", "Edificio B", "Edificio C"];
