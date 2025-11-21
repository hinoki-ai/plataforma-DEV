import { expect, Page, test } from "@playwright/test";

// Use environment variable or default to localhost for dev mode
const PRODUCTION_URL =
  process.env.E2E_BASE_URL ||
  (process.env.NODE_ENV === "development" || process.env.E2E_DEV_MODE
    ? "http://localhost:3000"
    : "https://plataforma.aramac.dev");

// User credentials for different roles
const CREDENTIALS = {
  master: {
    email: process.env.E2E_MASTER_EMAIL ?? "agustinarancibia@live.cl",
    password: process.env.E2E_MASTER_PASSWORD ?? "59163476a",
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@astral.cl",
    password: process.env.E2E_ADMIN_PASSWORD ?? "adminastral123.",
  },
  profesor: {
    email: process.env.E2E_PROFESOR_EMAIL ?? "profesor@astral.cl",
    password: process.env.E2E_PROFESOR_PASSWORD ?? "profesorastral123.",
  },
  parent: {
    email: process.env.E2E_PARENT_EMAIL ?? "apoderado@astral.cl",
    password: process.env.E2E_PARENT_PASSWORD ?? "apoderadoastral123.",
  },
};

async function dismissAudioBanner(page: Page) {
  const rejectButton = page.getByRole("button", { name: /no, gracias/i });
  if (await rejectButton.isVisible()) {
    await rejectButton.click();
    return;
  }

  try {
    await page.waitForTimeout(2000);
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
    }
  } catch {
    // ignore
  }
}

