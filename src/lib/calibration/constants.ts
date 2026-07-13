/**
 * Dimensiones de una tarjeta de crédito/débito estándar, norma ISO/IEC 7810 ID-1.
 * Usadas como referencia física para la calibración de pixelsPerMm del dispositivo.
 */
export const ID1_CARD_WIDTH_MM = 85.6;
export const ID1_CARD_HEIGHT_MM = 53.98;

export const LOCALSTORAGE_KEYS = {
  pixelsPerMm: 'cartillacerca.pixelsPerMm',
  deviceCalibratedAt: 'cartillacerca.calibratedAt',
  settings: 'cartillacerca.settings',
} as const;
