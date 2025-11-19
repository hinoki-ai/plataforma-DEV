const fs = require('fs');

// Read the current calendar file
const calendarContent = fs.readFileSync('src/data/comprehensive-calendar.ts', 'utf8');

// Extract holidays data
const holidaysMatch = calendarContent.match(/export const chileanHolidays: ChileanHoliday\[\] = (\[[\s\S]*?\]);/);
if (holidaysMatch) {
  // Convert TypeScript object syntax to JSON
  let holidaysJson = holidaysMatch[1]
    .replace(/(\w+):/g, '"$1":')  // Add quotes to keys
    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
    .replace(/true/g, 'true')
    .replace(/false/g, 'false');

  // Write to JSON file
  fs.writeFileSync('src/data/chilean-holidays.json', holidaysJson);
  console.log('✅ Chilean holidays converted to JSON');
}

// Extract academic calendar data
const academicMatch = calendarContent.match(/export const academicCalendar: AcademicEvent\[\] = (\[[\s\S]*?\]);/);
if (academicMatch) {
  let academicJson = academicMatch[1]
    .replace(/(\w+):/g, '"$1":')
    .replace(/,(\s*[}\]])/g, '$1');

  fs.writeFileSync('src/data/academic-calendar.json', academicJson);
  console.log('✅ Academic calendar converted to JSON');
}

// Extract special events data
const specialMatch = calendarContent.match(/export const specialEvents: CalendarEvent\[\] = (\[[\s\S]*?\]);/);
if (specialMatch) {
  let specialJson = specialMatch[1]
    .replace(/(\w+):/g, '"$1":')
    .replace(/,(\s*[}\]])/g, '$1');

  fs.writeFileSync('src/data/special-events.json', specialJson);
  console.log('✅ Special events converted to JSON');
}
