import { useMemo } from 'react';
import type { MUnit } from '../lib/acuity/types';
import { mUnitToMm } from '../lib/acuity/conversions';
import { fontSizeForXHeightPx } from '../lib/acuity/fontMetrics';

const OPTOTYPE_FONT_FAMILY = "'Times New Roman', Times, serif";

interface OptotypeLineProps {
  text: string;
  m: MUnit;
  pixelsPerMm: number;
}

/**
 * Renderiza una línea de texto a su tamaño físico exacto en mm, calculado a partir
 * del valor M-unit y la calibración px/mm del dispositivo. Usa SVG (no unidades de
 * fuente del sistema operativo) para evitar variabilidad de renderizado entre
 * navegadores/plataformas. El contraste del optotipo (negro sobre blanco) se
 * mantiene fijo independientemente del tema de la interfaz.
 */
export function OptotypeLine({ text, m, pixelsPerMm }: OptotypeLineProps) {
  const { fontSizePx, heightPx } = useMemo(() => {
    const heightMm = mUnitToMm(m);
    const targetHeightPx = heightMm * pixelsPerMm;
    return {
      heightPx: targetHeightPx,
      fontSizePx: fontSizeForXHeightPx(targetHeightPx, OPTOTYPE_FONT_FAMILY),
    };
  }, [m, pixelsPerMm]);

  return (
    <div
      role="img"
      aria-label={text}
      style={{
        width: '100%',
        background: '#ffffff',
        color: '#000000',
        padding: `${Math.max(heightPx * 0.3, 4)}px 0`,
      }}
    >
      <span
        style={{
          fontFamily: OPTOTYPE_FONT_FAMILY,
          fontSize: `${fontSizePx}px`,
          // El interlineado no afecta el tamaño físico calibrado del glifo (que
          // depende solo de font-size vía fontSizeForXHeightPx) — solo el
          // espacio entre líneas cuando el párrafo hace salto de línea.
          lineHeight: 1.25,
          letterSpacing: 0,
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          wordBreak: 'normal',
        }}
      >
        {text}
      </span>
    </div>
  );
}
