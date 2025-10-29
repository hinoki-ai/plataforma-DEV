#!/usr/bin/env tsx

/**
 * Chilean Holidays Analysis Script
 * Deep analysis of Chilean holiday data for calendar accuracy
 */

import {
  chileanHolidays,
  getHolidaysByYear,
} from "../src/data/comprehensive-calendar";

// Official Chilean holidays based on Chilean law (Ley 2.977 and others)
// Including alternative names that are commonly used
const OFFICIAL_CHILEAN_HOLIDAYS = {
  // Fixed date holidays
  "Año Nuevo": {
    date: "01-01",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Día del Trabajador": {
    date: "05-01",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Día de las Glorias Navales": {
    date: "05-21",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Día de la Virgen del Carmen": {
    date: "07-16",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Asunción de la Virgen": {
    date: "08-15",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Independencia Nacional": {
    date: "09-18",
    isNational: true,
    isRecurring: true,
    aliases: ["Día de la Independencia"],
  },
  "Día de las Glorias del Ejército": {
    date: "09-19",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Día del Encuentro de Dos Mundos": {
    date: "10-12",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Día Nacional de las Iglesias Evangélicas y Protestantes": {
    date: "10-31",
    isNational: true,
    isRecurring: true,
    aliases: ["Día Nacional de las Iglesias Evangélicas"],
  },
  "Día de Todos los Santos": {
    date: "11-01",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  "Inmaculada Concepción": {
    date: "12-08",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
  Navidad: { date: "12-25", isNational: true, isRecurring: true, aliases: [] },

  // Movable date holidays (Easter-based)
  "Viernes Santo": {
    isMovable: true,
    isNational: true,
    isRecurring: false,
    aliases: [],
  },
  "Sábado Santo": {
    isMovable: true,
    isNational: true,
    isRecurring: false,
    aliases: [],
  },
  "Corpus Christi": {
    isMovable: true,
    isNational: true,
    isRecurring: false,
    aliases: [],
  },
  "San Pedro y San Pablo": {
    isMovable: true,
    isNational: true,
    isRecurring: false,
    aliases: [],
  },
  "Día Nacional de los Pueblos Indígenas": {
    date: "06-21",
    isNational: true,
    isRecurring: true,
    aliases: [],
  },
};

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

// Function to get movable holiday dates for a year
function getMovableHolidays(year: number) {
  const easter = calculateEaster(year);
  const easterTime = easter.getTime();

  return {
    "Viernes Santo": new Date(easterTime - 2 * 24 * 60 * 60 * 1000), // 2 days before Easter
    "Sábado Santo": new Date(easterTime - 1 * 24 * 60 * 60 * 1000), // 1 day before Easter
    "Corpus Christi": new Date(easterTime + 60 * 24 * 60 * 60 * 1000), // 60 days after Easter
    "San Pedro y San Pablo": new Date(year, 5, 29), // June 29th (fixed, but can be moved if it falls on weekend)
  };
}

// Function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Function to validate holidays for a specific year
function validateHolidaysForYear(year: number) {
  console.log(`\n=== VALIDATION FOR YEAR ${year} ===`);

  const currentHolidays = getHolidaysByYear(year);
  const movableHolidays = getMovableHolidays(year);
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check fixed date holidays
  Object.entries(OFFICIAL_CHILEAN_HOLIDAYS).forEach(([name, info]) => {
    if (!info.isMovable) {
      const expectedDate = `${year}-${info.date}`;
      // Check for holiday by name or any of its aliases
      const currentHoliday = currentHolidays.find(
        (h) =>
          h.name === name || (info.aliases && info.aliases.includes(h.name)),
      );

      if (!currentHoliday) {
        issues.push(`Missing holiday: ${name} (expected: ${expectedDate})`);
      } else if (currentHoliday.date !== expectedDate) {
        issues.push(
          `Date mismatch for ${name}: current=${currentHoliday.date}, expected=${expectedDate}`,
        );
      } else {
        console.log(`✓ ${name}: ${expectedDate}`);
      }
    }
  });

  // Check movable holidays
  Object.entries(movableHolidays).forEach(([name, expectedDate]) => {
    const expectedDateStr = formatDate(expectedDate);
    const holidayInfo = OFFICIAL_CHILEAN_HOLIDAYS[name];
    // Check for holiday by name or any of its aliases
    const currentHoliday = currentHolidays.find(
      (h) =>
        h.name === name ||
        (holidayInfo?.aliases && holidayInfo.aliases.includes(h.name)),
    );

    if (!currentHoliday) {
      issues.push(
        `Missing movable holiday: ${name} (expected: ${expectedDateStr})`,
      );
    } else if (currentHoliday.date !== expectedDateStr) {
      issues.push(
        `Date mismatch for ${name}: current=${currentHoliday.date}, expected=${expectedDateStr}`,
      );
    } else {
      console.log(`✓ ${name}: ${expectedDateStr}`);
    }
  });

  // Check for extra holidays in our data
  currentHolidays.forEach((holiday) => {
    const isOfficial =
      Object.entries(OFFICIAL_CHILEAN_HOLIDAYS).some(
        ([name, info]) =>
          holiday.name === name ||
          (info.aliases && info.aliases.includes(holiday.name)),
      ) || Object.keys(movableHolidays).includes(holiday.name);

    if (!isOfficial) {
      suggestions.push(
        `Extra holiday found: ${holiday.name} (${holiday.date})`,
      );
    }
  });

  return { issues, suggestions, totalHolidays: currentHolidays.length };
}

// Main analysis function
function analyzeChileanHolidays() {
  console.log("🇨🇱 CHILEAN HOLIDAYS DEEP ANALYSIS");
  console.log("=====================================");

  const years = [
    2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
    2036, 2037, 2038, 2039, 2040,
  ];
  let totalIssues = 0;
  let totalSuggestions = 0;

  years.forEach((year) => {
    const result = validateHolidaysForYear(year);
    totalIssues += result.issues.length;
    totalSuggestions += result.suggestions.length;

    if (result.issues.length > 0) {
      console.log("\n❌ ISSUES FOUND:");
      result.issues.forEach((issue) => console.log(`  - ${issue}`));
    }

    if (result.suggestions.length > 0) {
      console.log("\n💡 SUGGESTIONS:");
      result.suggestions.forEach((suggestion) =>
        console.log(`  - ${suggestion}`),
      );
    }

    console.log(`\n📊 Year ${year}: ${result.totalHolidays} holidays`);
  });

  console.log("\n=====================================");
  console.log("SUMMARY:");
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Total suggestions: ${totalSuggestions}`);

  if (totalIssues === 0) {
    console.log("✅ All official holidays appear to be correctly implemented!");
  }

  // Additional analysis
  console.log("\n🔍 ADDITIONAL ANALYSIS:");
  console.log(`Total holidays in system: ${chileanHolidays.length}`);

  const recurringCount = chileanHolidays.filter((h) => h.isRecurring).length;
  const nonRecurringCount = chileanHolidays.filter(
    (h) => !h.isRecurring,
  ).length;

  console.log(`Recurring holidays: ${recurringCount}`);
  console.log(`Non-recurring holidays: ${nonRecurringCount}`);

  const nationalCount = chileanHolidays.filter((h) => h.isNational).length;
  const regionalCount = chileanHolidays.filter((h) => !h.isNational).length;

  console.log(`National holidays: ${nationalCount}`);
  console.log(`Regional holidays: ${regionalCount}`);

  // Check for duplicates
  const holidayNames = chileanHolidays.map((h) => h.name);
  const duplicates = holidayNames.filter(
    (name, index) => holidayNames.indexOf(name) !== index,
  );
  if (duplicates.length > 0) {
    console.log(
      `⚠️  Potential duplicates found: ${[...new Set(duplicates)].join(", ")}`,
    );
  }
}

// Run the analysis
if (require.main === module) {
  analyzeChileanHolidays();
}

export { analyzeChileanHolidays, validateHolidaysForYear };
