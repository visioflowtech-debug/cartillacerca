/**
 * Párrafos de contenido neutro para las líneas de lectura del examen.
 * Se evita contenido con carga emocional o sensible; se usan oraciones
 * genéricas sin relación con el paciente. Cada tamaño de la cartilla
 * (CARD_M_VALUES, de mayor a menor) usa un párrafo DISTINTO — así el paciente
 * no puede memorizar el texto de una línea anterior y "leerlo" de memoria en
 * una línea más pequeña. Cada párrafo trae suficientes palabras para llenar
 * 4 líneas en la mayoría de anchos de pantalla (ver paragraphLayout.ts, que
 * recicla las palabras desde el inicio si el texto no alcanza).
 */
export const READING_PARAGRAPHS: Record<'es' | 'en', string[]> = {
  es: [
    'El sol brilla sobre el campo mientras el viento mueve las hojas de los árboles cercanos y las nubes cruzan lentamente el cielo azul de la tarde.',
    'Un tren cruza el valle mientras las montañas reflejan la luz de la mañana y los pájaros vuelan cerca del río tranquilo que atraviesa el bosque.',
    'La biblioteca del pueblo abre sus puertas temprano y los estudiantes llegan a estudiar historia, geografía y ciencias naturales antes del mediodía.',
    'El mercado local vende frutas frescas cada semana y los vecinos caminan entre los puestos comprando verduras de temporada para toda la familia.',
    'La fábrica produce herramientas metálicas todos los días y los trabajadores revisan cada pieza antes de empacarla con cuidado en cajas de cartón.',
    'El barco navega despacio por el puerto mientras los pescadores preparan las redes para salir temprano al mar abierto antes del amanecer.',
    'La escuela organiza un concurso de lectura cada año y los niños practican con libros nuevos durante varias semanas antes de la competencia final.',
  ],
  en: [
    'The sun shines over the field while the wind moves the leaves of the nearby trees and the clouds slowly cross the afternoon sky.',
    'A train crosses the valley while the mountains reflect the morning light and birds fly close to the quiet river through the forest.',
    'The town library opens its doors early and students arrive to study history, geography, and natural science before noon every day.',
    'The local market sells fresh fruit every week and neighbors walk between the stalls buying seasonal vegetables for the whole family.',
    'The factory produces metal tools every day and workers check each piece carefully before packing it into cardboard boxes for shipping.',
    'The boat sails slowly through the harbor while fishermen prepare their nets to head out to open water before sunrise.',
    'The school holds a reading contest every year and children practice with new books for several weeks before the final competition.',
  ],
};
