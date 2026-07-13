import { describe, expect, it } from "vitest";
import { asMUnit } from "./types";
import { approxJaegerFromMUnit, approxNFromMUnit, formatApproxNotation } from "./jaegerTable";

describe("approxJaegerFromMUnit / approxNFromMUnit (equivalencia aproximada, no estandarizada)", () => {
  it("1.0M mapea a ≈J5 / ≈N6, consistente con la fuente citada", () => {
    expect(approxJaegerFromMUnit(asMUnit(1.0))).toEqual({ value: 5, outOfRange: null });
    expect(approxNFromMUnit(asMUnit(1.0))).toEqual({ value: 6, outOfRange: null });
  });

  it("0.5M mapea a ≈J1 / ≈N4.5 (letra más pequeña, mejor agudeza)", () => {
    expect(approxJaegerFromMUnit(asMUnit(0.5))).toEqual({ value: 1, outOfRange: null });
    expect(approxNFromMUnit(asMUnit(0.5))).toEqual({ value: 4.5, outOfRange: null });
  });

  it("valores M intermedios eligen la fila más cercana por distancia logarítmica", () => {
    // En escala logarítmica 0.9M está más cerca de 1.0M (J5) que de 0.8M (J3):
    // |ln(0.9/1.0)| ≈ 0.105 < |ln(0.9/0.8)| ≈ 0.118.
    expect(approxJaegerFromMUnit(asMUnit(0.9)).value).toBe(5);
  });

  it("un M muy por encima del rango de la tabla se marca outOfRange 'above', no un valor falso preciso", () => {
    const result = approxJaegerFromMUnit(asMUnit(4.0));
    expect(result.outOfRange).toBe('above');
    expect(formatApproxNotation('J', result)).toBe('>J10');
  });

  it("un M muy por debajo del rango de la tabla se marca outOfRange 'below'", () => {
    const result = approxJaegerFromMUnit(asMUnit(0.1));
    expect(result.outOfRange).toBe('below');
    expect(formatApproxNotation('J', result)).toBe('<J1');
  });

  it("dentro del rango de la tabla se formatea con el prefijo de aproximación ≈", () => {
    const result = approxJaegerFromMUnit(asMUnit(1.0));
    expect(formatApproxNotation('J', result)).toBe('≈J5');
  });
});
