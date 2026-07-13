import { describe, expect, it } from "vitest";
import { generateAcuityProgression } from "./progression";

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
