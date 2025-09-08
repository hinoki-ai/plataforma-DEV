/**
 * DEPRECATED: Translation Test Script
 * This script uses CommonJS and outdated patterns
 * Translation testing should be integrated into the main test suite
 *
 * This script is kept for reference only
 */

// Quick test to verify translation function works with nested keys
const commonES = require('./src/locales/es/common.json');
const commonEN = require('./src/locales/en/common.json');

// Helper function to get nested value using dot notation
const getNestedValue = (obj, path) => {
  const parts = path.split('.');
  const firstKey = parts[0] + '.' + parts[1]; // e.g., 'centro_consejo.testimonials'
  const remainingPath = parts.slice(2).join('.'); // e.g., 'maria_gonzalez.name'

  // First get the nested object
  const nestedObj = obj[firstKey];
  if (!nestedObj) return undefined;

  // Then traverse the remaining path within that object
  if (!remainingPath) return nestedObj;

  return remainingPath.split('.').reduce((current, part) => {
    return current && current[part] !== undefined ? current[part] : undefined;
  }, nestedObj);
};

// Test some testimonial keys
const testKeys = [
  'centro_consejo.testimonials.maria_gonzalez.name',
  'centro_consejo.testimonials.carlos_rodriguez.role',
  'centro_consejo.testimonials.ana_silva.content'
];

console.log('Testing Spanish translations:');
testKeys.forEach(key => {
  const result = getNestedValue(commonES, key);
  console.log(`${key}: ${result || 'NOT FOUND'}`);
});

console.log('\nTesting English translations:');
testKeys.forEach(key => {
  const result = getNestedValue(commonEN, key);
  console.log(`${key}: ${result || 'NOT FOUND'}`);
});