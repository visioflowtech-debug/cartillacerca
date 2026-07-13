// Branded types para evitar mezclar unidades de agudeza visual por error de tipado.
// Cada valor numérico "crudo" se envuelve para que el compilador exija pasar por las
// funciones de conversion.ts en vez de operar directamente con un `number` ambiguo.

declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

/** Tamaño de optotipo en M-units (Sloan). 1M = letra que subtiende 5' de arco a 1 m. */
export type MUnit = Brand<number, "MUnit">;

/** logMAR: log10(Minimum Angle of Resolution). 0.0 = 20/20. Menor es mejor. */
export type LogMAR = Brand<number, "LogMAR">;

/** Fracción Snellen normalizada a numerador 20 (p. ej. 40 representa 20/40). */
export type SnellenDenominator20 = Brand<number, "SnellenDenominator20">;

/** Notación N (Reino Unido/Australia), p. ej. 8 representa "N8". */
export type NNotation = Brand<number, "NNotation">;

/** Notación Jaeger, p. ej. 5 representa "J5". No estandarizada entre fabricantes. */
export type JaegerNotation = Brand<number, "JaegerNotation">;

export function asMUnit(value: number): MUnit {
  return value as MUnit;
}

export function asLogMAR(value: number): LogMAR {
  return value as LogMAR;
}
