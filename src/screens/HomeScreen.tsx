import { BigTouchButton } from '../components/BigTouchButton';
import { WarningBanner } from '../components/WarningBanner';

interface HomeScreenProps {
  isCalibrated: boolean;
  onStartExam: () => void;
  onCalibrate: () => void;
  onSettings: () => void;
}

export function HomeScreen({ isCalibrated, onStartExam, onCalibrate, onSettings }: HomeScreenProps) {
  return (
    <div className="screen screen--home">
      <h1>Cartilla Cercana</h1>
      <p className="subtitle">Medición clínica de agudeza visual cercana</p>

      {!isCalibrated && (
        <WarningBanner tone="warning">
          Este dispositivo no ha sido calibrado. Debe calibrarlo antes de iniciar un
          examen para garantizar la exactitud del tamaño de los optotipos.
        </WarningBanner>
      )}

      <div className="screen-actions screen-actions--stacked">
        <BigTouchButton variant="primary" onClick={onStartExam}>
          Iniciar examen
        </BigTouchButton>
        <BigTouchButton variant="secondary" onClick={onCalibrate}>
          Calibración del dispositivo
        </BigTouchButton>
        <BigTouchButton variant="secondary" onClick={onSettings}>
          Configuración
        </BigTouchButton>
      </div>
    </div>
  );
}
