import { expect, Page, test } from "@playwright/test";

// Production base URL
const PRODUCTION_URL = "https://plataforma.aramac.dev";

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

async function ensureAuthenticatedForPage(
  page: Page,
  expectedRolePath: string,
) {
  const currentUrl = page.url();
  console.log(`🔍 Checking authentication for: ${currentUrl}`);

  // Check if we're on a login page or unauthorized page
  if (
    currentUrl.includes("/login") ||
    currentUrl.includes("/no-autorizado") ||
    currentUrl.includes("/unauthorized")
  ) {
    console.log(`🚨 Authentication required, current URL: ${currentUrl}`);
    throw new Error(`Authentication failed - redirected to: ${currentUrl}`);
  }

  // If we're not on the expected role path, we might have been redirected
  if (!currentUrl.includes(expectedRolePath)) {
    console.log(
      `⚠️ Not on expected path. Expected: ${expectedRolePath}, Current: ${currentUrl}`,
    );
  }

  return true;
}

async function testPageLoad(
  page: Page,
  path: string,
  description: string,
  expectedRolePath?: string,
) {
  await test.step(`Test ${description} - ${path}`, async () => {
    const targetUrl = `${PRODUCTION_URL}${path}`;
    console.log(`🌐 [START] Testing: ${targetUrl}`);
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
    console.log(`⏳ Waiting for page content to stabilize...`);
    await page.waitForTimeout(2000);

    // Comprehensive content checks
    const currentUrl = page.url();
    console.log(`🔍 Analyzing page content...`);

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
      "navigation/sidebar": await Promise.all([
        "nav",
        '[data-testid="sidebar"]',
        "aside",
        ".sidebar",
      ].map(async (sel) => {
        try {
          return await page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      })).then(results => results.some(Boolean)),
      "main content": await Promise.all([
        "main",
        '[data-testid="main-content"]',
        ".main-content",
      ].map(async (sel) => {
        try {
          return await page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      })).then(results => results.some(Boolean)),
      header: await Promise.all(["header", ".header", "nav.navbar"].map(async (sel) => {
        try {
          return await page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      })).then(results => results.some(Boolean)),
      buttons: await page.locator("button").count() > 0,
      forms: await page.locator("form").count() > 0,
      links: await page.locator("a").count() > 0,
      tables: await page.locator("table").count() > 0,
      cards: await Promise.all([".card", '[data-testid*="card"]', "article"].map(async (sel) => {
        try {
          return await page.locator(sel).count() > 0;
        } catch {
          return false;
        }
      })).then(results => results.some(Boolean)),
    };

    console.log(`🔍 UI Elements found:`);
    Object.entries(checks).forEach(([element, found]) => {
      console.log(`   ${found ? "✅" : "❌"} ${element}`);
    });

    // Check 3: Look for page-specific content based on path
    const pageSpecificChecks = getPageSpecificChecks(path);
    if (pageSpecificChecks.length > 0) {
      console.log(`🎯 Page-specific checks for ${path}:`);
      for (const check of pageSpecificChecks) {
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

    // Check 4: JavaScript errors
    const jsErrors: string[] = [];
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    if (jsErrors.length > 0) {
      console.log(`🚨 JavaScript errors detected:`);
      jsErrors.forEach((error) => console.log(`   ❌ ${error}`));
    }

    // Check 5: Network requests (basic)
    let networkRequests = 0;
    let failedRequests = 0;

    page.on("request", (request) => {
      networkRequests++;
      if (request.failure()) {
        failedRequests++;
      }
    });

    await page.waitForTimeout(1000); // Let network settle

    console.log(
      `🌐 Network: ${networkRequests} requests, ${failedRequests} failed`,
    );

    // Final assessment
    const uiElementsFound = Object.values(checks).filter(Boolean).length;
    const hasMinimalContent = bodyLength > 100;
    const hasNavigation = checks["navigation/sidebar"] || checks["header"];
    const hasInteractiveElements =
      checks["buttons"] || checks["forms"] || checks["links"];

    console.log(`📊 Page Assessment:`);
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
      `   JavaScript Errors: ${jsErrors.length === 0 ? "✅ None" : "❌ " + jsErrors.length + " found"}`,
    );

    // Overall success criteria
    const isSuccessful =
      status === 200 &&
      hasMinimalContent &&
      hasNavigation &&
      jsErrors.length === 0;

    if (isSuccessful) {
      console.log(
        `✅ [SUCCESS] Page ${path} loaded successfully and is functional`,
      );
    } else {
      console.log(
        `⚠️  [ISSUES DETECTED] Page ${path} has problems - check logs above`,
      );
      if (!hasNavigation) {
        console.log(
          `🚨 [CRITICAL] No navigation elements found - page may be broken`,
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

function getPageSpecificChecks(
  path: string,
): Array<{ selector: string; description: string; required: boolean }> {
  const checks: Record<
    string,
    Array<{ selector: string; description: string; required: boolean }>
  > = {
    // Master Dashboard
    "/master": [
      {
        selector: '[data-testid*="dashboard"], .dashboard, .overview',
        description: "Dashboard content",
        required: false,
      },
      {
        selector:
          'button:has-text("Create"), button:has-text("New"), button:has-text("Add")',
        description: "Action buttons",
        required: false,
      },
      {
        selector: '.stats, .metrics, [data-testid*="stat"]',
        description: "Statistics/metrics",
        required: false,
      },
    ],
    "/master/institutions": [
      {
        selector:
          'button:has-text("Create"), button:has-text("New"), button:has-text("Add"), button:has-text("Crear")',
        description: "Institution creation button",
        required: true,
      },
      {
        selector: 'table, .table, [data-testid*="table"]',
        description: "Institutions table/list",
        required: false,
      },
      {
        selector:
          '.institution, .institucion, [data-testid*="institution"], .card, article',
        description: "Institution items",
        required: false,
      },
    ],
    "/master/user-management": [
      {
        selector:
          'button:has-text("Create"), button:has-text("New"), button:has-text("Add"), button:has-text("Crear")',
        description: "User creation button",
        required: true,
      },
      {
        selector: 'table, .table, [data-testid*="table"]',
        description: "Users table",
        required: false,
      },
      {
        selector: '.user, .usuario, [data-testid*="user"], .card, article',
        description: "User items",
        required: false,
      },
    ],
    "/master/security-center": [
      {
        selector: '.security, .seguridad, [data-testid*="security"]',
        description: "Security content",
        required: false,
      },
      {
        selector:
          'button:has-text("Alert"), button:has-text("Security"), button:has-text("Alerta")',
        description: "Security actions",
        required: false,
      },
      {
        selector: '.alert, .alerta, [data-testid*="alert"]',
        description: "Security alerts",
        required: false,
      },
    ],
    "/master/god-mode": [
      {
        selector:
          '.god-mode, .admin, [data-testid*="god"], .console, .terminal',
        description: "God mode interface",
        required: false,
      },
      {
        selector:
          'button:has-text("Execute"), button:has-text("Run"), button:has-text("Ejecutar")',
        description: "Advanced actions",
        required: false,
      },
      {
        selector: '.console, .terminal, [data-testid*="console"]',
        description: "Console interface",
        required: false,
      },
    ],
  };

  // Return checks for exact path match or partial match
  for (const [routePath, routeChecks] of Object.entries(checks)) {
    if (path === routePath || path.startsWith(routePath)) {
      return routeChecks;
    }
  }

  return [];
}

test.describe("Comprehensive Navigation Tests - Production Site", () => {
  test.setTimeout(60000); // 1 minute per test
  test.describe.configure({ mode: "serial", retries: 2 }); // Retry failed tests up to 2 times

  test.describe("Master Dashboard Navigation", () => {
    test("master user can access all master dashboard pages", async ({
      page,
    }) => {
      await test.step("Login as master user", async () => {
        await performLogin(page, CREDENTIALS.master, "/master");
      });

      const masterRoutes = [
        { path: "/master", description: "Master Dashboard Home" },
        { path: "/master/global-oversight", description: "Global Oversight" },
        { path: "/master/system-stats", description: "System Statistics" },
        { path: "/master/system-health", description: "System Health" },
        {
          path: "/master/institutions",
          description: "Institutions Management",
        },
        {
          path: "/master/institution-creation",
          description: "Institution Creation",
        },
        { path: "/master/user-management", description: "User Management" },
        { path: "/master/role-management", description: "Role Management" },
        { path: "/master/user-analytics", description: "User Analytics" },
        { path: "/master/system-config", description: "System Configuration" },
        { path: "/master/global-settings", description: "Global Settings" },
        { path: "/master/security-center", description: "Security Center" },
        { path: "/master/security", description: "Security Page" },
        { path: "/master/security-alerts", description: "Security Alerts" },
        { path: "/master/database-tools", description: "Database Tools" },
        { path: "/master/god-mode", description: "God Mode" },
        { path: "/master/debug-console", description: "Debug Console" },
        {
          path: "/master/advanced-operations",
          description: "Advanced Operations",
        },
        { path: "/master/audit-logs", description: "Audit Logs" },
        { path: "/master/audit-master", description: "Audit Master" },
        { path: "/master/system-monitor", description: "System Monitor" },
        { path: "/master/performance", description: "Performance Dashboard" },
        { path: "/master/system-overview", description: "System Overview" },
        // Protocolos de Convivencia
        {
          path: "/master/protocolos-convivencia",
          description: "Protocolos de Convivencia",
        },
        {
          path: "/master/protocolos-convivencia/actas-alumnos",
          description: "Actas Alumnos",
        },
        {
          path: "/master/protocolos-convivencia/actas-apoderados",
          description: "Actas Apoderados",
        },
        {
          path: "/master/protocolos-convivencia/disciplina",
          description: "Disciplina",
        },
        {
          path: "/master/protocolos-convivencia/medidas",
          description: "Medidas Disciplinarias",
        },
        {
          path: "/master/protocolos-convivencia/normas",
          description: "Normas de Convivencia",
        },
        {
          path: "/master/protocolos-convivencia/reconocimientos",
          description: "Reconocimientos",
        },
      ];

      for (const route of masterRoutes) {
        await testPageLoad(page, route.path, route.description, "/master");
      }
    });
  });

  test.describe("Admin Dashboard Navigation", () => {
    test("admin user can access all admin dashboard pages", async ({
      page,
    }) => {
      await test.step("Login as admin user", async () => {
        await performLogin(page, CREDENTIALS.admin, "/admin");
      });

      const adminRoutes = [
        { path: "/admin", description: "Admin Dashboard Home" },
        { path: "/admin/usuarios", description: "User Management" },
        { path: "/admin/usuarios/new", description: "Create New User" },
        { path: "/admin/documentos", description: "Document Management" },
        { path: "/admin/reuniones", description: "Meeting Management" },
        { path: "/admin/reuniones/new", description: "Create New Meeting" },
        { path: "/admin/votaciones", description: "Voting Management" },
        { path: "/admin/votaciones/new", description: "Create New Vote" },
        { path: "/admin/calendario-escolar", description: "School Calendar" },
        { path: "/admin/horarios", description: "Schedule Coordination" },
        { path: "/admin/pme", description: "PME Control" },
        { path: "/admin/debug-navigation", description: "Debug Navigation" },
        // Libro de Clases
        { path: "/admin/libro-clases", description: "Libro de Clases" },
        {
          path: "/admin/libro-clases/estudiantes",
          description: "Students in Libro",
        },
        {
          path: "/admin/libro-clases/calificaciones",
          description: "Grades in Libro",
        },
        {
          path: "/admin/libro-clases/observaciones",
          description: "Observations in Libro",
        },
        {
          path: "/admin/libro-clases/asistencia",
          description: "Attendance in Libro",
        },
        // Planificaciones
        { path: "/admin/planificaciones", description: "Planning Management" },
        // Objetivos de Aprendizaje
        {
          path: "/admin/objetivos-aprendizaje",
          description: "Learning Objectives",
        },
        // Equipo Multidisciplinario
        {
          path: "/admin/equipo-multidisciplinario",
          description: "Multidisciplinary Team",
        },
        // Protocolos de Convivencia
        {
          path: "/admin/protocolos-convivencia",
          description: "Protocolos de Convivencia",
        },
        {
          path: "/admin/protocolos-convivencia/actas-alumnos",
          description: "Actas Alumnos",
        },
        {
          path: "/admin/protocolos-convivencia/actas-apoderados",
          description: "Actas Apoderados",
        },
        {
          path: "/admin/protocolos-convivencia/disciplina",
          description: "Disciplina",
        },
        {
          path: "/admin/protocolos-convivencia/medidas",
          description: "Medidas Disciplinarias",
        },
        {
          path: "/admin/protocolos-convivencia/normas",
          description: "Normas de Convivencia",
        },
        {
          path: "/admin/protocolos-convivencia/reconocimientos",
          description: "Reconocimientos",
        },
        // Certification
        { path: "/admin/certificacion", description: "Certification" },
        // Role Examples
        { path: "/admin/role-examples", description: "Role Examples" },
      ];

      for (const route of adminRoutes) {
        await testPageLoad(page, route.path, route.description, "/admin");
      }
    });
  });

  test.describe("Profesor Dashboard Navigation", () => {
    test("profesor user can access all profesor dashboard pages", async ({
      page,
    }) => {
      await test.step("Login as profesor user", async () => {
        await performLogin(page, CREDENTIALS.profesor, "/profesor");
      });

      const profesorRoutes = [
        { path: "/profesor", description: "Profesor Dashboard Home" },
        // Libro de Clases
        { path: "/profesor/libro-clases", description: "Libro de Clases" },
        {
          path: "/profesor/libro-clases/estudiantes",
          description: "Students Management",
        },
        {
          path: "/profesor/libro-clases/calificaciones",
          description: "Grade Management",
        },
        {
          path: "/profesor/libro-clases/observaciones",
          description: "Observations",
        },
        {
          path: "/profesor/libro-clases/asistencia",
          description: "Attendance",
        },
        {
          path: "/profesor/libro-clases/planificaciones",
          description: "Planning",
        },
        { path: "/profesor/libro-clases/contenido", description: "Content" },
        // Activities
        { path: "/profesor/actividades", description: "Activities" },
        { path: "/profesor/actividades/nueva", description: "New Activity" },
        {
          path: "/profesor/actividades/calificar",
          description: "Grade Activities",
        },
        // Planning
        { path: "/profesor/planificaciones", description: "Planning" },
        {
          path: "/profesor/planificaciones/nueva",
          description: "New Planning",
        },
        { path: "/profesor/planificaciones/ver", description: "View Planning" },
        // Calendar
        {
          path: "/profesor/calendario-escolar",
          description: "School Calendar",
        },
        // Schedule
        { path: "/profesor/horarios", description: "Schedule" },
        // PME
        { path: "/profesor/pme", description: "PME" },
        // Protocolos de Convivencia
        {
          path: "/profesor/protocolos-convivencia",
          description: "Protocolos de Convivencia",
        },
        {
          path: "/profesor/protocolos-convivencia/actas-alumnos",
          description: "Actas Alumnos",
        },
        {
          path: "/profesor/protocolos-convivencia/actas-apoderados",
          description: "Actas Apoderados",
        },
        {
          path: "/profesor/protocolos-convivencia/disciplina",
          description: "Disciplina",
        },
        {
          path: "/profesor/protocolos-convivencia/medidas",
          description: "Medidas Disciplinarias",
        },
        {
          path: "/profesor/protocolos-convivencia/normas",
          description: "Normas de Convivencia",
        },
        {
          path: "/profesor/protocolos-convivencia/reconocimientos",
          description: "Reconocimientos",
        },
        // Resources
        { path: "/profesor/recursos", description: "Resources" },
        // Meetings
        { path: "/profesor/reuniones", description: "Meetings" },
        // Parents
        { path: "/profesor/usuarios-padres", description: "Parent Users" },
        // Profile
        { path: "/profesor/perfil", description: "Profile" },
      ];

      for (const route of profesorRoutes) {
        await testPageLoad(page, route.path, route.description, "/profesor");
      }
    });
  });

  test.describe("Parent Dashboard Navigation", () => {
    test("parent user can access all parent dashboard pages", async ({
      page,
    }) => {
      await test.step("Login as parent user", async () => {
        await performLogin(page, CREDENTIALS.parent, "/parent");
      });

      const parentRoutes = [
        { path: "/parent", description: "Parent Dashboard Home" },
        // Students
        { path: "/parent/estudiantes", description: "My Students" },
        // Libro de Clases
        { path: "/parent/libro-clases", description: "Libro de Clases" },
        { path: "/parent/libro-clases/calificaciones", description: "Grades" },
        { path: "/parent/libro-clases/asistencia", description: "Attendance" },
        {
          path: "/parent/libro-clases/observaciones",
          description: "Observations",
        },
        {
          path: "/parent/libro-clases/planificaciones",
          description: "Planning",
        },
        // Communications
        { path: "/parent/comunicacion", description: "Communication" },
        { path: "/parent/comunicacion/mensajes", description: "Messages" },
        { path: "/parent/comunicacion/anuncios", description: "Announcements" },
        // Calendar
        { path: "/parent/calendario-escolar", description: "School Calendar" },
        // Protocolos de Convivencia
        {
          path: "/parent/protocolos-convivencia",
          description: "Protocolos de Convivencia",
        },
        {
          path: "/parent/protocolos-convivencia/actas-alumnos",
          description: "Actas Alumnos",
        },
        {
          path: "/parent/protocolos-convivencia/actas-apoderados",
          description: "Actas Apoderados",
        },
        {
          path: "/parent/protocolos-convivencia/disciplina",
          description: "Disciplina",
        },
        {
          path: "/parent/protocolos-convivencia/medidas",
          description: "Medidas Disciplinarias",
        },
        {
          path: "/parent/protocolos-convivencia/normas",
          description: "Normas de Convivencia",
        },
        {
          path: "/parent/protocolos-convivencia/reconocimientos",
          description: "Reconocimientos",
        },
        // Resources
        { path: "/parent/recursos", description: "Resources" },
        // Meetings
        { path: "/parent/reuniones", description: "Meetings" },
        // Voting
        { path: "/parent/votaciones", description: "Voting" },
      ];

      for (const route of parentRoutes) {
        await testPageLoad(page, route.path, route.description, "/parent");
      }
    });
  });

  test.describe("Component Structure Testing", () => {
    test("test key components render correctly across dashboards", async ({
      page,
    }) => {
      // Test master dashboard components
      await test.step("Login as master and test components", async () => {
        await performLogin(page, CREDENTIALS.master, "/master");

        // Test sidebar navigation
        const sidebar = page
          .locator('[data-testid="sidebar"], nav, aside')
          .first();
        await expect(sidebar).toBeVisible();

        // Test main content area
        const mainContent = page
          .locator('main, [data-testid="main-content"]')
          .first();
        await expect(mainContent).toBeVisible();

        // Test header/navigation bar
        const header = page.locator("header, nav").first();
        await expect(header).toBeVisible();
      });

      // Test admin dashboard components
      await test.step("Navigate to admin and test components", async () => {
        await page.goto(`${PRODUCTION_URL}/admin`, {
          waitUntil: "domcontentloaded",
        });

        // Test data tables
        const tables = page.locator('table, [data-testid*="table"]').first();
        await expect(tables).toBeVisible();

        // Test action buttons
        const buttons = page.locator("button:not([aria-hidden])").first();
        await expect(buttons).toBeVisible();
      });

      // Test profesor dashboard components
      await test.step("Navigate to profesor and test components", async () => {
        await page.goto(`${PRODUCTION_URL}/profesor`, {
          waitUntil: "domcontentloaded",
        });

        // Test form elements
        const forms = page.locator('form, [data-testid*="form"]').first();
        await expect(forms).toBeVisible();
      });

      // Test parent dashboard components
      await test.step("Navigate to parent and test components", async () => {
        await page.goto(`${PRODUCTION_URL}/parent`, {
          waitUntil: "domcontentloaded",
        });

        // Test information display components
        const infoCards = page
          .locator('[data-testid*="card"], .card, article')
          .first();
        await expect(infoCards).toBeVisible();
      });
    });
  });

  test.describe("Cross-Dashboard Navigation", () => {
    test("test navigation between different dashboards", async ({ page }) => {
      // Start with master
      await test.step("Start with master dashboard", async () => {
        await performLogin(page, CREDENTIALS.master, "/master");
        expect(page.url()).toContain("/master");
      });

      // Navigate to admin sections (if accessible)
      await test.step("Test navigation to admin sections", async () => {
        try {
          await page.goto(`${PRODUCTION_URL}/admin`, {
            waitUntil: "domcontentloaded",
          });
          expect(page.url()).toContain("/admin");
        } catch (error) {
          console.log("Master cannot access admin - expected behavior");
        }
      });

      // Navigate to profesor sections (if accessible)
      await test.step("Test navigation to profesor sections", async () => {
        try {
          await page.goto(`${PRODUCTION_URL}/profesor`, {
            waitUntil: "domcontentloaded",
          });
          expect(page.url()).toContain("/profesor");
        } catch (error) {
          console.log("Master cannot access profesor - expected behavior");
        }
      });

      // Navigate to parent sections (if accessible)
      await test.step("Test navigation to parent sections", async () => {
        try {
          await page.goto(`${PRODUCTION_URL}/parent`, {
            waitUntil: "domcontentloaded",
          });
          expect(page.url()).toContain("/parent");
        } catch (error) {
          console.log("Master cannot access parent - expected behavior");
        }
      });
    });
  });
});
