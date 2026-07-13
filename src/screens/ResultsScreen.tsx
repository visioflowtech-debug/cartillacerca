import { BigTouchButton } from '../components/BigTouchButton';
import {
  logMarFromReading,
  logMarToSnellenDenominator,
  mUnitToMm,
} from '../lib/acuity/conversions';
import { approxJaegerFromMUnit, approxNFromMUnit, formatApproxNotation } from '../lib/acuity/jaegerTable';
import { EYE_LABELS, type EyeResult } from '../state/examSession';

interface ResultsScreenProps {
  results: EyeResult[];
  onNewExam: () => void;
}

export function ResultsScreen({ results, onNewExam }: ResultsScreenProps) {
  return (
    <div className="screen screen--results">
      <h1>Resultado del examen</h1>

      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Ojo</th>
              <th>M-unit</th>
              <th>Jaeger</th>
              <th>N</th>
              <th>logMAR</th>
              <th>Snellen (equiv.)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const logMar = logMarFromReading(r.smallestReadableM, r.testDistanceM);
              const snellenDenom = logMarToSnellenDenominator(logMar);
              return (
                <tr key={r.eye}>
                  <td>{EYE_LABELS[r.eye]}</td>
                  <td>{r.smallestReadableM.toFixed(2)}M</td>
                  <td>{formatApproxNotation('J', approxJaegerFromMUnit(r.smallestReadableM))}</td>
                  <td>{formatApproxNotation('N', approxNFromMUnit(r.smallestReadableM))}</td>
                  <td>{logMar >= 0 ? '+' : ''}{logMar.toFixed(2)}</td>
                  <td>20/{Math.round(snellenDenom)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="results-meta">
        Distancia de examen: {(results[0]?.testDistanceM * 100).toFixed(0)} cm · Tamaño de
        letra: {results.map((r) => mUnitToMm(r.smallestReadableM).toFixed(2)).join(' / ')} mm
        de altura física
      </p>

      <p className="results-disclaimer">
        Los valores M-unit y logMAR son el cálculo clínico exacto de esta app. Jaeger y
        N-notation se muestran como equivalencia aproximada (≈), ya que no están
        estandarizados entre fabricantes de cartillas.
      </p>

      <div className="screen-actions no-print">
        <BigTouchButton variant="secondary" onClick={() => window.print()}>
          Imprimir
        </BigTouchButton>
        <BigTouchButton variant="primary" onClick={onNewExam}>
          Nuevo examen
        </BigTouchButton>
      </div>
    </div>
  );
}
