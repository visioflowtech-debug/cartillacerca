# Cartilla Cercana — Agudeza Visual Cercana

PWA clínica para medir agudeza visual cercana, pensada para reemplazar la
cartilla física de Jaeger en una óptica o clínica oftalmológica. Funciona en
tablets y celulares vía navegador, sin instalación, y no guarda datos del
paciente entre sesiones — solo persiste en `localStorage` la calibración del
dispositivo (px/mm) y las preferencias de configuración.

## Cómo correrla

```bash
npm install
npm run dev       # desarrollo
npm run build     # build de producción (genera manifest + service worker)
npm run preview   # sirve el build de producción localmente
npm run test      # tests unitarios del motor de conversión de unidades
```

## Cómo calibrar un dispositivo nuevo

1. Abrir **Calibración del dispositivo** desde el inicio o desde Configuración.
2. Sostener una tarjeta de crédito/débito física (o cualquier tarjeta ID-1
   estándar: cédula, carné) contra la pantalla.
3. Ajustar el rectángulo en pantalla — con el gesto de pellizco/zoom en
   pantallas táctiles, o los botones **+ / −** — hasta que coincida
   exactamente con el tamaño real de la tarjeta.
4. Confirmar. Esto guarda `pixelsPerMm` en `localStorage` **para ese
   dispositivo específico**. No es necesario repetirlo salvo que se cambie de
   dispositivo o se sospeche que el zoom del sistema operativo cambió.

La app bloquea el inicio de un examen si el dispositivo no ha sido calibrado.

## Cómo interpretar los resultados

La app calcula internamente en **M-units** y **logMAR** (el sistema riguroso,
angularmente definido) y muestra **Jaeger** y **N-notation** solo como
referencia visual para el clínico, derivada de M-units:

| Columna | Qué significa | ¿Es la fuente de verdad? |
|---|---|---|
| **M-unit** | Tamaño de letra: subtiende 5' de arco a esa distancia en metros. Es una propiedad física fija de la letra (no cambia con la distancia de examen). | **Sí** — motor de cálculo primario. |
| **logMAR** | log10(M-unit / distancia de examen real). Menor = mejor agudeza. Progresión en pasos de 0.1 entre líneas. | **Sí** — junto con M-unit. |
| **Jaeger (≈J1–J10)** | Equivalencia aproximada, tomada de una tabla de una sola fuente citada (ver `src/lib/acuity/jaegerTable.ts`). | **No.** Jaeger no está estandarizado entre fabricantes de cartillas: distintas fuentes asignan J distintos al mismo tamaño físico de letra. Por eso siempre se muestra con "≈", o con "<"/">" cuando el resultado cae fuera del rango cubierto por la tabla (evita mostrar una precisión falsa). |
| **N-notation (≈N4.5–N14)** | Igual que Jaeger: aproximación de una sola fuente citada, no una fórmula angular verificable. | **No.** |
| **Snellen equivalente (20/X)** | Derivado matemáticamente de logMAR (`denominador = 20 × 10^logMAR`), sin ambigüedad. | **Sí**, es una conversión estandarizada. |

Ejemplo de lectura: `0.4M · logMAR 0.00 · ≈J1 · Snellen 20/20` significa que el
paciente leyó una letra de 0.4M (tamaño físico ~0.58mm) a la distancia de
examen, lo que equivale exactamente a logMAR 0.00 y aproximadamente a J1 según
la tabla de referencia usada.

### Distancia de examen

- **Método A (cordón/cinta, 40 cm)** es la referencia clínica: los resultados
  son exactos porque la distancia es conocida con certeza.
- **Método B (cámara)** estima la distancia con la cámara frontal a partir de
  la distancia interpupilar detectada. **Es una estimación**, no una medición
  clínica — ver limitaciones abajo. Siempre se etiqueta como tal en la UI.

## Limitaciones conocidas

- **Jaeger y N-notation no están estandarizados.** La tabla usada
  (`src/lib/acuity/jaegerTable.ts`) proviene de una única fuente citada
  (qvisionacademy.com/articles/visual-acuity-conversion, consistente con
  tablas tipo Colenbrander). Otros fabricantes de cartillas pueden asignar un
  J o N distinto al mismo tamaño físico de letra. Por eso Jaeger/N solo se
  usan como capa de visualización — el resultado clínico real de la app es
  M-unit + logMAR.
- **Método B (cámara) es una estimación, no una medición exacta:**
  - Usa la distancia interpupilar (DIP) promedio poblacional adulta (~63mm)
    como referencia; la DIP real varía entre personas (rango ~54–74mm), lo
    que introduce error individual.
  - El campo de visión horizontal de la cámara frontal se asume en 60°
    (`src/lib/distance/ipdDistance.ts`), un valor típico pero no medido para
    cada dispositivo real, ya que el navegador no expone los parámetros
    intrínsecos de la cámara. **Marcado en el código como pendiente de
    verificación por dispositivo.**
  - Requiere conexión a internet la primera vez que se usa (para descargar el
    modelo de MediaPipe FaceLandmarker, unos pocos MB); luego el service
    worker lo cachea para uso offline.
  - Si se deniega el permiso de cámara, no hay cámara frontal, o el
    navegador no soporta la API necesaria, la app cae automáticamente al
    Método A.
- **Rango de la tabla Jaeger/N:** cubre aproximadamente 20/20 a 20/100
  (0.5M–1.3M). Fuera de ese rango, la UI muestra `<J1`/`>J10` (o `<N4.5`/`>N14`)
  en vez de forzar una equivalencia inventada.
- **Fuente de optotipos:** el renderizado usa Times New Roman a tamaño físico
  exacto (mm) vía medición real del x-height del glifo en `<canvas>` — no
  asume que el `font-size` CSS corresponda a la altura visible, ya que esa
  relación varía por fuente y por navegador.
- **Sin persistencia de datos de paciente:** los resultados del examen viven
  solo en el estado de la sesión de React y se pierden al recargar o cerrar
  la pestaña. Esto es intencional (no requisito clínico de historial).

## Constantes verificadas contra fuentes oftalmológicas

- Definición M-unit (Sloan): 1M subtiende 5' de arco a 1 metro.
  `alturaLetra_mm = M × 1000 × tan(5')`, con `tan(5') ≈ 0.00145444`.
  Verificado de forma independiente: una letra 20/20 a 6 m mide ≈8.73mm.
- `agudeza_decimal = distancia_examen_m / M_letra`; `logMAR = log10(M_letra / distancia_examen_m)`.
  Verificado: 1.0M leído a 0.40m → logMAR ≈ 0.40 → Snellen 20/50, consistente
  con la tabla logMAR↔Snellen de StatPearls ("Evaluation of Visual Acuity",
  NCBI Bookshelf NBK564307).
- Dimensiones de tarjeta ID-1: ISO/IEC 7810, 85.60 × 53.98 mm.

Todas las constantes que no pudieron verificarse con una fuente citada quedan
marcadas explícitamente en el código con el comentario
`PENDIENTE DE VERIFICACIÓN CLÍNICA` (ver `src/lib/distance/ipdDistance.ts`)
en vez de asumirse en silencio.

## Estructura del proyecto

```
src/
  lib/acuity/        # motor de conversión M-unit/logMAR/Jaeger/N + tests
  lib/calibration/   # localStorage, constantes ISO 7810
  lib/distance/      # estimación de distancia por cámara (MediaPipe)
  components/        # UI compartida (botones, banners, render de optotipos)
  screens/           # las 8 pantallas del flujo
  content/           # párrafos de lectura neutros (es/en)
  state/             # tipos de la sesión de examen (en memoria, no persiste)
```
