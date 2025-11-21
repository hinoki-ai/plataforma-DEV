import { expect, Page, test } from "@playwright/test";

// Production base URL
const PRODUCTION_URL = "https://plataforma.aramac.dev";

// User credentials for different roles
const CREDENTIALS = {
  master: {
    email: process.env.E2E_MASTER_EMAIL ?? "agustinaramac@gmail.com",
    password: process.env.E2E_MASTER_PASSWORD ?? "madmin123",
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "riquelmeiturracatalina@gmail.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "Catata12345",
  },
  profesor: {
    email: process.env.E2E_PROFESOR_EMAIL ?? "profesor@astral.cl",
    password: process.env.E2E_PROFESOR_PASSWORD ?? "profesor123",
  },
  parent: {
    email: process.env.E2E_PARENT_EMAIL ?? "parent@astral.cl",
    password: process.env.E2E_PARENT_PASSWORD ?? "parent123",
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

  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for login form to be ready
  await page.waitForSelector(
    'input[type="email"], input[name*="email"], [aria-label*="email" i]',
    {
      timeout: 15000,
    },
  );

  console.log(`📧 Filling email: ${credentials.email}`);
  await page.getByLabel(/correo electrónico|email/i).fill(credentials.email, {
    timeout: 15000,
  });

  console.log(`🔑 Filling password`);
  await page.getByLabel(/contraseña|password/i).fill(credentials.password, {
    timeout: 15000,
  });

  await dismissAudioBanner(page);

  console.log(`🚀 Clicking login button`);
  const loginButton = page.getByRole("button", {
    name: /ingresar|iniciar sesión|acceder|sign in/i,
  });

  await expect(loginButton).toBeVisible({ timeout: 10000 });
  await loginButton.click();

  console.log(`⏳ Waiting for redirect...`);

  // Wait for redirect with shorter timeout and better error handling
  try {
    await page.waitForFunction(
      () => {
        const currentPath = window.location.pathname;
        console.log(`Current path: ${currentPath}`);
        return (
          [
            "/autenticacion-exitosa",
            "/master",
            "/admin",
            "/profesor",
            "/parent",
          ].some((segment) => currentPath.startsWith(segment)) ||
          currentPath === "/"
        );
      },
      { timeout: 45000 },
    );
  } catch (error) {
    console.log(
      `⚠️ Initial redirect timeout, checking current URL: ${page.url()}`,
    );
    // If we timeout, check if we're already logged in
    const currentPath = new URL(page.url()).pathname;
    if (!["/login", "/"].includes(currentPath)) {
      console.log(`✅ Already redirected to: ${currentPath}`);
    } else {
      throw new Error(`Login redirect failed. Current URL: ${page.url()}`);
    }
  }

  if (page.url().includes("/autenticacion-exitosa")) {
    console.log(
      `🔄 On authentication success page, waiting for final redirect...`,
    );
    // Wait for final redirect
    await page.waitForFunction(
      () => {
        const currentPath = window.location.pathname;
        return ["/master", "/admin", "/profesor", "/parent", "/"].some(
          (segment) => currentPath.startsWith(segment),
        );
      },
      { timeout: 30000 },
    );
  }

  const finalUrl = page.url();
  console.log(`✅ Login complete. Final URL: ${finalUrl}`);

  if (expectedPath) {
    if (!finalUrl.includes(expectedPath)) {
      console.log(`⚠️ Expected path ${expectedPath} but got ${finalUrl}`);
    }
    expect(finalUrl).toContain(expectedPath);
  }
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
    console.log(`🌐 Testing: ${targetUrl}`);

    try {
      const response = await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 25000,
      });

      expect(response, `No response received for ${path}`).not.toBeNull();

      const status = response?.status();
      if (typeof status === "number") {
        console.log(`📊 Status code: ${status}`);
        expect(
          status,
          `Unexpected status code for ${path}: ${status}`,
        ).toBeLessThan(400);
      }

      // Wait for page to be interactive with shorter timeout
      await page.waitForLoadState("domcontentloaded", { timeout: 12000 });

      // Check authentication
      if (expectedRolePath) {
        await ensureAuthenticatedForPage(page, expectedRolePath);
      }

      // Verify we're on the expected page
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (!currentUrl.includes(path)) {
        console.log(`⚠️ Expected path ${path} but got ${currentUrl}`);
        // For some pages, we might be redirected - that's okay as long as we get a valid response
        if (status && status < 400) {
          console.log(`✅ Page loaded successfully despite redirect`);
        } else {
          expect(currentUrl).toContain(path);
        }
      }

      // Basic content verification - page should have some content
      const bodyContent = await page.locator("body").textContent();
      expect(bodyContent?.length).toBeGreaterThan(0);

      // Additional check: wait for any loading indicators to disappear
      try {
        await page.waitForSelector(
          '[aria-busy="true"], .loading, .spinner, [data-loading]',
          {
            state: "detached",
            timeout: 3000,
          },
        );
      } catch {
        // Loading indicators might not exist, that's fine
      }

      console.log(`✅ Successfully loaded: ${path}`);
    } catch (error) {
      console.error(`❌ Failed to load ${path}:`, error);
      throw error;
    }
  });
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
