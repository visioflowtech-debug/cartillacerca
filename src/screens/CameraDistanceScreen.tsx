import { useEffect, useRef, useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { WarningBanner } from '../components/WarningBanner';
import { measureIpdPx, isFaceLandmarkerSupported } from '../lib/distance/faceLandmarker';
import { classifyDistance, estimateDistanceMm, type DistanceZone } from '../lib/distance/ipdDistance';

interface CameraDistanceScreenProps {
  onConfirm: (distanceM: number) => void;
  onFallbackToCord: (reason: string) => void;
  onBack: () => void;
}

const ZONE_MESSAGES: Record<DistanceZone, string> = {
  'too-close': 'Acérquese... no, aléjese un poco ↔ está demasiado cerca',
  correct: 'Distancia correcta ✓',
  'too-far': 'Acérquese un poco ↔ está demasiado lejos',
};

export function CameraDistanceScreen({ onConfirm, onFallbackToCord, onBack }: CameraDistanceScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [distanceMm, setDistanceMm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFaceLandmarkerSupported()) {
      onFallbackToCord('Este dispositivo/navegador no soporta detección de cámara.');
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        loop();
      } catch {
        onFallbackToCord('Permiso de cámara denegado o no disponible.');
      }
    }

    function loop() {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      measureIpdPx(video)
        .then((measurement) => {
          if (cancelled) return;
          if (measurement) {
            const mm = estimateDistanceMm(measurement.ipdPx, measurement.videoWidthPx);
            setDistanceMm(mm);
            setError(null);
          } else {
            setError('No se detecta un rostro frente a la cámara.');
          }
          rafRef.current = requestAnimationFrame(loop);
        })
        .catch(() => {
          if (!cancelled) onFallbackToCord('Error al procesar la detección facial.');
        });
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zone = distanceMm !== null ? classifyDistance(distanceMm) : null;

  return (
    <div className="screen">
      <h1>Guía de distancia — Método B (cámara)</h1>
      <WarningBanner tone="warning">
        Distancia estimada — para máxima precisión clínica use el Método A (cordón).
      </WarningBanner>

      <video ref={videoRef} className="camera-preview" muted playsInline />

      {error && <p className="camera-status camera-status--error">{error}</p>}
      {zone && (
        <p className={`camera-status camera-status--${zone}`}>
          {ZONE_MESSAGES[zone]} ({(distanceMm! / 10).toFixed(1)} cm estimados)
        </p>
      )}

      <div className="screen-actions">
        <BigTouchButton variant="secondary" onClick={onBack}>
          Atrás
        </BigTouchButton>
        <BigTouchButton
          variant="primary"
          disabled={zone !== 'correct'}
          onClick={() => onConfirm((distanceMm ?? 400) / 1000)}
        >
          Confirmar y continuar
        </BigTouchButton>
      </div>
    </div>
  );
}
