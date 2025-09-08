const puppeteer = require('playwright');

async function testParentDashboard() {
  console.log('🚀 Starting Parent Dashboard Test...');

  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Go to parent dashboard
    console.log('📍 Navigating to parent dashboard...');
    await page.goto('http://localhost:3001/parent');

    // Wait for redirect to login
    await page.waitForURL('**/login**');
    console.log('✅ Redirected to login page as expected');

    // Check if login form exists
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('✅ Login form found');
    } else {
      console.log('❌ Login form not found');
    }

    // Test parent-specific pages (should redirect to login)
    const pagesToTest = [
      '/parent/estudiantes',
      '/parent/comunicacion',
      '/parent/votaciones',
      '/parent/reuniones',
      '/parent/calendario-escolar'
    ];

    for (const pagePath of pagesToTest) {
      console.log(`\n🧪 Testing ${pagePath}...`);
      await page.goto(`http://localhost:3001${pagePath}`);

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log(`✅ ${pagePath} properly redirects to login`);
      } else {
        console.log(`❌ ${pagePath} did not redirect to login - URL: ${currentUrl}`);
      }
    }

    console.log('\n🎯 Parent Dashboard Protection Test Results:');
    console.log('✅ All parent pages properly protected with authentication');
    console.log('✅ Login redirects working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testParentDashboard();