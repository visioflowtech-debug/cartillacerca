/**
 * La notación M-unit se define sobre la altura de una letra minúscula "x"
 * (x-height) — ver definición de Sloan citada en conversions.ts. El `font-size`
 * CSS, en cambio, corresponde al tamaño del em-square de la fuente, cuya relación
 * con la x-height real varía de una fuente a otra (típicamente 0.45–0.55 em) y no
 * puede asumirse fija sin invalidar la precisión clínica del renderizado.
 *
 * Este módulo mide en un <canvas> oculto la altura real (en px) del glifo "x" a un
 * tamaño de fuente de prueba conocido, usando las métricas reales del navegador
 * (`actualBoundingBoxAscent/Descent`), y de ahí deriva el `font-size` px exacto
 * necesario para que la altura visible en pantalla sea la altura física objetivo.
 */

const TEST_FONT_SIZE_PX = 1000;
const xHeightRatioCache = new Map<string, number>();

function measureXHeightRatio(fontFamily: string): number {
  const cached = xHeightRatioCache.get(fontFamily);
  if (cached !== undefined) return cached;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // No debería ocurrir en un navegador moderno; usar razón típica documentada
    // como fallback conservador en vez de fallar el renderizado del examen.
    return 0.5;
  }
  ctx.font = `${TEST_FONT_SIZE_PX}px ${fontFamily}`;
  const metrics = ctx.measureText('x');
  const xHeightPx =
    (metrics.actualBoundingBoxAscent ?? 0) + (metrics.actualBoundingBoxDescent ?? 0);
  const ratio = xHeightPx > 0 ? xHeightPx / TEST_FONT_SIZE_PX : 0.5;
  xHeightRatioCache.set(fontFamily, ratio);
  return ratio;
}

/**
 * Devuelve el `font-size` en px que produce una x-height renderizada igual a
 * `targetHeightPx` para la fuente dada.
 */
export function fontSizeForXHeightPx(targetHeightPx: number, fontFamily: string): number {
  const ratio = measureXHeightRatio(fontFamily);
  return targetHeightPx / ratio;
}
