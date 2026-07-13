import { useMemo, useState } from 'react';
import { BigTouchButton } from '../components/BigTouchButton';
import { OptotypeLine } from '../components/OptotypeLine';
import { generateAcuityProgression } from '../lib/acuity/progression';
import { EYE_LABELS, type Eye, type EyeResult } from '../state/examSession';

interface ExamScreenProps {
  eyesToTest: Eye[];
  testDistanceM: number;
  pixelsPerMm: number;
  readingText: string;
  onComplete: (results: EyeResult[]) => void;
}

export function ExamScreen({
  eyesToTest,
  testDistanceM,
  pixelsPerMm,
  readingText,
  onComplete,
}: ExamScreenProps) {
  const lines = useMemo(() => generateAcuityProgression(), []);
  const [eyeIndex, setEyeIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [results, setResults] = useState<EyeResult[]>([]);
  const [repeatKey, setRepeatKey] = useState(0);

  const currentEye = eyesToTest[eyeIndex];
  const currentLine = lines[lineIndex];

  function finishEye(smallestReadableIndex: number) {
    const readableLine = lines[Math.max(smallestReadableIndex, 0)];
    const newResults = [
      ...results,
      { eye: currentEye, smallestReadableM: readableLine.m, testDistanceM },
    ];
    if (eyeIndex + 1 < eyesToTest.length) {
      setResults(newResults);
      setEyeIndex(eyeIndex + 1);
      setLineIndex(0);
    } else {
      onComplete(newResults);
    }
  }

  function canRead() {
    if (lineIndex + 1 < lines.length) {
      setLineIndex(lineIndex + 1);
    } else {
      finishEye(lineIndex);
    }
  }

  function cannotRead() {
    finishEye(lineIndex - 1);
  }

  function goBack() {
    setLineIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="screen screen--exam">
      <h1>Examen — {EYE_LABELS[currentEye]}</h1>
      <p className="exam-progress">
        Línea {lineIndex + 1} de {lines.length} · logMAR {currentLine.logMar.toFixed(2)}
      </p>

      <OptotypeLine key={repeatKey} text={readingText} m={currentLine.m} pixelsPerMm={pixelsPerMm} />

      <div className="screen-actions screen-actions--exam">
        <BigTouchButton variant="secondary" onClick={goBack} disabled={lineIndex === 0}>
          Anterior
        </BigTouchButton>
        <BigTouchButton variant="secondary" onClick={() => setRepeatKey((k) => k + 1)}>
          Repetir
        </BigTouchButton>
        <BigTouchButton variant="danger" onClick={cannotRead}>
          No puede leer
        </BigTouchButton>
        <BigTouchButton variant="primary" onClick={canRead}>
          Puede leer
        </BigTouchButton>
      </div>
    </div>
  );
}
