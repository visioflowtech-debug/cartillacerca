import { describe, expect, it } from "vitest";
import { asMUnit } from "./types";
import {
  acuityFromReading,
  logMarFromReading,
  logMarToSnellenDenominator,
  mUnitToMm,
  snellenDenominatorToLogMar,
  STANDARD_TEST_DISTANCE_M,
} from "./conversions";

describe("mUnitToMm", () => {
  it("1M subtiende 5' de arco a 1 m => ~1.4544 mm de altura", () => {
    // Fuente: definición de Sloan del sistema M (webeye.ophth.uiowa.edu/eyeforum).
    expect(mUnitToMm(asMUnit(1))).toBeCloseTo(1.4544, 3);
  });

  it("una letra 20/20 a 6 m mide ~8.73 mm (verificación cruzada independiente)", () => {
    // 6 M-units equivalen a una letra que subtiende 5' de arco a 6 m (20/20 a 6 m).
    expect(mUnitToMm(asMUnit(6))).toBeCloseTo(8.73, 1);
  });

  it("escala linealmente con M", () => {
    expect(mUnitToMm(asMUnit(2))).toBeCloseTo(mUnitToMm(asMUnit(1)) * 2, 6);
  });
});

describe("acuityFromReading / logMarFromReading a distancia estándar (0.4 m)", () => {
  it("1.0M leído a 0.40 m da agudeza decimal 0.40 (Snellen 20/50)", () => {
    const acuity = acuityFromReading(asMUnit(1.0), STANDARD_TEST_DISTANCE_M);
    expect(acuity).toBeCloseTo(0.4, 5);
  });

  it("1.0M leído a 0.40 m da logMAR ≈ 0.40, coincidiendo con la tabla StatPearls (20/50)", () => {
    const logMar = logMarFromReading(asMUnit(1.0), STANDARD_TEST_DISTANCE_M);
    expect(logMar).toBeCloseTo(0.4, 2);
  });

  it("0.4M leído a 0.40 m da logMAR 0.00 (Snellen 20/20)", () => {
    const logMar = logMarFromReading(asMUnit(0.4), STANDARD_TEST_DISTANCE_M);
    expect(logMar).toBeCloseTo(0.0, 2);
  });

  it("una letra más pequeña que la leída a la misma distancia produce mejor (menor) logMAR", () => {
    const big = logMarFromReading(asMUnit(1.0), STANDARD_TEST_DISTANCE_M);
    const small = logMarFromReading(asMUnit(0.5), STANDARD_TEST_DISTANCE_M);
    expect(small).toBeLessThan(big);
  });
});

describe("logMAR <-> Snellen (tabla de referencia StatPearls NBK564307)", () => {
  const referenceTable: Array<[number, number]> = [
    [0.0, 20],
    [0.1, 25],
    [0.18, 30],
    [0.2, 32],
    [0.3, 40],
    [0.4, 50],
    [0.48, 60],
    [0.6, 80],
    [0.7, 100],
    [1.0, 200],
  ];

  it.each(referenceTable)("logMAR %s => Snellen 20/%s", (logMar, denominator) => {
    expect(logMarToSnellenDenominator(logMar as never)).toBeCloseTo(denominator, 0);
  });

  it.each(referenceTable)("Snellen 20/%s => logMAR %s (inverso)", (logMar, denominator) => {
    expect(snellenDenominatorToLogMar(denominator)).toBeCloseTo(logMar, 2);
  });
});
