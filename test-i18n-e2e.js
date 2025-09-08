/**
 * DEPRECATED: i18n E2E Test Script
 * This script uses outdated patterns and should be replaced with proper Playwright tests
 * Use the test framework instead: npm run test:e2e
 *
 * This script is kept for reference only
 */

const { chromium } = require('playwright');

async function testI18nFunctionality() {
  console.log('🚨 DEPRECATED: This test script uses outdated patterns');
  console.log('🕊️ Testing Divine Parsing Oracle - Real E2E i18n Test');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('🌐 Navigating to http://localhost:3001');
    await page.goto('http://localhost:3001');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');

    // Get page content to debug
    const pageContent = await page.textContent('body');
    console.log('📄 Page content preview:', pageContent.substring(0, 500) + '...');

    // Test 1: Check HTML lang attribute
    const htmlLang = await page.getAttribute('html', 'lang');
    console.log('✅ HTML lang attribute:', htmlLang);

    // Test 2: Look for any text content
    const allText = await page.locator('*').allTextContents();
    const visibleText = allText.filter(text => text.trim().length > 0);
    console.log('📝 Visible text elements:', visibleText.slice(0, 10));

    // Test 3: Check for translation keys
    const translationKeys = await page.locator('text=/home\.|nav\.|admin\./').count();
    console.log('🔍 Translation keys found:', translationKeys);

    // Test 4: Look for Spanish words
    const spanishWords = ['Bienvenidas', 'Centro', 'Proyecto', 'Equipo', 'Portal'];
    let foundSpanish = [];
    for (const word of spanishWords) {
      const count = await page.locator(`text=/${word}/`).count();
      if (count > 0) {
        foundSpanish.push(`${word} (${count})`);
      }
    }
    console.log('🇪🇸 Spanish words found:', foundSpanish);

    // Test 5: Look for English words
    const englishWords = ['Welcome', 'Center', 'Project', 'Team', 'Portal'];
    let foundEnglish = [];
    for (const word of englishWords) {
      const count = await page.locator(`text=/${word}/`).count();
      if (count > 0) {
        foundEnglish.push(`${word} (${count})`);
      }
    }
    console.log('🇺🇸 English words found:', foundEnglish);

    if (foundSpanish.length > 0 || foundEnglish.length > 0) {
      console.log('🎉 Divine Parsing Oracle E2E Test PASSED - Translations working!');
    } else {
      console.log('⚠️ No translations found, but page is loading');
    }

  } catch (error) {
    console.error('❌ E2E Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

testI18nFunctionality();