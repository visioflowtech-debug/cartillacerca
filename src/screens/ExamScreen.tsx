import { useMemo, useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { OptotypeLine } from '../components/OptotypeLine';
import { logMarToSnellenDenominator } from '../lib/acuity/conversions';
import { approxJaegerFromMUnit, formatApproxNotation } from '../lib/acuity/jaegerTable';
import { generateAcuityProgression } from '../lib/acuity/progression';
import { EYE_LABELS, type Eye, type EyeResult } from '../state/examSession';

interface ExamScreenProps {
  eyesToTest: Eye[];
  testDistanceM: number;
  pixelsPerMm: number;
  readingText: string;
  onComplete: (results: EyeResult[]) => void;
}

/**
 * Muestra todas las líneas de la progresión simultáneamente en tamaño
 * decreciente, replicando el formato de una cartilla impresa física (en vez
 * de navegar una línea a la vez). El clínico toca directamente el párrafo más
 * pequeño que el paciente logra leer correctamente para ese ojo.
 */
export function ExamScreen({
  eyesToTest,
  testDistanceM,
  pixelsPerMm,
  readingText,
  onComplete,
}: ExamScreenProps) {
  const lines = useMemo(() => generateAcuityProgression(), []);
  const [eyeIndex, setEyeIndex] = useState(0);
  const [results, setResults] = useState<EyeResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const currentEye = eyesToTest[eyeIndex];

  function confirmSelection() {
    if (selectedIndex === null) return;
    const line = lines[selectedIndex];
    const newResults = [
      ...results,
      { eye: currentEye, smallestReadableM: line.m, testDistanceM },
    ];
    setSelectedIndex(null);
    if (eyeIndex + 1 < eyesToTest.length) {
      setResults(newResults);
      setEyeIndex(eyeIndex + 1);
    } else {
      onComplete(newResults);
    }
  }

  return (
    <div className="screen screen--exam">
      <h1>Examen — {EYE_LABELS[currentEye]}</h1>
      <p>
        Toque el párrafo más pequeño que el paciente logra leer correctamente,
        luego confirme.
      </p>

      <div className="acuity-card">
        {lines.map((line, i) => {
          const jaeger = approxJaegerFromMUnit(line.m);
          const snellenDenom = Math.round(logMarToSnellenDenominator(line.logMar));
          const selected = selectedIndex === i;
          return (
            <button
              key={i}
              type="button"
              className={`acuity-line-row${selected ? ' acuity-line-row--selected' : ''}`}
              onClick={() => setSelectedIndex(i)}
              aria-pressed={selected}
            >
              <OptotypeLine text={readingText} m={line.m} pixelsPerMm={pixelsPerMm} />
              <span className="acuity-line-label">
                {formatApproxNotation('J', jaeger)} — {line.m.toFixed(2)}M — logMAR{' '}
                {line.logMar >= 0 ? '+' : ''}
                {line.logMar.toFixed(2)} — Snellen 20/{snellenDenom}
              </span>
            </button>
          );
        })}
      </div>

      <div className="screen-actions no-print">
        <BigTouchButton variant="primary" disabled={selectedIndex === null} onClick={confirmSelection}>
          Confirmar y continuar
        </BigTouchButton>
      </div>
    </div>
  );
}
