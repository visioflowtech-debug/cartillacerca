import { useState } from 'react';
import './App.css';
import { HomeScreen } from './screens/HomeScreen';
import { CalibrationScreen } from './screens/CalibrationScreen';
import { DistanceMethodScreen } from './screens/DistanceMethodScreen';
import { CordConfirmScreen } from './screens/CordConfirmScreen';
import { CameraDistanceScreen } from './screens/CameraDistanceScreen';
import { PreExamScreen } from './screens/PreExamScreen';
import { ExamScreen } from './screens/ExamScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { getCalibration, getSettings, isCalibrated } from './lib/calibration/storage';
import { READING_TEXTS } from './content/readingTexts';
import { createEmptySession, type Eye, type EyeResult } from './state/examSession';

type Screen =
  | 'home'
  | 'calibration'
  | 'distanceMethod'
  | 'cordConfirm'
  | 'cameraDistance'
  | 'preExam'
  | 'exam'
  | 'results'
  | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [calibrationReturnScreen, setCalibrationReturnScreen] = useState<Screen>('home');
  const [session, setSession] = useState(createEmptySession());
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [results, setResults] = useState<EyeResult[]>([]);

  function handleStartExam() {
    if (!isCalibrated()) {
      setCalibrationReturnScreen('distanceMethod');
      setScreen('calibration');
      return;
    }
    setScreen('distanceMethod');
  }

  function handleChooseDistanceMethod(method: 'cord' | 'camera') {
    setSession((s) => ({ ...s, distanceMethod: method }));
    setFallbackMessage(null);
    setScreen(method === 'cord' ? 'cordConfirm' : 'cameraDistance');
  }

  function handleCordConfirmed() {
    setSession((s) => ({ ...s, confirmedDistanceM: 0.4 }));
    setScreen('preExam');
  }

  function handleCameraConfirmed(distanceM: number) {
    setSession((s) => ({ ...s, confirmedDistanceM: distanceM }));
    setScreen('preExam');
  }

  function handleFallbackToCord(reason: string) {
    setFallbackMessage(reason);
    setSession((s) => ({ ...s, distanceMethod: 'cord' }));
    setScreen('cordConfirm');
  }

  function handlePreExamStart(eyesToTest: Eye[]) {
    setSession((s) => ({ ...s, eyesToTest }));
    setScreen('exam');
  }

  function handleExamComplete(examResults: EyeResult[]) {
    setResults(examResults);
    setScreen('results');
  }

  function handleNewExam() {
    setSession(createEmptySession());
    setResults([]);
    setScreen('home');
  }

  const settings = getSettings();
  const calibration = getCalibration();

  return (
    <main className="app-shell">
      {screen === 'home' && (
        <HomeScreen
          isCalibrated={isCalibrated()}
          onStartExam={handleStartExam}
          onCalibrate={() => {
            setCalibrationReturnScreen('home');
            setScreen('calibration');
          }}
          onSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'calibration' && (
        <CalibrationScreen
          canCancel={calibrationReturnScreen === 'home' && isCalibrated()}
          onCancel={() => setScreen('home')}
          onDone={() => setScreen(calibrationReturnScreen)}
        />
      )}

      {screen === 'distanceMethod' && (
        <DistanceMethodScreen
          defaultMethod={settings.defaultDistanceMethod}
          onChoose={handleChooseDistanceMethod}
        />
      )}

      {screen === 'cordConfirm' && (
        <CordConfirmScreen
          fallbackMessage={fallbackMessage}
          onConfirm={handleCordConfirmed}
          onBack={() => setScreen('distanceMethod')}
        />
      )}

      {screen === 'cameraDistance' && (
        <CameraDistanceScreen
          onConfirm={handleCameraConfirmed}
          onFallbackToCord={handleFallbackToCord}
          onBack={() => setScreen('distanceMethod')}
        />
      )}

      {screen === 'preExam' && (
        <PreExamScreen onStart={handlePreExamStart} onBack={() => setScreen('distanceMethod')} />
      )}

      {screen === 'exam' && calibration && session.confirmedDistanceM && (
        <ExamScreen
          eyesToTest={session.eyesToTest}
          testDistanceM={session.confirmedDistanceM}
          pixelsPerMm={calibration.pixelsPerMm}
          readingText={READING_TEXTS[settings.readingTextLanguage]}
          onComplete={handleExamComplete}
        />
      )}

      {screen === 'results' && <ResultsScreen results={results} onNewExam={handleNewExam} />}

      {screen === 'settings' && (
        <SettingsScreen
          onRecalibrate={() => {
            setCalibrationReturnScreen('settings');
            setScreen('calibration');
          }}
          onBack={() => setScreen('home')}
        />
      )}
    </main>
  );
}

export default App;
