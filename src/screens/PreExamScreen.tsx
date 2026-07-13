import { useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { WarningBanner } from '../components/WarningBanner';
import type { Eye } from '../state/examSession';

interface PreExamScreenProps {
  onStart: (eyesToTest: Eye[]) => void;
  onBack: () => void;
}

const EYE_OPTIONS: Array<{ value: Eye[]; label: string }> = [
  { value: ['OD', 'OI'], label: 'Ambos ojos (OD y OI)' },
  { value: ['OD'], label: 'Solo ojo derecho (OD)' },
  { value: ['OI'], label: 'Solo ojo izquierdo (OI)' },
];

export function PreExamScreen({ onStart, onBack }: PreExamScreenProps) {
  const [eyesToTest, setEyesToTest] = useState<Eye[]>(['OD', 'OI']);

  return (
    <div className="screen">
      <h1>Antes de comenzar</h1>
      <WarningBanner tone="warning">
        Fije el brillo de pantalla al 100% y controle la luz ambiental de la sala. La
        app no puede ajustar el brillo por software.
      </WarningBanner>

      <h2>¿Qué ojo(s) se va a examinar?</h2>
      <div className="settings-radio-group">
        {EYE_OPTIONS.map((opt) => (
          <label key={opt.label}>
            <input
              type="radio"
              name="eyes"
              checked={JSON.stringify(eyesToTest) === JSON.stringify(opt.value)}
              onChange={() => setEyesToTest(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="screen-actions">
        <BigTouchButton variant="secondary" onClick={onBack}>
          Atrás
        </BigTouchButton>
        <BigTouchButton variant="primary" onClick={() => onStart(eyesToTest)}>
          Comenzar examen
        </BigTouchButton>
      </div>
    </div>
  );
}
