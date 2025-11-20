#!/usr/bin/env tsx

/**
 * Generate Chilean Holidays for 2031-2040
 * Extends the existing holiday data up to 2040
 */

import { chileanHolidays } from "../src/data/comprehensive-calendar";

// Function to calculate Easter date using Gauss algorithm
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

// Function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Function to get movable holiday dates for a year
function getMovableHolidays(year: number) {
  const easter = calculateEaster(year);
  const easterTime = easter.getTime();

  return {
    "Viernes Santo": new Date(easterTime - 2 * 24 * 60 * 60 * 1000), // 2 days before Easter
    "Sábado Santo": new Date(easterTime - 1 * 24 * 60 * 60 * 1000), // 1 day before Easter
    "Corpus Christi": new Date(easterTime + 60 * 24 * 60 * 60 * 1000), // 60 days after Easter
    "San Pedro y San Pablo": new Date(year, 5, 29), // June 29th
  };
}

// Generate holidays for 2031-2040
function generateExtendedHolidays() {
  const extendedHolidays = [];

  for (let year = 2031; year <= 2040; year++) {
    const movableHolidays = getMovableHolidays(year);

    // Fixed date holidays
    const fixedHolidays = [
      {
        id: `new-year-${year}`,
        name: "Año Nuevo",
        description: "Celebración del Año Nuevo",
        date: `${year}-01-01`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `labor-day-${year}`,
        name: "Día del Trabajador",
        description: "Día Internacional del Trabajador",
        date: `${year}-05-01`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `naval-battle-${year}`,
        name: "Día de las Glorias Navales",
        description: "Conmemoración del Combate Naval de Iquique",
        date: `${year}-05-21`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `indigenous-day-${year}`,
        name: "Día Nacional de los Pueblos Indígenas",
        description:
          "Conmemoración del Solsticio de Invierno y los pueblos originarios",
        date: `${year}-06-21`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `virgin-carmen-${year}`,
        name: "Día de la Virgen del Carmen",
        description: "Festividad de la Virgen del Carmen, Patrona de Chile",
        date: `${year}-07-16`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `assumption-${year}`,
        name: "Asunción de la Virgen",
        description: "Asunción de la Virgen María",
        date: `${year}-08-15`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `independence-day-${year}`,
        name: "Día de la Independencia",
        description: "Celebración de la Independencia de Chile",
        date: `${year}-09-18`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `army-day-${year}`,
        name: "Día de las Glorias del Ejército",
        description: "Conmemoración de las Glorias del Ejército de Chile",
        date: `${year}-09-19`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `columbus-day-${year}`,
        name: "Día del Encuentro de Dos Mundos",
        description: "Conmemoración del Descubrimiento de América",
        date: `${year}-10-12`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `reformation-day-${year}`,
        name: "Día Nacional de las Iglesias Evangélicas",
        description: "Día de las Iglesias Evangélicas y Protestantes",
        date: `${year}-10-31`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `all-saints-${year}`,
        name: "Día de Todos los Santos",
        description: "Festividad católica de Todos los Santos",
        date: `${year}-11-01`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `immaculate-conception-${year}`,
        name: "Inmaculada Concepción",
        description: "Festividad de la Inmaculada Concepción",
        date: `${year}-12-08`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
      {
        id: `christmas-${year}`,
        name: "Navidad",
        description: "Celebración del Nacimiento de Jesucristo",
        date: `${year}-12-25`,
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
    ];

    // Movable holidays
    const movableHolidaysArray = [
      {
        id: `good-friday-${year}`,
        name: "Viernes Santo",
        description: "Conmemoración de la Crucifixión de Jesucristo",
        date: formatDate(movableHolidays["Viernes Santo"]),
        isNational: true,
        isRecurring: false,
        category: "holiday" as const,
      },
      {
        id: `easter-saturday-${year}`,
        name: "Sábado Santo",
        description: "Día posterior a Viernes Santo",
        date: formatDate(movableHolidays["Sábado Santo"]),
        isNational: true,
        isRecurring: false,
        category: "holiday" as const,
      },
      {
        id: `corpus-christi-${year}`,
        name: "Corpus Christi",
        description: "Festividad católica del Cuerpo y la Sangre de Cristo",
        date: formatDate(movableHolidays["Corpus Christi"]),
        isNational: true,
        isRecurring: false,
        category: "holiday" as const,
      },
      {
        id: `saint-peter-paul-${year}`,
        name: "San Pedro y San Pablo",
        description: "Festividad de los Santos Pedro y Pablo",
        date: formatDate(movableHolidays["San Pedro y San Pablo"]),
        isNational: true,
        isRecurring: true,
        category: "holiday" as const,
      },
    ];

    extendedHolidays.push(...fixedHolidays, ...movableHolidaysArray);
  }

  return extendedHolidays;
}

// Main execution
if (require.main === module) {
  const extendedHolidays = generateExtendedHolidays();

  // Show sample for 2031

  const holidays2031 = extendedHolidays.filter((h) => h.id.includes("-2031"));
  holidays2031.forEach((holiday) => {});

  // Export for use in calendar

  // You can use this data to update the calendar file
}
