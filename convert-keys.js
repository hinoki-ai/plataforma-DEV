const fs = require('fs');

// Read translation files
const esCommon = JSON.parse(fs.readFileSync('src/locales/es/common.json', 'utf8'));
const enCommon = JSON.parse(fs.readFileSync('src/locales/en/common.json', 'utf8'));

// Find all Cogníto keys
const cognitoKeys = Object.keys(esCommon).filter(k => k.startsWith('Cogníto.'));

console.log('Found', cognitoKeys.length, 'Cogníto keys to convert');

cognitoKeys.forEach(key => {
  const lowercaseKey = key.toLowerCase();
  if (!esCommon[lowercaseKey]) {
    esCommon[lowercaseKey] = esCommon[key];
    console.log('Added ES:', lowercaseKey);
  }
  if (!enCommon[lowercaseKey]) {
    enCommon[lowercaseKey] = enCommon[key];
    console.log('Added EN:', lowercaseKey);
  }
});

// Remove original Cogníto keys
cognitoKeys.forEach(key => {
  delete esCommon[key];
  delete enCommon[key];
  console.log('Removed:', key);
});

// Write back
fs.writeFileSync('src/locales/es/common.json', JSON.stringify(esCommon, null, 2));
fs.writeFileSync('src/locales/en/common.json', JSON.stringify(enCommon, null, 2));

console.log('Conversion complete!');
