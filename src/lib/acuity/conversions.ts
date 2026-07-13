import { asLogMAR, asMUnit, type LogMAR, type MUnit } from "./types";

/**
 * Ángulo de referencia de la notación M (Sloan): 5 minutos de arco.
 * Fuente: definición de Louise Sloan del sistema M — "1M subtiende 5' de arco a 1 m".
 * (webeye.ophth.uiowa.edu/eyeforum — Visual Acuity Testing; consistente con el cálculo
 * estándar de letras Snellen: una letra 20/20 subtiende 5' de arco a 6 m ≈ 8.73 mm).
 */
const FIVE_ARCMIN_IN_RADIANS = ((5 / 60) * Math.PI) / 180;

/** mm por metro subtendidos por 5' de arco: tan(5') ≈ 0.00145444. */
export const MM_PER_METER_AT_5_ARCMIN = Math.tan(FIVE_ARCMIN_IN_RADIANS) * 1000;

/** Distancia estándar de examen de cerca usada por el Método A (cordón), en metros. */
export const STANDARD_TEST_DISTANCE_M = 0.4;

/**
 * Altura física (mm) de una letra de tamaño M dado.
 *
 * IMPORTANTE (corrección respecto al encargo original, verificada contra fuentes
 * oftalmológicas): la altura en mm de una letra "M" es una propiedad FIJA de esa letra,
 * definida únicamente por su valor M — NO depende de la distancia real a la que el
 * paciente esté siendo examinado. Lo que depende de la distancia de examen es la
 * AGUDEZA resultante (ver `acuityFromReading`), no el tamaño físico del optotipo.
 * Por eso este motor renderiza cada línea a su tamaño M fijo en mm y usa la distancia
 * de examen solo al calcular el resultado final.
 */
export function mUnitToMm(m: MUnit): number {
  return m * MM_PER_METER_AT_5_ARCMIN;
}

export function mmToMUnit(mm: number): MUnit {
  return asMUnit(mm / MM_PER_METER_AT_5_ARCMIN);
}

/**
 * Agudeza decimal resultante de leer una letra de tamaño `m` a `testDistanceM` metros.
 * Fórmula: agudeza = distancia_examen / M_letra.
 * Verificado: 1.0M leída a 0.40 m → 0.4/1.0 = 0.40 (equivalente Snellen 20/50).
 */
export function acuityFromReading(m: MUnit, testDistanceM: number): number {
  return testDistanceM / m;
}

/** logMAR = log10(M_letra / distancia_examen). Menor logMAR = mejor agudeza. */
export function logMarFromReading(m: MUnit, testDistanceM: number): LogMAR {
  return asLogMAR(Math.log10(m / testDistanceM));
}

/**
 * Denominador Snellen (numerador fijo 20) a partir de logMAR.
 * Fórmula estándar: logMAR = log10(denominador/20)  =>  denominador = 20 * 10^logMAR.
 * Verificado contra tabla StatPearls "Evaluation of Visual Acuity" (NBK564307):
 * logMAR 0.00 = 20/20, 0.30 = 20/40, 0.40 = 20/50, 1.00 = 20/200, etc.
 */
export function logMarToSnellenDenominator(logMar: LogMAR): number {
  return 20 * Math.pow(10, logMar);
}

export function snellenDenominatorToLogMar(denominator: number): LogMAR {
  return asLogMAR(Math.log10(denominator / 20));
}

// Nota: la notación N (UK/Australia) está basada en el tamaño en puntos de imprenta
// Times New Roman, no en una fórmula angular limpia derivable de M-units — las tablas
// publicadas muestran razones N/M inconsistentes entre sí (no estandarizado, igual que
// Jaeger). Por eso N-notation NO se calcula aquí con una fórmula: se deriva únicamente
// por búsqueda en la tabla citada de `jaegerTable.ts`, igual que Jaeger.
