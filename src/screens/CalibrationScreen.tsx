import { useRef, useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { WarningBanner } from '../components/WarningBanner';
import { ID1_CARD_HEIGHT_MM, ID1_CARD_WIDTH_MM } from '../lib/calibration/constants';
import { saveCalibration } from '../lib/calibration/storage';

interface CalibrationScreenProps {
  onDone: () => void;
  onCancel?: () => void;
  canCancel: boolean;
}

// Estimación inicial razonable: navegadores usan como referencia ~96px CSS por
// pulgada. No es una medición real (por eso existe esta pantalla) — solo un punto
// de partida cómodo para que el usuario ajuste contra la tarjeta física.
const INITIAL_PX_PER_MM = 96 / 25.4;

function distanceBetweenTouches(touches: React.TouchList): number {
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function CalibrationScreen({ onDone, onCancel, canCancel }: CalibrationScreenProps) {
  const [widthPx, setWidthPx] = useState(ID1_CARD_WIDTH_MM * INITIAL_PX_PER_MM);
  const pinchStartRef = useRef<{ distance: number; widthPx: number } | null>(null);

  const heightPx = widthPx * (ID1_CARD_HEIGHT_MM / ID1_CARD_WIDTH_MM);
  const pixelsPerMm = widthPx / ID1_CARD_WIDTH_MM;

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinchStartRef.current = { distance: distanceBetweenTouches(e.touches), widthPx };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const newDistance = distanceBetweenTouches(e.touches);
      const scale = newDistance / pinchStartRef.current.distance;
      const next = pinchStartRef.current.widthPx * scale;
      setWidthPx(Math.min(Math.max(next, 50), 2000));
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) pinchStartRef.current = null;
  }

  function adjust(deltaPx: number) {
    setWidthPx((w) => Math.min(Math.max(w + deltaPx, 50), 2000));
  }

  function confirm() {
    saveCalibration(pixelsPerMm);
    onDone();
  }

  return (
    <div className="screen">
      <h1>Calibración del dispositivo</h1>
      <p>
        Sostenga una tarjeta de crédito/débito física contra la pantalla y ajuste el
        rectángulo (con el gesto de pellizco/zoom en pantallas táctiles, o los botones
        + / -) hasta que coincida exactamente con el tamaño real de la tarjeta.
      </p>
      <WarningBanner tone="info">
        Esta calibración se guarda solo en este dispositivo y no cambia hasta que
        vuelva a calibrar desde Configuración.
      </WarningBanner>

      <div
        className="calibration-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="calibration-rect"
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
        >
          Tarjeta ID-1 (85.60 × 53.98 mm)
        </div>
      </div>

      <div className="calibration-controls">
        <BigTouchButton variant="secondary" onClick={() => adjust(-5)} aria-label="Achicar">
          −
        </BigTouchButton>
        <BigTouchButton variant="secondary" onClick={() => adjust(5)} aria-label="Agrandar">
          +
        </BigTouchButton>
      </div>

      <div className="screen-actions">
        {canCancel && onCancel && (
          <BigTouchButton variant="secondary" onClick={onCancel}>
            Cancelar
          </BigTouchButton>
        )}
        <BigTouchButton variant="primary" onClick={confirm}>
          Confirmar calibración
        </BigTouchButton>
      </div>
    </div>
  );
}
