import { describe, expect, it } from "vitest";
import { wrapWordsToLines } from "./paragraphLayout";

// Medidor determinista para tests: ancho = número de caracteres (sin depender
// de canvas/DOM real), suficiente para verificar la lógica de empaquetado.
const charWidthMeasurer = (text: string) => text.length;

describe("wrapWordsToLines", () => {
  it("devuelve exactamente targetLines líneas cuando hay palabras suficientes", () => {
    const words = "uno dos tres cuatro cinco seis siete ocho nueve diez".split(" ");
    const lines = wrapWordsToLines(words, charWidthMeasurer, 12, 4);
    expect(lines).toHaveLength(4);
  });

  it("ninguna línea excede el ancho máximo dado", () => {
    const words = "uno dos tres cuatro cinco seis siete ocho nueve diez".split(" ");
    const maxWidth = 12;
    const lines = wrapWordsToLines(words, charWidthMeasurer, maxWidth, 4);
    for (const line of lines) {
      expect(charWidthMeasurer(line)).toBeLessThanOrEqual(maxWidth);
    }
  });

  it("recicla la lista de palabras desde el inicio si no alcanzan para llenar targetLines", () => {
    const words = ["hola", "mundo"];
    // maxWidth apenas alcanza para una palabra por línea, forzando que las 2
    // palabras no basten para 4 líneas y deban reciclarse desde el inicio.
    const lines = wrapWordsToLines(words, charWidthMeasurer, 5, 4);
    expect(lines).toHaveLength(4);
    expect(lines).toEqual(["hola", "mundo", "hola", "mundo"]);
  });

  it("coloca una palabra más ancha que maxWidth en su propia línea en vez de bloquearse", () => {
    const words = ["supercalifragilisticoso", "a", "b", "c"];
    const lines = wrapWordsToLines(words, charWidthMeasurer, 5, 4);
    expect(lines[0]).toBe("supercalifragilisticoso");
    expect(lines).toHaveLength(4);
  });

  it("devuelve arreglo vacío si no hay palabras o targetLines es 0", () => {
    expect(wrapWordsToLines([], charWidthMeasurer, 100, 4)).toEqual([]);
    expect(wrapWordsToLines(["a"], charWidthMeasurer, 100, 0)).toEqual([]);
  });

  it("regresión: llena targetLines aunque el contenedor sea muy ancho respecto a las palabras (fuente pequeña + pantalla ancha)", () => {
    // Reproduce el bug real: un párrafo corto (24 palabras) en un contenedor
    // muy ancho respecto al tamaño de fuente necesita reciclar la lista de
    // palabras muchas más veces que `words.length * targetLines` para llenar
    // 4 líneas — antes la cota de seguridad cortaba el reciclado y devolvía
    // solo 3 líneas en vez de 4.
    const words =
      'La escuela organiza un concurso de lectura cada año y los niños practican con libros nuevos durante varias semanas'.split(
        ' ',
      );
    // maxWidth muy generoso respecto al ancho de una palabra (measurer = chars)
    // para forzar que cientos de "pasos" de palabra quepan en una sola línea.
    const lines = wrapWordsToLines(words, charWidthMeasurer, 2000, 4);
    expect(lines).toHaveLength(4);
  });
});
