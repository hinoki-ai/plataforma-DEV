/**
 * Calendario Escolar Oficial Chile 2025
 * Basado en las resoluciones del Ministerio de Educación (MINEDUC)
 * Específico para Educación Parvularia - Escuela Especial de Lenguaje
 */

export type EventCategory = 'academic' | 'holiday' | 'special' | 'parent';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format YYYY-MM-DD
  time?: string; // Optional time field for events
  location?: string; // Optional location field for events
  category: EventCategory;
  level?: 'NT1' | 'NT2' | 'both'; // Niveles de transición
  isRecurring?: boolean;
  color?: string;
}

// Calendario Oficial MINEDUC 2025
export const chileanCalendarEvents: CalendarEvent[] = [
  // MARZO 2025 - Inicio del Año Escolar
  {
    id: 'inicio-docentes-2025',
    title: 'Inicio Actividades Docentes',
    description:
      'Reuniones de planificación, preparación de aulas y coordinación pedagógica',
    date: '2025-03-03',
    category: 'academic',
    level: 'both',
  },
  {
    id: 'inicio-clases-2025',
    title: 'Inicio del Año Escolar 2025',
    description: 'Primer día de clases para estudiantes NT1 y NT2',
    date: '2025-03-05',
    category: 'academic',
    level: 'both',
  },
  {
    id: 'reunion-apoderados-marzo',
    title: 'Reunión de Apoderados - Inicio de Año',
    description:
      'Presentación del equipo docente, objetivos anuales y calendario de actividades',
    date: '2025-03-12',
    category: 'parent',
    level: 'both',
  },
  {
    id: 'dia-agua-mundial',
    title: 'Día Mundial del Agua',
    description: 'Actividades de concientización sobre el cuidado del agua',
    date: '2025-03-22',
    category: 'special',
    level: 'both',
  },

  // ABRIL 2025
  {
    id: 'semana-santa-1',
    title: 'Jueves Santo',
    description: 'Feriado religioso nacional',
    date: '2025-04-17',
    category: 'holiday',
  },
  {
    id: 'semana-santa-2',
    title: 'Viernes Santo',
    description: 'Feriado religioso nacional',
    date: '2025-04-18',
    category: 'holiday',
  },
  {
    id: 'dia-libro',
    title: 'Día Mundial del Libro',
    description: 'Actividades de fomento lector y cuentacuentos',
    date: '2025-04-23',
    category: 'special',
    level: 'both',
  },
  {
    id: 'evaluacion-trimestral-1',
    title: 'Evaluaciones del Primer Trimestre',
    description: 'Período de evaluación diagnóstica y formativa',
    date: '2025-04-28',
    category: 'academic',
    level: 'both',
  },

  // MAYO 2025
  {
    id: 'dia-trabajador',
    title: 'Día del Trabajador',
    description: 'Feriado nacional',
    date: '2025-05-01',
    category: 'holiday',
  },
  {
    id: 'dia-madre',
    title: 'Celebración Día de la Madre',
    description: 'Actividad especial con presentaciones artísticas',
    date: '2025-05-09',
    category: 'special',
    level: 'both',
  },
  {
    id: 'glorias-navales',
    title: 'Glorias Navales',
    description: 'Feriado nacional',
    date: '2025-05-21',
    category: 'holiday',
  },
  {
    id: 'reunion-apoderados-mayo',
    title: 'Reunión de Apoderados - Primer Trimestre',
    description: 'Entrega de informes de evaluación y retroalimentación',
    date: '2025-05-28',
    category: 'parent',
    level: 'both',
  },

  // JUNIO 2025
  {
    id: 'dia-ambiente',
    title: 'Día Mundial del Medio Ambiente',
    description: 'Actividades de educación ambiental y reciclaje',
    date: '2025-06-05',
    category: 'special',
    level: 'both',
  },
  {
    id: 'dia-padre',
    title: 'Celebración Día del Padre',
    description: 'Actividad especial con juegos y talleres',
    date: '2025-06-13',
    category: 'special',
    level: 'both',
  },
  {
    id: 'inicio-vacaciones-invierno',
    title: 'Inicio Vacaciones de Invierno',
    description: 'Último día de clases antes del receso invernal',
    date: '2025-06-20',
    category: 'academic',
    level: 'both',
  },
  {
    id: 'san-pedro-pablo',
    title: 'San Pedro y San Pablo',
    description: 'Feriado religioso nacional',
    date: '2025-06-29',
    category: 'holiday',
  },

  // JULIO 2025 - Vacaciones de Invierno
  {
    id: 'fin-vacaciones-invierno',
    title: 'Fin Vacaciones de Invierno',
    description: 'Retorno a clases segundo semestre',
    date: '2025-07-07',
    category: 'academic',
    level: 'both',
  },
  {
    id: 'reunion-apoderados-julio',
    title: 'Reunión de Apoderados - Segundo Semestre',
    description: 'Planificación actividades segundo semestre',
    date: '2025-07-16',
    category: 'parent',
    level: 'both',
  },

  // AGOSTO 2025
  {
    id: 'asuncion-virgen',
    title: 'Asunción de la Virgen',
    description: 'Feriado religioso nacional',
    date: '2025-08-15',
    category: 'holiday',
  },
  {
    id: 'semana-educacion-parvularia',
    title: 'Semana de la Educación Parvularia',
    description: 'Celebración del rol fundamental de la educación preescolar',
    date: '2025-08-22',
    category: 'special',
    level: 'both',
  },
  {
    id: 'evaluacion-trimestral-2',
    title: 'Evaluaciones del Segundo Trimestre',
    description: 'Período de evaluación intermedia',
    date: '2025-08-25',
    category: 'academic',
    level: 'both',
  },

  // SEPTIEMBRE 2025 - Fiestas Patrias
  {
    id: 'independencia-chile',
    title: 'Día de la Independencia',
    description: 'Feriado nacional - Celebración patria',
    date: '2025-09-18',
    category: 'holiday',
  },
  {
    id: 'glorias-ejercito',
    title: 'Glorias del Ejército',
    description: 'Feriado nacional',
    date: '2025-09-19',
    category: 'holiday',
  },
  {
    id: 'acto-civico-fiestas-patrias',
    title: 'Acto Cívico Fiestas Patrias',
    description:
      'Celebración con bailes típicos, comidas tradicionales y juegos',
    date: '2025-09-17',
    category: 'special',
    level: 'both',
  },
  {
    id: 'reunion-apoderados-septiembre',
    title: 'Reunión de Apoderados - Fiestas Patrias',
    description: 'Coordinación actividades patrias y segundo trimestre',
    date: '2025-09-24',
    category: 'parent',
    level: 'both',
  },

  // OCTUBRE 2025
  {
    id: 'encuentro-dos-mundos',
    title: 'Encuentro de Dos Mundos',
    description: 'Feriado nacional',
    date: '2025-10-12',
    category: 'holiday',
  },
  {
    id: 'dia-profesor',
    title: 'Día del Profesor',
    description: 'Reconocimiento a la labor docente',
    date: '2025-10-16',
    category: 'special',
    level: 'both',
  },
  {
    id: 'halloween-educativo',
    title: 'Celebración Halloween Educativa',
    description:
      'Actividad lúdica con disfraces y cuentos de terror infantiles',
    date: '2025-10-31',
    category: 'special',
    level: 'both',
  },

  // NOVIEMBRE 2025
  {
    id: 'todos-santos',
    title: 'Día de Todos los Santos',
    description: 'Feriado religioso nacional',
    date: '2025-11-01',
    category: 'holiday',
  },
  {
    id: 'evaluacion-final',
    title: 'Evaluaciones Finales',
    description: 'Período de evaluación final del año escolar',
    date: '2025-11-17',
    category: 'academic',
    level: 'both',
  },
  {
    id: 'reunion-apoderados-noviembre',
    title: 'Reunión de Apoderados - Evaluación Final',
    description: 'Entrega de informes finales y planificación año siguiente',
    date: '2025-11-26',
    category: 'parent',
    level: 'both',
  },

  // DICIEMBRE 2025 - Fin del Año Escolar
  {
    id: 'inmaculada-concepcion',
    title: 'Inmaculada Concepción',
    description: 'Feriado religioso nacional',
    date: '2025-12-08',
    category: 'holiday',
  },
  {
    id: 'ceremonia-graduacion-nt2',
    title: 'Ceremonia de Graduación NT2',
    description:
      'Ceremonia de graduación para estudiantes que pasan a educación básica',
    date: '2025-12-12',
    category: 'special',
    level: 'NT2',
  },
  {
    id: 'ultimo-dia-clases',
    title: 'Último Día de Clases 2025',
    description: 'Fin del año escolar 2025',
    date: '2025-12-19',
    category: 'academic',
    level: 'both',
  },
  {
    id: 'navidad',
    title: 'Navidad',
    description: 'Feriado religioso nacional',
    date: '2025-12-25',
    category: 'holiday',
  },

  // EVENTOS RECURRENTES
  {
    id: 'reunion-equipo-multidisciplinario',
    title: 'Reunión Equipo Multidisciplinario',
    description:
      'Coordinación semanal del equipo de fonoaudiología, psicología y pedagogía',
    date: '2025-03-07',
    category: 'academic',
    level: 'both',
    isRecurring: true,
  },
  {
    id: 'taller-padres-lenguaje',
    title: 'Taller para Padres - Estimulación del Lenguaje',
    description:
      'Taller mensual para apoderados sobre técnicas de estimulación del lenguaje en casa',
    date: '2025-03-20',
    category: 'parent',
    level: 'both',
    isRecurring: true,
  },
  {
    id: 'evaluacion-fonoaudiologica',
    title: 'Evaluación Fonoaudiológica',
    description: 'Evaluación individual del desarrollo del lenguaje',
    date: '2025-04-15',
    category: 'academic',
    level: 'both',
    isRecurring: true,
  },
];

