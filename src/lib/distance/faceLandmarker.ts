import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * Wrapper del FaceLandmarker de MediaPipe Tasks Vision para estimar la distancia
 * interpupilar (DIP) en píxeles a partir del video de la cámara frontal.
 *
 * Los assets (wasm + modelo .task, unos pocos MB) se descargan desde el CDN oficial
 * de MediaPipe/Google la primera vez que se usa el Método B, y quedan cacheados por
 * el service worker para uso offline posterior (ver runtimeCaching en vite.config.ts).
 * Requiere conexión a internet la primera vez; si falla, el llamador debe hacer
 * fallback al Método A (cordón).
 */
const WASM_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Índices de landmarks de iris en el modelo de 478 puntos de MediaPipe Face Landmarker
// (habilitados por defecto en este modelo): centro del iris derecho e izquierdo.
const RIGHT_IRIS_CENTER = 468;
const LEFT_IRIS_CENTER = 473;

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_BASE_URL).then((fileset) =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
      }),
    );
  }
  return landmarkerPromise;
}

export interface IpdMeasurement {
  ipdPx: number;
  videoWidthPx: number;
}

/**
 * Devuelve la DIP medida en píxeles para el frame de video actual, o null si no
 * se detecta ningún rostro (el llamador debe manejar este caso con gracia).
 */
export async function measureIpdPx(video: HTMLVideoElement): Promise<IpdMeasurement | null> {
  const landmarker = await getLandmarker();
  const result = landmarker.detectForVideo(video, performance.now());
  const landmarks = result.faceLandmarks[0];
  if (!landmarks) return null;

  const right = landmarks[RIGHT_IRIS_CENTER];
  const left = landmarks[LEFT_IRIS_CENTER];
  if (!right || !left) return null;

  const dx = (right.x - left.x) * video.videoWidth;
  const dy = (right.y - left.y) * video.videoHeight;
  const ipdPx = Math.sqrt(dx * dx + dy * dy);
  return { ipdPx, videoWidthPx: video.videoWidth };
}

export function isFaceLandmarkerSupported(): boolean {
  return typeof WebAssembly !== 'undefined' && typeof navigator?.mediaDevices?.getUserMedia === 'function';
}
