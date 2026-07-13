import { useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { WarningBanner } from '../components/WarningBanner';

interface CordConfirmScreenProps {
  onConfirm: () => void;
  onBack: () => void;
  fallbackMessage?: string | null;
}

export function CordConfirmScreen({ onConfirm, onBack, fallbackMessage }: CordConfirmScreenProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="screen">
      <h1>Confirmar distancia — Método A</h1>
      {fallbackMessage && (
        <WarningBanner tone="warning">
          {fallbackMessage} Se continúa con el Método A (cordón/cinta).
        </WarningBanner>
      )}
      <p>
        Sujete el dispositivo con el cordón/cinta de 40 cm totalmente extendido entre
        el dispositivo y el ojo del paciente que está siendo examinado.
      </p>
      <label className="confirm-checkbox">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        Confirmo que el cordón/cinta de 40 cm está totalmente extendido
      </label>

      <div className="screen-actions">
        <BigTouchButton variant="secondary" onClick={onBack}>
          Atrás
        </BigTouchButton>
        <BigTouchButton variant="primary" onClick={onConfirm} disabled={!checked}>
          Continuar
        </BigTouchButton>
      </div>
    </div>
  );
}