// Categorías y colores para el sistema de filtros
export const eventCategories: Record<
  EventCategory,
  { label: string; color: string; description: string }
> = {
  academic: {
    label: 'Académico',
    color: 'blue',
    description: 'Inicio de clases, evaluaciones, planificación docente',
  },
  holiday: {
    label: 'Feriado',
    color: 'red',
    description: 'Feriados nacionales y religiosos oficiales',
  },
  special: {
    label: 'Evento Especial',
    color: 'purple',
    description: 'Celebraciones, actividades especiales y eventos educativos',
  },
  parent: {
    label: 'Actividad Padres',
    color: 'green',
    description:
      'Reuniones de apoderados, talleres para padres, actividades familiares',
  },
};

// Información específica del sistema educativo chileno para preescolar
export const chileanEducationInfo = {
  schoolYear: {
    start: '2025-03-05',
    end: '2025-12-19',
    winterBreak: {
      start: '2025-06-20',
      end: '2025-07-07',
    },
  },
  levels: {
    NT1: {
      name: 'Primer Nivel de Transición (Pre-Kinder)',
      age: '4 años cumplidos al 31 de marzo',
      description:
        'Desarrollo de habilidades comunicativas, sociales y cognitivas básicas',
    },
    NT2: {
      name: 'Segundo Nivel de Transición (Kinder)',
      age: '5 años cumplidos al 31 de marzo',
      description:
        'Preparación para educación básica, desarrollo de habilidades pre-académicas',
    },
  },
  specialEducation: {
    focus: 'Trastornos Específicos del Lenguaje (TEL)',
    approach: 'Intervención fonoaudiológica especializada',
    teamApproach:
      'Equipo multidisciplinario: educadoras, fonoaudiólogas, psicólogas',
  },
};
