/**
 * Empaqueta palabras en exactamente `targetLines` líneas que quepan dentro de
 * `maxWidthPx`, usando la función de medición de ancho real provista por el
 * llamador (normalmente basada en `canvas.measureText` con la misma fuente
 * que se va a renderizar, para que el corte de línea sea fiel al resultado
 * visual). Si las palabras disponibles no alcanzan para llenar las líneas
 * pedidas, se recicla la lista desde el inicio en vez de dejar líneas vacías
 * — el objetivo es mantener siempre el mismo número de líneas en pantalla,
 * como en una cartilla impresa donde cada tamaño ocupa el mismo espacio.
 */
export function wrapWordsToLines(
  words: string[],
  measureWidthPx: (text: string) => number,
  maxWidthPx: number,
  targetLines: number,
): string[] {
  if (words.length === 0 || targetLines <= 0) return [];

  const lines: string[] = [];
  let current = '';
  let wordIndex = 0;
  let cycles = 0;
  // Cota de seguridad generosa y fija (no proporcional a words.length): cuando
  // el contenedor es muy ancho respecto al tamaño de fuente (p. ej. tamaños M
  // pequeños en pantallas anchas), una sola línea cabe muchas más palabras que
  // el párrafo entero, y llenar `targetLines` líneas puede requerir reciclar
  // la lista de palabras muchas más veces que `words.length * targetLines`.
  const MAX_ITERATIONS = 5000;

  while (lines.length < targetLines && cycles <= MAX_ITERATIONS) {
    if (wordIndex >= words.length) {
      wordIndex = 0;
    }
    const word = words[wordIndex];
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measureWidthPx(candidate) <= maxWidthPx) {
      current = candidate;
      wordIndex++;
    } else {
      lines.push(current);
      current = '';
    }
    cycles++;
  }

  if (current && lines.length < targetLines) {
    lines.push(current);
  }

  return lines.slice(0, targetLines);
}