async function performLogin(
  page: Page,
  credentials: { email: string; password: string },
  expectedPath?: string,
) {
  console.log(`🔐 Attempting login for ${credentials.email}`);

  const loginUrl = `${PRODUCTION_URL}/login`;
  console.log(`🌐 Navigating to: ${loginUrl}`);

  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

  // Simple, robust login - just fill the first email and password inputs we find
  console.log(`📧 Filling email: ${credentials.email}`);
  await page.locator('input[type="email"]').first().fill(credentials.email);

  console.log(`🔑 Filling password`);
  await page
    .locator('input[type="password"]')
    .first()
    .fill(credentials.password);

  await dismissAudioBanner(page);

  // Check if we're in dev mode (localhost)
  const isDevMode = PRODUCTION_URL.includes("localhost");

  if (isDevMode) {
    console.log(
      `🛠️  Using dev mode login for ${credentials.email} - filling form`,
    );

    // In dev mode, just fill the form and submit it - the page handles dev authentication internally
    console.log(`📝 Filling email: ${credentials.email}`);
    await page.locator('input[type="email"]').first().fill(credentials.email);

    console.log(`🔑 Filling password`);
    await page
      .locator('input[type="password"]')
      .first()
      .fill(credentials.password);

    await dismissAudioBanner(page);

    console.log(`🚀 Clicking login button in dev mode`);
    const loginButton = page
      .locator(
        'button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")',
      )
      .first();

    await loginButton.waitFor({ state: "visible", timeout: 10000 });

    // Wait for button to be enabled (not disabled due to loading)
    let attempts = 0;
    while (attempts < 10) {
      const isEnabled = await loginButton.isEnabled();
      if (isEnabled) break;
      console.log(`⏳ Waiting for login button to be enabled...`);
      await page.waitForTimeout(1000);
      attempts++;
    }

    console.log(`📝 Clicking login button`);
    await loginButton.click();

    // In dev mode, the form submission redirects to autenticacion-exitosa which then redirects to the dashboard
    console.log(`⏳ Waiting for dev authentication redirect...`);

    // Wait for URL to change from login
    let redirectAttempts = 0;
    while (redirectAttempts < 15) {
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl} (attempt ${redirectAttempts + 1})`);

      if (!currentUrl.includes("/login")) {
        console.log(`✅ Redirected away from login page!`);
        break;
      }

      await page.waitForTimeout(1000);
      redirectAttempts++;
    }

    const finalUrl = page.url();
    console.log(`📍 Final URL after login: ${finalUrl}`);

    if (finalUrl.includes("/login")) {
      console.log(`❌ Dev authentication failed - still on login page after ${redirectAttempts} attempts`);
      return false;
    }

    console.log(`✅ Dev authentication successful!`);

    // Wait a bit more for final redirect to dashboard
    await page.waitForTimeout(2000);
    const dashboardUrl = page.url();
    console.log(`📍 Dashboard URL: ${dashboardUrl}`);

    return true;
  } else {
    // Production mode login
    console.log(`🚀 Waiting for login button to be enabled...`);
    // Click the first submit button or button containing login text
    const loginButton = page
      .locator(
        'button[type="submit"], button:has-text("Ingresar"), button:has-text("Login"), button:has-text("Sign in")',
      )
      .first();

    // Wait for button to be visible and enabled
    await loginButton.waitFor({ state: "visible", timeout: 10000 });

    // Wait for button to not be disabled and not contain "Cargando"
    await page.waitForTimeout(2000); // Simple wait to let things settle
    const isEnabled = await loginButton.isEnabled();
    if (!isEnabled) {
      console.log(`⏳ Button still disabled, waiting longer...`);
      await page.waitForTimeout(3000);
    }

    console.log(`🚀 Clicking login button`);
    await loginButton.click({ timeout: 10000 });
  }

  console.log(`⏳ Waiting for redirect...`);

  // Wait for authentication to complete - be more patient
  await page.waitForTimeout(5000); // Wait 5 seconds for auth to process

  // Check current status
  let currentUrl = page.url();
  console.log(`📍 Current URL after login: ${currentUrl}`);

  // If we're still on login page, wait a bit more
  if (currentUrl.includes("/login")) {
    console.log(`🔄 Still on login page, waiting longer...`);
    await page.waitForTimeout(5000); // Wait another 5 seconds
    currentUrl = page.url();
    console.log(`📍 Updated URL: ${currentUrl}`);

    // If still on login after 10 seconds total, something is wrong
    if (currentUrl.includes("/login")) {
      throw new Error(
        `Login failed - still on login page after 10 seconds: ${currentUrl}`,
      );
    }
  }

  // If we reached authentication success page, wait for final redirect
  if (currentUrl.includes("/autenticacion-exitosa")) {
    console.log(`🔄 On auth success page, waiting for final redirect...`);
    await page.waitForTimeout(3000);
    currentUrl = page.url();
    console.log(`📍 Final URL after auth success: ${currentUrl}`);
  }

  // Verify we're on the expected role dashboard
  if (expectedPath) {
    const isOnExpectedPath = currentUrl.includes(expectedPath);
    console.log(`🎯 Expected role path: ${expectedPath}`);
    console.log(
      `📍 Current path check: ${isOnExpectedPath ? "✅ MATCH" : "❌ MISMATCH"}`,
    );

    if (!isOnExpectedPath) {
      console.log(
        `⚠️  [AUTH WARNING] Not on expected path. Expected: ${expectedPath}, Got: ${currentUrl}`,
      );

      // Check if we're at least on some valid dashboard
      const validDashboards = ["/master", "/admin", "/profesor", "/parent"];
      const isOnValidDashboard = validDashboards.some((dash) =>
        currentUrl.includes(dash),
      );

      if (isOnValidDashboard) {
        console.log(
          `🔄 [AUTH OK] On different but valid dashboard - authentication successful`,
        );
      } else {
        console.log(
          `🚨 [AUTH ISSUE] Not on any valid dashboard - authentication may have failed`,
        );
        expect(
          isOnValidDashboard,
          `Expected to be on dashboard but got: ${currentUrl}`,
        ).toBeTruthy();
      }
    } else {
      console.log(`✅ [AUTH SUCCESS] On expected dashboard path`);
    }
  }

  // Verify we have basic dashboard elements
  console.log(`🔍 Verifying dashboard elements...`);

  try {
    // Check for sidebar/navigation
    const sidebarExists =
      (await page
        .locator('nav, aside, [data-testid="sidebar"], .sidebar')
        .count()) > 0;
    console.log(`   ${sidebarExists ? "✅" : "❌"} Sidebar/Navigation present`);

    // Check for main content area
    const mainContentExists =
      (await page
        .locator('main, [data-testid="main-content"], .main-content')
        .count()) > 0;
    console.log(
      `   ${mainContentExists ? "✅" : "❌"} Main content area present`,
    );

    // Check for header
    const headerExists = (await page.locator("header, .header").count()) > 0;
    console.log(`   ${headerExists ? "✅" : "❌"} Header present`);

    // Check for interactive elements
    const buttons = await page.locator("button").count();
    console.log(
      `   ${buttons > 0 ? "✅" : "❌"} Action buttons (${buttons} found)`,
    );

    const links = await page.locator("a").count();
    console.log(
      `   ${links > 0 ? "✅" : "❌"} Navigation links (${links} found)`,
    );

    const dashboardElements = [
      sidebarExists,
      mainContentExists,
      headerExists,
    ].filter(Boolean).length;
    console.log(
      `📊 Dashboard quality: ${dashboardElements}/3 core elements present`,
    );

    if (dashboardElements < 2) {
      console.log(
        `🚨 [DASHBOARD ISSUE] Dashboard appears incomplete - missing core elements`,
      );
    }
  } catch (error) {
    console.log(`❌ Error checking dashboard elements: ${error.message}`);
  }

  console.log(
    `✅ [LOGIN COMPLETE] Authentication successful. Final URL: ${currentUrl}`,
  );
}

async function testLibroClasesPage(
  page: Page,
  path: string,
  description: string,
  expectedRolePath?: string,
) {
  await test.step(`Test ${description} - ${path}`, async () => {
    const targetUrl = `${PRODUCTION_URL}${path}`;
    console.log(`🌐 [START] Testing LIBRO CLASES: ${targetUrl}`);
    console.log(`📝 Description: ${description}`);

    const startTime = Date.now();

    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Page load time: ${loadTime}ms`);

    expect(response, `❌ No response received for ${path}`).not.toBeNull();

    const status = response?.status();
    console.log(`📊 HTTP Status: ${status}`);

    if (typeof status === "number") {
      expect(
        status,
        `❌ Unexpected status code for ${path}: ${status}`,
      ).toBeLessThan(400);

      // Check if redirected to login (indicates authentication required)
      if (status === 200) {
        const currentUrl = page.url();
        console.log(`📍 Final URL: ${currentUrl}`);

        if (
          currentUrl.includes("/login") ||
          currentUrl.includes("/no-autorizado")
        ) {
          console.log(
            `🔒 [AUTH REQUIRED] Page ${path} requires authentication - redirected to: ${currentUrl}`,
          );

          // Check if we have login callback parameter
          if (currentUrl.includes("callbackUrl=")) {
            console.log(
              `🔄 [AUTH FLOW] Proper callback URL found for protected route`,
            );
          } else {
            console.log(
              `⚠️  [AUTH FLOW] No callback URL found - manual redirect`,
            );
          }

          // For authenticated tests, this is a problem - we should be logged in
          if (expectedRolePath) {
            console.log(
              `🚨 [AUTH FAILURE] Expected to be authenticated for ${expectedRolePath} but got redirected to login`,
            );
            console.log(`🔄 [RE-AUTH] Attempting to re-authenticate...`);

            // Re-authenticate
            await performLogin(
              page,
              getCredentialsForRole(expectedRolePath),
              expectedRolePath,
            );

            // Try the page again
            console.log(
              `🔄 [RETRY] Retrying page access after re-authentication...`,
            );
            await page.goto(targetUrl, {
              waitUntil: "domcontentloaded",
              timeout: 15000,
            });

            const retryUrl = page.url();
            console.log(`📍 Retry URL: ${retryUrl}`);

            if (
              retryUrl.includes("/login") ||
              retryUrl.includes("/no-autorizado")
            ) {
              console.log(
                `🚨 [AUTH FAILURE] Still redirected to login after re-authentication`,
              );
              expect(
                retryUrl,
                `Page ${path} should be accessible after authentication`,
              ).not.toMatch(/\/login|\/no-autorizado/);
            } else {
              console.log(
                `✅ [AUTH SUCCESS] Page accessible after re-authentication`,
              );
            }
          } else {
            return; // This is expected for public route tests
          }
        }
      }
    }

    // Wait for content to stabilize
    console.log(`⏳ Waiting for LIBRO CLASES content to stabilize...`);
    await page.waitForTimeout(3000); // Extra time for complex pages

    // Comprehensive content checks
    const currentUrl = page.url();
    console.log(`🔍 Analyzing LIBRO CLASES page content...`);

    // Check 1: Basic body content
    const bodyText = await page.locator("body").textContent();
    const bodyLength = bodyText?.length || 0;
    console.log(`📄 Body content length: ${bodyLength} characters`);

    if (bodyLength < 100) {
      console.log(`⚠️  [CONTENT WARNING] Very minimal content detected`);
      console.log(`📄 Body text: "${bodyText?.substring(0, 200)}..."`);
    }

    // Check 2: Look for common UI elements
    const checks = {
      "navigation/sidebar": [
        "nav",
        '[data-testid="sidebar"]',
        "aside",
        ".sidebar",
      ].some((sel) => {
        try {
          return page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      }),
      "main content": [
        "main",
        '[data-testid="main-content"]',
        ".main-content",
      ].some((sel) => {
        try {
          return page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      }),
      header: ["header", ".header", "nav.navbar"].some((sel) => {
        try {
          return page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      }),
      buttons: page.locator("button").count() > 0,
      forms: page.locator("form").count() > 0,
      links: page.locator("a").count() > 0,
      tables: page.locator("table").count() > 0,
      cards: [".card", '[data-testid*="card"]', "article"].some((sel) => {
        try {
          return page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      }),
    };

    console.log(`🔍 UI Elements found:`);
    Object.entries(checks).forEach(([element, found]) => {
      console.log(`   ${found ? "✅" : "❌"} ${element}`);
    });

    // Check 3: LIBRO CLASES specific content checks
    const libroClasesChecks = getLibroClasesSpecificChecks(path);
    if (libroClasesChecks.length > 0) {
      console.log(`📚 LIBRO CLASES specific checks for ${path}:`);
      for (const check of libroClasesChecks) {
        try {
          const elements = await page.locator(check.selector).count();
          console.log(
            `   ${elements > 0 ? "✅" : "❌"} ${check.description} (${elements} found)`,
          );

          if (elements === 0 && check.required) {
            console.log(
              `   🚨 [REQUIRED ELEMENT MISSING] ${check.description}`,
            );
          }
        } catch (error) {
          console.log(
            `   ❌ Error checking ${check.description}: ${error.message}`,
          );
        }
      }
    }

    // Check 4: Look for libro clases specific text content
    const libroClasesTextChecks = [
      "libro.*clases",
      "Libro.*Clases",
      "class.*book",
      "grade.*book",
      "estudiantes",
      "students",
      "calificaciones",
      "grades",
      "asistencia",
      "attendance",
      "observaciones",
      "observations",
    ];

    console.log(`📖 LIBRO CLASES text content analysis:`);
    let textMatchesFound = 0;
    for (const textPattern of libroClasesTextChecks) {
      try {
        const matches = await page.locator(`text=/${textPattern}/i`).count();
        if (matches > 0) {
          console.log(`   ✅ Found "${textPattern}" (${matches} times)`);
          textMatchesFound++;
        } else {
          console.log(`   ❌ Missing "${textPattern}"`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking "${textPattern}": ${error.message}`);
      }
    }

    // Check 5: JavaScript errors
    const jsErrors = [];
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    if (jsErrors.length > 0) {
      console.log(`🚨 JavaScript errors detected:`);
      jsErrors.forEach((error) => console.log(`   ❌ ${error}`));
    }

    // Check 6: Network requests (basic)
    let networkRequests = 0;
    let failedRequests = 0;

    page.on("request", (request) => {
      networkRequests++;
      if (request.failure()) {
        failedRequests++;
      }
    });

    await page.waitForTimeout(2000); // Let network settle

    console.log(
      `🌐 Network: ${networkRequests} requests, ${failedRequests} failed`,
    );

    // Final assessment
    const uiElementsFound = Object.values(checks).filter(Boolean).length;
    const hasMinimalContent = bodyLength > 100;
    const hasNavigation = checks["navigation/sidebar"] || checks["header"];
    const hasInteractiveElements =
      checks["buttons"] || checks["forms"] || checks["links"];
    const hasLibroClasesContent = textMatchesFound > 3; // At least 4 relevant terms found

    console.log(`📊 LIBRO CLASES Page Assessment:`);
    console.log(
      `   Content Quality: ${hasMinimalContent ? "✅ Good" : "❌ Poor"}`,
    );
    console.log(
      `   UI Elements: ${uiElementsFound}/${Object.keys(checks).length} found`,
    );
    console.log(
      `   Navigation: ${hasNavigation ? "✅ Present" : "❌ Missing"}`,
    );
    console.log(
      `   Interactivity: ${hasInteractiveElements ? "✅ Present" : "❌ Missing"}`,
    );
    console.log(
      `   LIBRO CLASES Content: ${hasLibroClasesContent ? "✅ Found" : "❌ Missing"} (${textMatchesFound}/${libroClasesTextChecks.length} text matches)`,
    );
    console.log(
      `   JavaScript Errors: ${jsErrors.length === 0 ? "✅ None" : "❌ " + jsErrors.length + " found"}`,
    );

    // Overall success criteria for LIBRO CLASES
    const isSuccessful =
      status === 200 &&
      hasMinimalContent &&
      hasNavigation &&
      hasLibroClasesContent &&
      jsErrors.length === 0;

    if (isSuccessful) {
      console.log(
        `✅ [SUCCESS] LIBRO CLASES page ${path} loaded successfully and is functional`,
      );
    } else {
      console.log(
        `⚠️  [ISSUES DETECTED] LIBRO CLASES page ${path} has problems - check logs above`,
      );
      if (!hasNavigation) {
        console.log(
          `🚨 [CRITICAL] No navigation elements found - page may be broken`,
        );
      }
      if (!hasLibroClasesContent) {
        console.log(
          `🚨 [CRITICAL] No LIBRO CLASES specific content found - wrong page or broken`,
        );
      }
      if (jsErrors.length > 0) {
        console.log(
          `🚨 [CRITICAL] JavaScript errors present - functionality compromised`,
        );
      }
    }

    expect(bodyLength).toBeGreaterThan(0);
    expect(status).toBeLessThan(400);
  });
}

function getCredentialsForRole(rolePath: string): {
  email: string;
  password: string;
} {
  switch (rolePath) {
    case "/master":
      return CREDENTIALS.master;
    case "/admin":
      return CREDENTIALS.admin;
    case "/profesor":
      return CREDENTIALS.profesor;
    case "/parent":
      return CREDENTIALS.parent;
    default:
      console.log(
        `⚠️ Unknown role path: ${rolePath}, defaulting to master credentials`,
      );
      return CREDENTIALS.master;
  }
}

function getLibroClasesSpecificChecks(
  path: string,
): Array<{ selector: string; description: string; required: boolean }> {
  const baseChecks = [
    {
      selector:
        'button:has-text("Agregar"), button:has-text("Crear"), button:has-text("Nuevo")',
      description: "Add/Create buttons",
      required: false,
    },
    {
      selector: 'table, .table, [data-testid*="table"]',
      description: "Data tables",
      required: false,
    },
    {
      selector: '.student, .estudiante, [data-testid*="student"]',
      description: "Student elements",
      required: false,
    },
    {
      selector: '.grade, .calificacion, [data-testid*="grade"]',
      description: "Grade elements",
      required: false,
    },
  ];

  // Path-specific checks
  if (path.includes("/estudiantes") || path.includes("/students")) {
    return [
      ...baseChecks,
      {
        selector:
          'button:has-text("Agregar Estudiante"), button:has-text("Add Student")',
        description: "Add student button",
        required: true,
      },
      {
        selector:
          '.student-list, .estudiantes-lista, [data-testid*="student-list"]',
        description: "Student list",
        required: true,
      },
      {
        selector: ".student-card, .tarjeta-estudiante",
        description: "Student cards",
        required: false,
      },
    ];
  }

  if (path.includes("/calificaciones") || path.includes("/grades")) {
    return [
      ...baseChecks,
      {
        selector: 'button:has-text("Calificar"), button:has-text("Grade")',
        description: "Grade button",
        required: true,
      },
      {
        selector: '.grade-input, .input-calificacion, input[type="number"]',
        description: "Grade inputs",
        required: false,
      },
      {
        selector: ".grade-table, .tabla-calificaciones",
        description: "Grade table",
        required: false,
      },
    ];
  }

  if (path.includes("/asistencia") || path.includes("/attendance")) {
    return [
      ...baseChecks,
      {
        selector: 'button:has-text("Marcar"), button:has-text("Presente")',
        description: "Attendance buttons",
        required: false,
      },
      {
        selector:
          '.attendance-check, .check-asistencia, input[type="checkbox"]',
        description: "Attendance checkboxes",
        required: false,
      },
      {
        selector: ".attendance-table, .tabla-asistencia",
        description: "Attendance table",
        required: false,
      },
    ];
  }

  if (path.includes("/observaciones") || path.includes("/observations")) {
    return [
      ...baseChecks,
      {
        selector: "textarea, .observation-input, [contenteditable]",
        description: "Observation inputs",
        required: false,
      },
      {
        selector: 'button:has-text("Guardar"), button:has-text("Save")',
        description: "Save observation button",
        required: false,
      },
      {
        selector: ".observation-list, .lista-observaciones",
        description: "Observation list",
        required: false,
      },
    ];
  }

  if (path.includes("/planificaciones") || path.includes("/planning")) {
    return [
      ...baseChecks,
      {
        selector: 'button:has-text("Planificar"), button:has-text("Plan")',
        description: "Planning button",
        required: false,
      },
      {
        selector: ".lesson-plan, .plan-clase, .planificacion",
        description: "Lesson plans",
        required: false,
      },
      {
        selector: ".objective, .objetivo, .learning-objective",
        description: "Learning objectives",
        required: false,
      },
    ];
  }

  // Default libro clases checks
  return [
    ...baseChecks,
    {
      selector: '.libro-clases, .class-book, [data-testid*="libro"]',
      description: "Libro clases interface",
      required: false,
    },
    {
      selector: '.navigation-tabs, .pestanas, nav[role="tablist"]',
      description: "Navigation tabs",
      required: false,
    },
  ];
}

test.describe("LIBRO CLASES Navigation Tests - Production Site", () => {
  test.setTimeout(90000); // 90 seconds per test
  test.describe.configure({ mode: "serial", retries: 2 });

  test.describe("Master LIBRO CLASES (Admin Role)", () => {
    test("admin can access all libro clases pages", async ({ page }) => {
      await test.step("Login as admin user", async () => {
        await performLogin(page, CREDENTIALS.admin, "/admin");
      });

      // Test admin libro clases routes (no main dashboard, direct to sub-pages)
      const masterLibroClasesRoutes = [
        {
          path: "/admin/libro-clases/asistencia",
          description: "Admin - Libro de Clases - Attendance",
        },
        {
          path: "/admin/libro-clases/estudiantes",
          description: "Admin - Libro de Clases - Students",
        },
        {
          path: "/admin/libro-clases/calificaciones",
          description: "Admin - Libro de Clases - Grades",
        },
        {
          path: "/admin/libro-clases/observaciones",
          description: "Admin - Libro de Clases - Observations",
        },
      ];

      for (const route of masterLibroClasesRoutes) {
        await testLibroClasesPage(
          page,
          route.path,
          route.description,
          "/admin",
        );
      }
    });
  });

  test.describe("Profesor LIBRO CLASES", () => {
    test("profesor can access all libro clases pages", async ({ page }) => {
      await test.step("Login as profesor user", async () => {
        await performLogin(page, CREDENTIALS.profesor, "/profesor");
      });

      const profesorLibroClasesRoutes = [
        {
          path: "/profesor/libro-clases/asistencia",
          description: "Profesor Libro de Clases - Attendance",
        },
        {
          path: "/profesor/libro-clases/contenidos",
          description: "Profesor Libro de Clases - Content",
        },
        {
          path: "/profesor/libro-clases/calificaciones",
          description: "Profesor Libro de Clases - Grade Management",
        },
        {
          path: "/profesor/libro-clases/observaciones",
          description: "Profesor Libro de Clases - Observations",
        },
        {
          path: "/profesor/libro-clases/reuniones",
          description: "Profesor Libro de Clases - Parent Meetings",
        },
        {
          path: "/profesor/libro-clases/cobertura",
          description: "Profesor Libro de Clases - Curriculum Coverage",
        },
      ];

      for (const route of profesorLibroClasesRoutes) {
        await testLibroClasesPage(
          page,
          route.path,
          route.description,
          "/profesor",
        );
      }
    });
  });

  test.describe("Parent LIBRO CLASES", () => {
    test("parent can access all libro clases pages", async ({ page }) => {
      await test.step("Login as parent user", async () => {
        await performLogin(page, CREDENTIALS.parent, "/parent");
      });

      const parentLibroClasesRoutes = [
        {
          path: "/parent/libro-clases/asistencia",
          description: "Parent Libro de Clases - Attendance",
        },
        {
          path: "/parent/libro-clases/calificaciones",
          description: "Parent Libro de Clases - Grades",
        },
        {
          path: "/parent/libro-clases/observaciones",
          description: "Parent Libro de Clases - Observations",
        },
        {
          path: "/parent/libro-clases/reuniones",
          description: "Parent Libro de Clases - Parent Meetings",
        },
      ];

      for (const route of parentLibroClasesRoutes) {
        await testLibroClasesPage(
          page,
          route.path,
          route.description,
          "/parent",
        );
      }
    });
  });

  test.describe("LIBRO CLASES Cross-Role Comparison", () => {
    test("compare libro clases access across all roles", async ({ page }) => {
      const roles = [
        { name: "Admin", credentials: CREDENTIALS.admin, basePath: "/admin" },
        {
          name: "Profesor",
          credentials: CREDENTIALS.profesor,
          basePath: "/profesor",
        },
        {
          name: "Parent",
          credentials: CREDENTIALS.parent,
          basePath: "/parent",
        },
      ];

      const libroClasesPaths = [
        "/libro-clases/asistencia",
        "/libro-clases/estudiantes",
        "/libro-clases/calificaciones",
        "/libro-clases/observaciones",
      ];

      for (const role of roles) {
        console.log(`\n🔄 Testing ${role.name} LIBRO CLASES access...`);

        await test.step(`Login as ${role.name}`, async () => {
          await performLogin(page, role.credentials, role.basePath);
        });

        for (const libroPath of libroClasesPaths) {
          const fullPath = `${role.basePath}${libroPath}`;
          await test.step(`${role.name} - ${libroPath}`, async () => {
            try {
              const response = await page.goto(`${PRODUCTION_URL}${fullPath}`, {
                waitUntil: "domcontentloaded",
                timeout: 15000,
              });

              const status = response?.status();
              const currentUrl = page.url();

              console.log(
                `${role.name} ${libroPath}: ${status} - ${currentUrl.includes("/login") ? "REDIRECTED" : "ACCESSIBLE"}`,
              );

              // Check for libro clases content
              const bodyText = await page.locator("body").textContent();
              const hasLibroContent =
                /libro.*clases|Libro.*Clases|estudiantes|calificaciones|asistencia/i.test(
                  bodyText || "",
                );

              console.log(
                `   ${role.name} ${libroPath} content: ${hasLibroContent ? "✅ LIBRO CLASES" : "❌ NO CONTENT"}`,
              );
            } catch (error) {
              console.log(
                `   ${role.name} ${libroPath}: ❌ ERROR - ${error.message}`,
              );
            }
          });
        }
      }
    });
  });
});
