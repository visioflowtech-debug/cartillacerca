import { describe, expect, it } from "vitest";
import { buildLinesFromMValues, CARD_M_VALUES, generateAcuityProgression } from "./progression";
import { STANDARD_TEST_DISTANCE_M } from "./conversions";

describe("generateAcuityProgression", () => {
  it("genera líneas en orden descendente de tamaño (M decreciente)", () => {
    const lines = generateAcuityProgression();
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i].m).toBeLessThan(lines[i - 1].m);
    }
  });

  it("usa pasos logMAR constantes de 0.1 entre líneas consecutivas", () => {
    const lines = generateAcuityProgression();
    for (let i = 1; i < lines.length; i++) {
      const step = lines[i - 1].logMar - lines[i].logMar;
      expect(step).toBeCloseTo(0.1, 5);
    }
  });

  it("el ratio de M entre líneas consecutivas es 10^0.1 (~1.2589), no saltos irregulares", () => {
    const lines = generateAcuityProgression();
    const expectedRatio = Math.pow(10, 0.1);
    for (let i = 1; i < lines.length; i++) {
      const ratio = lines[i - 1].m / lines[i].m;
      expect(ratio).toBeCloseTo(expectedRatio, 5);
    }
  });

  it("respeta los límites logMarMax/logMarMin solicitados", () => {
    const lines = generateAcuityProgression(0.5, 0.0, 0.1);
    expect(lines[0].logMar).toBeCloseTo(0.5, 5);
    expect(lines[lines.length - 1].logMar).toBeCloseTo(0.0, 5);
  });
});

describe("buildLinesFromMValues", () => {
  it("preserva el orden y los valores M exactos de la lista dada, sin recalcularlos", () => {
    const lines = buildLinesFromMValues(CARD_M_VALUES);
    expect(lines.map((l) => l.m)).toEqual(CARD_M_VALUES);
  });

  it("CARD_M_VALUES es el conjunto fijo de 7 tamaños pedido por el clínico", () => {
    expect(CARD_M_VALUES).toEqual([2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5]);
  });

  it("calcula logMAR de cada línea a la distancia de examen dada (log10(M/distancia))", () => {
    const lines = buildLinesFromMValues([1.0], STANDARD_TEST_DISTANCE_M);
    expect(lines[0].logMar).toBeCloseTo(0.4, 2); // 1.0M a 0.4m => logMAR ≈0.40 (20/50)
  });

  it("usa la distancia estándar (0.4m) por defecto si no se especifica otra", () => {
    const withDefault = buildLinesFromMValues([1.0]);
    const withExplicitStandard = buildLinesFromMValues([1.0], STANDARD_TEST_DISTANCE_M);
    expect(withDefault[0].logMar).toBeCloseTo(withExplicitStandard[0].logMar, 10);
  });
});
