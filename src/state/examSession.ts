import type { MUnit } from '../lib/acuity/types';

export type Eye = 'OD' | 'OI';
export type DistanceMethod = 'cord' | 'camera';

export interface EyeResult {
  eye: Eye;
  /** Menor M-unit que el paciente pudo leer correctamente para este ojo. */
  smallestReadableM: MUnit;
  testDistanceM: number;
}

export interface ExamSession {
  distanceMethod: DistanceMethod | null;
  /** Distancia de examen confirmada, en metros (0.40 fijo en Método A). */
  confirmedDistanceM: number | null;
  eyesToTest: Eye[];
  results: EyeResult[];
}

export function createEmptySession(): ExamSession {
  return {
    distanceMethod: null,
    confirmedDistanceM: null,
    eyesToTest: ['OD', 'OI'],
    results: [],
  };
}

export const EYE_LABELS: Record<Eye, string> = {
  OD: 'Ojo derecho (OD)',
  OI: 'Ojo izquierdo (OI)',
};
