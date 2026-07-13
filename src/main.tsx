import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tinos: clon de métricas idénticas a Times New Roman (Google Fonts, licencia
// SIL OFL), autohospedado para que el optotipo se vea igual en cualquier
// dispositivo/navegador — Times/Times New Roman es la tipografía citada como
// estándar para cartillas de lectura continua (N-notation, MNREAD), pero no
// está garantizado que el sistema operativo la tenga instalada (sobre todo en
// Android/Linux), lo que rompería la estandarización visual entre pacientes.
import '@fontsource/tinos/latin-400.css'
import '@fontsource/tinos/latin-700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
