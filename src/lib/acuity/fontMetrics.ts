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
let sharedCanvasCtx: CanvasRenderingContext2D | null | undefined;

/** Reutiliza un único <canvas> oculto para todas las mediciones de texto de este módulo. */
function getSharedCtx(): CanvasRenderingContext2D | null {
  if (sharedCanvasCtx === undefined) {
    sharedCanvasCtx = document.createElement('canvas').getContext('2d');
  }
  return sharedCanvasCtx;
}

/**
 * El peso de la fuente (normal/bold) puede alterar ligeramente el ratio
 * x-height/em de un tipo de letra, así que se mide con el mismo `fontWeight`
 * que efectivamente se va a renderizar — no un peso arbitrario — para que la
 * calibración en mm siga siendo exacta.
 */
function measureXHeightRatio(fontFamily: string, fontWeight: string | number): number {
  const cacheKey = `${fontWeight} ${fontFamily}`;
  const cached = xHeightRatioCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const ctx = getSharedCtx();
  if (!ctx) {
    // No debería ocurrir en un navegador moderno; usar razón típica documentada
    // como fallback conservador en vez de fallar el renderizado del examen.
    return 0.5;
  }
  ctx.font = `${fontWeight} ${TEST_FONT_SIZE_PX}px ${fontFamily}`;
  const metrics = ctx.measureText('x');
  const xHeightPx =
    (metrics.actualBoundingBoxAscent ?? 0) + (metrics.actualBoundingBoxDescent ?? 0);
  const ratio = xHeightPx > 0 ? xHeightPx / TEST_FONT_SIZE_PX : 0.5;
  xHeightRatioCache.set(cacheKey, ratio);
  return ratio;
}

/**
 * Devuelve el `font-size` en px que produce una x-height renderizada igual a
 * `targetHeightPx` para la fuente y peso dados.
 */
export function fontSizeForXHeightPx(
  targetHeightPx: number,
  fontFamily: string,
  fontWeight: string | number = 'normal',
): number {
  const ratio = measureXHeightRatio(fontFamily, fontWeight);
  return targetHeightPx / ratio;
}

/**
 * Ancho real en px de `text` renderizado con `font` (shorthand CSS/canvas
 * completo, p. ej. `"700 42px 'Times New Roman', Times, serif"`). Usado para
 * envolver los párrafos de lectura en líneas de un ancho exacto conocido.
 */
export function measureTextWidthPx(text: string, font: string): number {
  const ctx = getSharedCtx();
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}

let fontsReadyPromise: Promise<void> | null = null;

/**
 * Espera a que la fuente autohospedada (Tinos) termine de cargar antes de
 * medir nada. Si se mide el x-height mientras la fuente real todavía está
 * descargándose, el navegador usa temporalmente una fuente de respaldo
 * distinta, y ese ratio incorrecto quedaría cacheado para toda la sesión
 * (ver xHeightRatioCache) — invalidando la precisión clínica del tamaño en
 * mm. Por eso ningún cálculo de tamaño debe ejecutarse antes de esto.
 */
export function waitForFontsReady(fontSpecs: string[]): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return Promise.resolve();
  }
  if (!fontsReadyPromise) {
    fontsReadyPromise = Promise.all([
      document.fonts.ready,
      ...fontSpecs.map((spec) => document.fonts.load(spec).catch(() => undefined)),
    ]).then(() => undefined);
  }
  return fontsReadyPromise;
}
