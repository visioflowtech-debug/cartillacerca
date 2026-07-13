/**
 * Párrafos de contenido neutro para las líneas de lectura del examen.
 * Se evita contenido con carga emocional o sensible; se usan oraciones genéricas
 * sin relación con el paciente. El mismo texto se reutiliza en todas las líneas de
 * tamaño: lo único que cambia entre líneas es el tamaño físico del optotipo, nunca
 * el contenido.
 */
export const READING_TEXTS: Record<'es' | 'en', string> = {
  es: 'El sol brilla sobre el campo mientras el viento mueve las hojas de los árboles cercanos.',
  en: 'The sun shines over the field while the wind moves the leaves of the nearby trees.',
};
