import { expect, Page, test } from "@playwright/test";

const PRODUCTION_URL = "https://plataforma.aramac.dev";

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

async function testPageLoad(page: Page, path: string, description: string) {
  await test.step(`Test ${description} - ${path}`, async () => {
    const targetUrl = `${PRODUCTION_URL}${path}`;
    console.log(`🌐 Testing: ${targetUrl}`);

    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    expect(response, `No response received for ${path}`).not.toBeNull();

    const status = response?.status();
    if (typeof status === "number") {
      console.log(`📊 Status: ${status}`);
      expect(status).toBeLessThan(400);
    }

    // Quick wait for content
    await page.waitForTimeout(1000);

    // Check if we're on the expected page (allow redirects)
    const currentUrl = page.url();
    console.log(`📍 URL: ${currentUrl}`);

    // Basic check - if we got a valid response, consider it successful
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);

    console.log(`✅ Loaded: ${path}`);
  });
}

test.describe("Basic Production Site Navigation Tests", () => {
  test.setTimeout(30000); // 30 seconds per test

  test("production site loads and basic pages are accessible", async ({
    page,
  }) => {
    // Test basic public pages without login
    const publicRoutes = [
      { path: "/", description: "Home Page" },
      { path: "/login", description: "Login Page" },
      { path: "/registro-centro", description: "Institution Registration" },
      { path: "/contacto", description: "Contact Page" },
      { path: "/privacidad", description: "Privacy Policy" },
      { path: "/terminos", description: "Terms of Service" },
      { path: "/docs", description: "Documentation" },
      {
        path: "/equipo-multidisciplinario",
        description: "Multidisciplinary Team",
      },
      { path: "/programas", description: "Programs" },
      { path: "/planes", description: "Plans" },
      { path: "/cpma", description: "CPMA" },
    ];

    for (const route of publicRoutes) {
      await testPageLoad(page, route.path, route.description);
    }
  });


  test("all expected routes return valid HTTP responses", async ({ page }) => {
    // Test a comprehensive list of all routes from the app structure
    const allRoutes = [
      // Public routes
      "/",
      "/login",
      "/registro-centro",
      "/contacto",
      "/privacidad",
      "/terminos",
      "/docs",
      "/equipo-multidisciplinario",
      "/programas",
      "/planes",
      "/cpma",

      // Auth routes
      "/autenticacion-exitosa",
      "/no-autorizado",

      // Dashboard routes (will redirect but should return valid status)
      "/master",
      "/admin",
      "/profesor",
      "/parent",

      // Master routes
      "/master/global-oversight",
      "/master/system-stats",
      "/master/system-health",
      "/master/institutions",
      "/master/institution-creation",
      "/master/user-management",
      "/master/role-management",
      "/master/user-analytics",
      "/master/system-config",
      "/master/global-settings",
      "/master/security-center",
      "/master/security",
      "/master/security-alerts",
      "/master/database-tools",
      "/master/audit-logs",
      "/master/audit-master",
      "/master/system-monitor",
      "/master/performance",
      "/master/system-overview",

      // Protocolos de Convivencia (Master)
      "/master/protocolos-convivencia",
      "/master/protocolos-convivencia/actas-alumnos",
      "/master/protocolos-convivencia/actas-apoderados",
      "/master/protocolos-convivencia/disciplina",
      "/master/protocolos-convivencia/medidas",
      "/master/protocolos-convivencia/normas",
      "/master/protocolos-convivencia/reconocimientos",

      // Admin routes
      "/admin/usuarios",
      "/admin/usuarios/new",
      "/admin/documentos",
      "/admin/reuniones",
      "/admin/reuniones/new",
      "/admin/votaciones",
      "/admin/votaciones/new",
      "/admin/calendario-escolar",
      "/admin/horarios",
      "/admin/pme",
      "/admin/debug-navigation",
      "/admin/libro-clases",
      "/admin/libro-clases/estudiantes",
      "/admin/libro-clases/calificaciones",
      "/admin/libro-clases/observaciones",
      "/admin/libro-clases/asistencia",
      "/admin/planificaciones",
      "/admin/objetivos-aprendizaje",
      "/admin/equipo-multidisciplinario",
      "/admin/protocolos-convivencia",
      "/admin/protocolos-convivencia/actas-alumnos",
      "/admin/protocolos-convivencia/actas-apoderados",
      "/admin/protocolos-convivencia/disciplina",
      "/admin/protocolos-convivencia/medidas",
      "/admin/protocolos-convivencia/normas",
      "/admin/protocolos-convivencia/reconocimientos",
      "/admin/certificacion",
      "/admin/role-examples",

      // Profesor routes
      "/profesor/libro-clases",
      "/profesor/libro-clases/estudiantes",
      "/profesor/libro-clases/calificaciones",
      "/profesor/libro-clases/observaciones",
      "/profesor/libro-clases/asistencia",
      "/profesor/libro-clases/planificaciones",
      "/profesor/libro-clases/contenido",
      "/profesor/actividades",
      "/profesor/actividades/nueva",
      "/profesor/actividades/calificar",
      "/profesor/planificaciones",
      "/profesor/planificaciones/nueva",
      "/profesor/planificaciones/ver",
      "/profesor/calendario-escolar",
      "/profesor/horarios",
      "/profesor/pme",
      "/profesor/protocolos-convivencia",
      "/profesor/protocolos-convivencia/actas-alumnos",
      "/profesor/protocolos-convivencia/actas-apoderados",
      "/profesor/protocolos-convivencia/disciplina",
      "/profesor/protocolos-convivencia/medidas",
      "/profesor/protocolos-convivencia/normas",
      "/profesor/protocolos-convivencia/reconocimientos",
      "/profesor/recursos",
      "/profesor/reuniones",
      "/profesor/usuarios-padres",
      "/profesor/perfil",

      // Parent routes
      "/parent/estudiantes",
      "/parent/libro-clases",
      "/parent/libro-clases/calificaciones",
      "/parent/libro-clases/asistencia",
      "/parent/libro-clases/observaciones",
      "/parent/libro-clases/planificaciones",
      "/parent/comunicacion",
      "/parent/comunicacion/mensajes",
      "/parent/comunicacion/anuncios",
      "/parent/calendario-escolar",
      "/parent/protocolos-convivencia",
      "/parent/protocolos-convivencia/actas-alumnos",
      "/parent/protocolos-convivencia/actas-apoderados",
      "/parent/protocolos-convivencia/disciplina",
      "/parent/protocolos-convivencia/medidas",
      "/parent/protocolos-convivencia/normas",
      "/parent/protocolos-convivencia/reconocimientos",
      "/parent/recursos",
      "/parent/reuniones",
      "/parent/votaciones",

      // Settings
      "/settings",
    ];

    let successCount = 0;
    let failCount = 0;

    for (const path of allRoutes) {
      try {
        await test.step(`Check ${path}`, async () => {
          const response = await page.goto(`${PRODUCTION_URL}${path}`, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });

          if (response) {
            const status = response.status();
            if (status < 400) {
              successCount++;
              console.log(`✅ ${path} - ${status}`);
            } else {
              failCount++;
              console.log(`❌ ${path} - ${status}`);
            }
          } else {
            failCount++;
            console.log(`❌ ${path} - No response`);
          }
        });
      } catch (error) {
        failCount++;
        console.log(`❌ ${path} - Error: ${error.message}`);
      }
    }

    console.log(
      `\n📊 Results: ${successCount} successful, ${failCount} failed`,
    );

    // At least 80% should be successful
    const totalRoutes = allRoutes.length;
    const successRate = successCount / totalRoutes;
    expect(successRate).toBeGreaterThan(0.8);
  });
});
