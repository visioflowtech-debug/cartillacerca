import { LOCALSTORAGE_KEYS } from './constants';

export interface CalibrationData {
  pixelsPerMm: number;
  calibratedAt: string;
}

export function getCalibration(): CalibrationData | null {
  const raw = localStorage.getItem(LOCALSTORAGE_KEYS.pixelsPerMm);
  const calibratedAt = localStorage.getItem(LOCALSTORAGE_KEYS.deviceCalibratedAt);
  if (!raw || !calibratedAt) return null;
  const pixelsPerMm = Number(raw);
  if (!Number.isFinite(pixelsPerMm) || pixelsPerMm <= 0) return null;
  return { pixelsPerMm, calibratedAt };
}

export function saveCalibration(pixelsPerMm: number): CalibrationData {
  const calibratedAt = new Date().toISOString();
  localStorage.setItem(LOCALSTORAGE_KEYS.pixelsPerMm, String(pixelsPerMm));
  localStorage.setItem(LOCALSTORAGE_KEYS.deviceCalibratedAt, calibratedAt);
  return { pixelsPerMm, calibratedAt };
}

export function isCalibrated(): boolean {
  return getCalibration() !== null;
}

export interface AppSettings {
  readingTextLanguage: 'es' | 'en';
  defaultDistanceMethod: 'cord' | 'camera';
}

const DEFAULT_SETTINGS: AppSettings = {
  readingTextLanguage: 'es',
  defaultDistanceMethod: 'cord',
};

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(LOCALSTORAGE_KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(LOCALSTORAGE_KEYS.settings, JSON.stringify(settings));
}
