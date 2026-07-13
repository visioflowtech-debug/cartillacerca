import { asMUnit, type LogMAR, type MUnit } from "./types";
import { logMarFromReading, STANDARD_TEST_DISTANCE_M } from "./conversions";

export interface AcuityLine {
  /** Índice de línea, 0 = la más grande (más fácil). */
  index: number;
  m: MUnit;
  /** logMAR de esta línea a la distancia estándar de examen (0.4 m). */
  logMar: LogMAR;
}

/**
 * Genera la progresión de líneas de tamaño en pasos logMAR consistentes de 0.1
 * (factor 10^0.1 ≈ 1.2589 entre líneas consecutivas), de mayor a menor tamaño —
 * evitando los saltos irregulares de la notación Jaeger tradicional, tal como
 * pide el encargo. Los M-units se derivan a partir del logMAR objetivo evaluado
 * a la distancia estándar de examen (0.4 m): M = distancia × 10^logMAR.
 *
 * @param logMarMax logMAR de la línea más grande (por defecto 1.0 ≈ 20/200 equiv.)
 * @param logMarMin logMAR de la línea más pequeña (por defecto -0.1 ≈ 20/16 equiv.)
 * @param stepLogMar tamaño de paso logMAR entre líneas (por defecto 0.1)
 */
export function generateAcuityProgression(
  logMarMax = 1.0,
  logMarMin = -0.1,
  stepLogMar = 0.1,
): AcuityLine[] {
  const lines: AcuityLine[] = [];
  const steps = Math.round((logMarMax - logMarMin) / stepLogMar);
  for (let i = 0; i <= steps; i++) {
    const logMar = Math.round((logMarMax - i * stepLogMar) * 100) / 100;
    const m = asMUnit(STANDARD_TEST_DISTANCE_M * Math.pow(10, logMar));
    lines.push({ index: i, m, logMar: logMar as LogMAR });
  }
  return lines;
}

/**
 * Conjunto fijo de tamaños M mostrados en la cartilla de examen, elegido por
 * el clínico en vez de la progresión logMAR automática de 0.1 en 0.1. Los
 * valores no siguen un paso logarítmico constante — se muestran tal cual se
 * definieron.
 */
export const CARD_M_VALUES: number[] = [2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5];

/** Construye líneas de examen a partir de una lista explícita de valores M. */
export function buildLinesFromMValues(
  mValues: number[],
  testDistanceM = STANDARD_TEST_DISTANCE_M,
): AcuityLine[] {
  return mValues.map((value, index) => {
    const m = asMUnit(value);
    return { index, m, logMar: logMarFromReading(m, testDistanceM) };
  });
}
