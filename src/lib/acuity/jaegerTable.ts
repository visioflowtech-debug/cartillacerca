import type { JaegerNotation, LogMAR, MUnit, NNotation } from "./types";
import { logMarFromReading, STANDARD_TEST_DISTANCE_M } from "./conversions";

/**
 * ADVERTENCIA CLÍNICA: la notación Jaeger (J1, J2, ...) y, en menor medida, la
 * notación N (UK/Australia) NO están estandarizadas entre fabricantes de cartillas.
 * Distintas fuentes publican correspondencias distintas para el mismo tamaño físico
 * de letra (p. ej. algunas tablas asignan J5 a 1.0M, otras J6; N6 vs N8 para el mismo
 * Snellen 20/40). Esta tabla se basa en una única fuente citada y debe tratarse como
 * una EQUIVALENCIA APROXIMADA, nunca como fuente de verdad. El motor de cálculo real
 * de la app es M-unit/logMAR (ver conversions.ts); Jaeger y N son solo una capa de
 * visualización para que el clínico reconozca el resultado en el formato con el que
 * está familiarizado. Por eso en toda la UI se muestran con el prefijo "≈".
 *
 * Fuente de esta tabla: qvisionacademy.com/articles/visual-acuity-conversion
 * (consistente con las tablas de tipo Colenbrander reproducidas en múltiples fuentes
 * de optometría). Entradas sin dato de M-unit publicado en la fuente se interpolan
 * geométricamente entre los valores M vecinos conocidos y se marcan como tal.
 */
interface JaegerTableRow {
  m: MUnit;
  jaeger: JaegerNotation;
  n: NNotation;
  /** true si el valor de M fue interpolado (no venía directo en la fuente citada) */
  interpolated?: boolean;
}

export const JAEGER_TABLE: JaegerTableRow[] = [
  { m: 0.5 as MUnit, jaeger: 1 as JaegerNotation, n: 4.5 as NNotation },
  { m: 0.8 as MUnit, jaeger: 3 as JaegerNotation, n: 5 as NNotation },
  { m: 1.0 as MUnit, jaeger: 5 as JaegerNotation, n: 6 as NNotation },
  // N8/J6: la fuente no publica un M-unit directo para esta fila; se interpola
  // geométricamente entre 1.0M (N6/J5) y 1.2M (N10/J7).
  { m: 1.09 as MUnit, jaeger: 6 as JaegerNotation, n: 8 as NNotation, interpolated: true },
  { m: 1.2 as MUnit, jaeger: 7 as JaegerNotation, n: 10 as NNotation },
  // N12/J9: interpolado entre 1.2M (N10/J7) y 1.3M (N14/J10).
  { m: 1.25 as MUnit, jaeger: 9 as JaegerNotation, n: 12 as NNotation, interpolated: true },
  { m: 1.3 as MUnit, jaeger: 10 as JaegerNotation, n: 14 as NNotation },
];

const TABLE_MIN_M = JAEGER_TABLE[0].m;
const TABLE_MAX_M = JAEGER_TABLE[JAEGER_TABLE.length - 1].m;

function nearestRow(m: MUnit): JaegerTableRow {
  let best = JAEGER_TABLE[0];
  let bestDiff = Math.abs(Math.log(m / best.m));
  for (const row of JAEGER_TABLE) {
    const diff = Math.abs(Math.log(m / row.m));
    if (diff < bestDiff) {
      best = row;
      bestDiff = diff;
    }
  }
  return best;
}

/**
 * Un M fuera de [TABLE_MIN_M, TABLE_MAX_M] no tiene una fila cercana real en la
 * tabla citada: devolver la fila límite como si fuera una equivalencia precisa
 * daría una falsa sensación de precisión (p. ej. una letra de 4.0M —muy por
 * encima del rango cubierto por la fuente— no es "≈J10", es mucho más grande
 * que cualquier entrada de la tabla). Por eso el llamador debe mostrar el
 * prefijo "<" o ">" cuando `outOfRange` es true, en vez de un valor exacto.
 */
export interface ApproxNotationResult<T> {
  value: T;
  outOfRange: 'below' | 'above' | null;
}

function classifyRange(m: MUnit): 'below' | 'above' | null {
  if (m < TABLE_MIN_M) return 'below';
  if (m > TABLE_MAX_M) return 'above';
  return null;
}

/** Jaeger aproximado (≈) más cercano a un tamaño M dado, por distancia logarítmica. */
export function approxJaegerFromMUnit(m: MUnit): ApproxNotationResult<JaegerNotation> {
  return { value: nearestRow(m).jaeger, outOfRange: classifyRange(m) };
}

/** N-notation aproximada (≈) más cercana a un tamaño M dado. */
export function approxNFromMUnit(m: MUnit): ApproxNotationResult<NNotation> {
  return { value: nearestRow(m).n, outOfRange: classifyRange(m) };
}

/** Formatea un resultado de notación aproximada como "≈J5", ">J10" o "<J1". */
export function formatApproxNotation(prefix: string, result: ApproxNotationResult<number>): string {
  if (result.outOfRange === 'above') return `>${prefix}${result.value}`;
  if (result.outOfRange === 'below') return `<${prefix}${result.value}`;
  return `≈${prefix}${result.value}`;
}

/** Referencia informativa: logMAR de cada fila de la tabla a la distancia estándar de 0.4 m. */
export function jaegerTableWithLogMar(): Array<JaegerTableRow & { logMar: LogMAR }> {
  return JAEGER_TABLE.map((row) => ({
    ...row,
    logMar: logMarFromReading(row.m, STANDARD_TEST_DISTANCE_M),
  }));
}
