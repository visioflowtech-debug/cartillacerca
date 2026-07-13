/**
 * Estimación aproximada de distancia paciente-dispositivo a partir de la distancia
 * interpupilar (DIP) medida en píxeles por la cámara frontal, usando el modelo de
 * cámara estenopeica (pinhole): distancia = (DIP_real_mm * focal_px) / DIP_medida_px,
 * con focal_px derivado de un campo de visión horizontal asumido (no medible desde
 * el navegador sin acceso a los intrínsecos de la cámara).
 *
 * ESTE MÉTODO ES UNA ESTIMACIÓN, no una medición clínica exacta:
 * - La DIP real varía entre personas (rango poblacional adulto ~54-74mm); se usa
 *   el promedio poblacional (~63mm) como referencia, lo que introduce error individual.
 * - El campo de visión horizontal asumido (60°) es un valor típico de cámaras
 *   frontales de tablets/celulares, pero no se puede verificar por software sin
 *   acceso a los parámetros intrínsecos reales de cada cámara.
 * PENDIENTE DE VERIFICACIÓN CLÍNICA: el FOV asumido es una aproximación razonable,
 * no un valor medido por dispositivo; por eso el Método A (cordón) sigue siendo la
 * referencia clínica "ground truth" y el Método B siempre se etiqueta como estimado.
 */
export const AVERAGE_ADULT_IPD_MM = 63;
export const ASSUMED_FRONT_CAMERA_HORIZONTAL_FOV_DEG = 60;

export function estimateDistanceMm(
  measuredIpdPx: number,
  videoWidthPx: number,
  assumedHorizontalFovDeg = ASSUMED_FRONT_CAMERA_HORIZONTAL_FOV_DEG,
  realIpdMm = AVERAGE_ADULT_IPD_MM,
): number {
  const fovHalfRad = (assumedHorizontalFovDeg / 2) * (Math.PI / 180);
  const focalLengthPx = videoWidthPx / 2 / Math.tan(fovHalfRad);
  return (realIpdMm * focalLengthPx) / measuredIpdPx;
}

export type DistanceZone = 'too-close' | 'correct' | 'too-far';

export function classifyDistance(
  distanceMm: number,
  minMm = 350,
  maxMm = 400,
): DistanceZone {
  if (distanceMm < minMm) return 'too-close';
  if (distanceMm > maxMm) return 'too-far';
  return 'correct';
}
