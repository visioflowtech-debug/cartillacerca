import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MUnit } from '../lib/acuity/types';
import { mUnitToMm } from '../lib/acuity/conversions';
import { fontSizeForXHeightPx, measureTextWidthPx } from '../lib/acuity/fontMetrics';
import { wrapWordsToLines } from '../lib/acuity/paragraphLayout';

const OPTOTYPE_FONT_FAMILY = "'Times New Roman', Times, serif";
const OPTOTYPE_FONT_WEIGHT = 700;
const TARGET_LINES = 4;

interface OptotypeLineProps {
  /** Palabras del párrafo de lectura para este tamaño (ver readingTexts.ts). */
  words: string[];
  m: MUnit;
  pixelsPerMm: number;
}

/**
 * Renderiza un párrafo de lectura a su tamaño físico exacto en mm, calculado a
 * partir del valor M-unit y la calibración px/mm del dispositivo, y siempre
 * partido en exactamente 4 líneas (como una cartilla impresa) sin importar el
 * ancho de pantalla disponible. El corte de línea se calcula midiendo el
 * ancho real de cada candidata con canvas (misma fuente/peso que se
 * renderiza) en vez de depender del word-wrap automático del navegador, que
 * no garantiza un número fijo de líneas. El contraste del optotipo (negro
 * sobre blanco, en negrita) se mantiene fijo independientemente del tema de
 * la interfaz.
 */
export function OptotypeLine({ words, m, pixelsPerMm }: OptotypeLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidthPx, setContainerWidthPx] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) setContainerWidthPx(el.getBoundingClientRect().width);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidthPx(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { fontSizePx, heightPx, lines } = useMemo(() => {
    const heightMm = mUnitToMm(m);
    const targetHeightPx = heightMm * pixelsPerMm;
    const fontSizePx = fontSizeForXHeightPx(targetHeightPx, OPTOTYPE_FONT_FAMILY, OPTOTYPE_FONT_WEIGHT);
    const font = `${OPTOTYPE_FONT_WEIGHT} ${fontSizePx}px ${OPTOTYPE_FONT_FAMILY}`;
    const lines =
      containerWidthPx > 0
        ? wrapWordsToLines(words, (text) => measureTextWidthPx(text, font), containerWidthPx, TARGET_LINES)
        : [];
    return { fontSizePx, heightPx: targetHeightPx, lines };
  }, [m, pixelsPerMm, words, containerWidthPx]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={words.join(' ')}
      style={{
        width: '100%',
        background: '#ffffff',
        color: '#000000',
        padding: `${Math.max(heightPx * 0.3, 4)}px 0`,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: OPTOTYPE_FONT_FAMILY,
            fontWeight: OPTOTYPE_FONT_WEIGHT,
            fontSize: `${fontSizePx}px`,
            // El interlineado no afecta el tamaño físico calibrado del glifo
            // (que depende solo de font-size vía fontSizeForXHeightPx) — solo
            // el espacio entre las 4 líneas del párrafo.
            lineHeight: 1.25,
            letterSpacing: 0,
            whiteSpace: 'pre',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
