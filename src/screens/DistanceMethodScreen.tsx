import { BigTouchButton } from '../components/BigTouchButton';
import { WarningBanner } from '../components/WarningBanner';
import type { DistanceMethod } from '../state/examSession';

interface DistanceMethodScreenProps {
  defaultMethod: DistanceMethod;
  onChoose: (method: DistanceMethod) => void;
}

export function DistanceMethodScreen({ defaultMethod, onChoose }: DistanceMethodScreenProps) {
  return (
    <div className="screen">
      <h1>Método de control de distancia</h1>
      <p>Elija cómo se controlará la distancia de examen (35-40 cm) para este paciente.</p>

      <div className="method-card">
        <h2>Método A — Cordón/cinta física</h2>
        <p>
          Sujete el dispositivo con un cordón o cinta de 40 cm totalmente extendido
          entre el dispositivo y el ojo del paciente (no provisto por la app).
        </p>
        <p className="method-card__badge method-card__badge--ground-truth">
          Referencia clínica — resultados exactos
        </p>
        <BigTouchButton variant="primary" onClick={() => onChoose('cord')} autoFocus={defaultMethod === 'cord'}>
          Usar Método A
        </BigTouchButton>
      </div>

      <div className="method-card">
        <h2>Método B — Cámara frontal (asistencia)</h2>
        <p>
          Usa la cámara frontal para estimar la distancia mediante la distancia
          interpupilar del paciente y guiarlo en tiempo real al rango correcto.
        </p>
        <WarningBanner tone="warning">
          Distancia estimada — para máxima precisión clínica use el Método A (cordón).
          Requiere permiso de cámara; si se deniega o no hay cámara frontal, se
          continúa automáticamente con el Método A.
        </WarningBanner>
        <BigTouchButton variant="secondary" onClick={() => onChoose('camera')} autoFocus={defaultMethod === 'camera'}>
          Usar Método B
        </BigTouchButton>
      </div>
    </div>
  );
}
