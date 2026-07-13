import { useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { getCalibration, getSettings, saveSettings, type AppSettings } from '../lib/calibration/storage';

interface SettingsScreenProps {
  onRecalibrate: () => void;
  onBack: () => void;
}

export function SettingsScreen({ onRecalibrate, onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const calibration = getCalibration();

  function update(partial: Partial<AppSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <div className="screen">
      <h1>Configuración</h1>

      <section className="settings-section">
        <h2>Calibración</h2>
        {calibration ? (
          <p>
            Calibrado el {new Date(calibration.calibratedAt).toLocaleString('es-SV')} ·{' '}
            {calibration.pixelsPerMm.toFixed(2)} px/mm
          </p>
        ) : (
          <p>Dispositivo sin calibrar.</p>
        )}
        <BigTouchButton variant="secondary" onClick={onRecalibrate}>
          Recalibrar dispositivo
        </BigTouchButton>
      </section>

      <section className="settings-section">
        <h2>Idioma del texto de prueba</h2>
        <div className="settings-radio-group">
          <label>
            <input
              type="radio"
              name="lang"
              checked={settings.readingTextLanguage === 'es'}
              onChange={() => update({ readingTextLanguage: 'es' })}
            />
            Español
          </label>
          <label>
            <input
              type="radio"
              name="lang"
              checked={settings.readingTextLanguage === 'en'}
              onChange={() => update({ readingTextLanguage: 'en' })}
            />
            English
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h2>Método de distancia por defecto</h2>
        <div className="settings-radio-group">
          <label>
            <input
              type="radio"
              name="distanceMethod"
              checked={settings.defaultDistanceMethod === 'cord'}
              onChange={() => update({ defaultDistanceMethod: 'cord' })}
            />
            Cordón/cinta (Método A)
          </label>
          <label>
            <input
              type="radio"
              name="distanceMethod"
              checked={settings.defaultDistanceMethod === 'camera'}
              onChange={() => update({ defaultDistanceMethod: 'camera' })}
            />
            Cámara (Método B)
          </label>
        </div>
      </section>

      <div className="screen-actions">
        <BigTouchButton variant="primary" onClick={onBack}>
          Volver
        </BigTouchButton>
      </div>
    </div>
  );
}
