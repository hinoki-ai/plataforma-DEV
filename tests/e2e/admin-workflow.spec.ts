import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./fixtures/auth.fixture";

// Admin specific test credentials
const ADMIN_CREDENTIALS = {
  email: "admin@plataforma-astral.com",
  password: "admin123",
};

test.describe("Admin Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, ADMIN_CREDENTIALS);
  });

  test.describe("Admin Dashboard", () => {
    test("should display admin dashboard with key metrics", async ({
      page,
    }) => {
      await page.goto("/admin");

      // Verify admin dashboard elements
      await expect(page.getByText(/panel de administración/i)).toBeVisible();
      await expect(page.getByText(/usuarios totales/i)).toBeVisible();
      await expect(page.getByText(/docentes activos/i)).toBeVisible();
      await expect(page.getByText(/estudiantes inscritos/i)).toBeVisible();
      await expect(page.getByText(/centro consejo/i)).toBeVisible();

      // Verify navigation menu
      await expect(page.getByRole("link", { name: /usuarios/i })).toBeVisible();
      await expect(
        page.getByRole("link", { name: /configuración/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /reportes/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /sistema/i })).toBeVisible();
    });

    test("should have access to all system routes", async ({ page }) => {
      // Test admin-only routes
      await page.goto("/admin/usuarios");
      await expect(page).toHaveURL(/.*\/admin\/usuarios.*/);

      await page.goto("/admin/pme");
      await expect(page).toHaveURL(/.*\/admin\/pme.*/);

      await page.goto("/admin/settings");
      await expect(page).toHaveURL(/.*\/admin\/settings.*/);
    });
  });

  test.describe("User Management", () => {
    test("should create new teacher account", async ({ page }) => {
      await page.goto("/admin/usuarios");

      // Click add new user
      await page.getByRole("button", { name: /nuevo usuario/i }).click();

      // Fill teacher information
      await page.getByLabel(/email/i).fill("new.teacher@plataforma-astral.com");
      await page.getByLabel(/nombre completo/i).fill("Nuevo Profesor Test");
      await page.getByLabel(/rol/i).selectOption("PROFESOR");
      await page.getByLabel(/grado/i).selectOption("4th");
      await page.getByLabel(/asignatura/i).selectOption("Math");
      await page.getByLabel(/teléfono/i).fill("+56987654321");

      // Set initial password
      await page.getByLabel(/contraseña/i).fill("TempPass123!");
      await page.getByLabel(/confirmar contraseña/i).fill("TempPass123!");

      // Create account
      await page.getByRole("button", { name: /crear cuenta/i }).click();

      // Verify success
      await expect(page.getByText("Usuario creado exitosamente")).toBeVisible();
      await expect(
        page.getByText("new.teacher@plataforma-astral.com"),
      ).toBeVisible();
    });

    test("should edit existing user", async ({ page }) => {
      await page.goto("/admin/usuarios");

      // Find a user to edit
      const editButton = page.getByRole("button", { name: /editar/i });
      await editButton.first().click();

      // Edit user information
      await page.getByLabel(/nombre completo/i).clear();
      await page.getByLabel(/nombre completo/i).fill("Nombre Actualizado");
      await page.getByLabel(/grado/i).selectOption("5th");

      // Save changes
      await page.getByRole("button", { name: /guardar cambios/i }).click();

      // Verify update
      await expect(page.getByText("Usuario actualizado")).toBeVisible();
      await expect(page.getByText("Nombre Actualizado")).toBeVisible();
    });

    test("should deactivate user account", async ({ page }) => {
      await page.goto("/admin/usuarios");

      // Find a user to deactivate
      const deactivateButton = page.getByRole("button", {
        name: /desactivar/i,
      });
      await deactivateButton.first().click();

      // Confirm deactivation
      await page.getByRole("button", { name: /confirmar/i }).click();

      // Verify deactivation
      await expect(page.getByText("Usuario desactivado")).toBeVisible();
    });

    test("should bulk import users from CSV", async ({ page }) => {
      await page.goto("/admin/usuarios");

      // Click bulk import
      await page.getByRole("button", { name: /importar usuarios/i }).click();

      // Upload CSV file
      const csvContent = `email,name,role,grade,subject
import1@manitospintadas.cl,Profesor 1,PROFESOR,1st,Math
import2@manitospintadas.cl,Profesor 2,PROFESOR,2nd,Science`;

      await page.setInputFiles('input[type="file"]', {
        name: "usuarios.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csvContent),
      });

      // Preview import
      await page.getByRole("button", { name: /previsualizar/i }).click();

      // Confirm import
      await page.getByRole("button", { name: /importar/i }).click();

      // Verify success
      await expect(page.getByText("2 usuarios importados")).toBeVisible();
    });
  });

  test.describe("System Configuration", () => {
    test("should configure school settings", async ({ page }) => {
      await page.goto("/admin/settings");

      // Update school information
      await page.getByLabel(/nombre del colegio/i).clear();
      await page
        .getByLabel(/nombre del colegio/i)
        .fill("Colegio Manitos Pintadas - Test");

      await page.getByLabel(/dirección/i).clear();
      await page.getByLabel(/dirección/i).fill("Av. Test 123, Santiago");

      await page.getByLabel(/teléfono/i).clear();
      await page.getByLabel(/teléfono/i).fill("+56212345678");

      // Configure email settings
      await page.getByLabel(/email del colegio/i).clear();
      await page
        .getByLabel(/email del colegio/i)
        .fill("info@manitospintadas.cl");

      // Save settings
      await page
        .getByRole("button", { name: /guardar configuración/i })
        .click();

      // Verify success
      await expect(page.getByText("Configuración guardada")).toBeVisible();
    });

    test("should manage academic years", async ({ page }) => {
      await page.goto("/admin/settings/academic-years");

      // Add new academic year
      await page.getByRole("button", { name: /nuevo año académico/i }).click();

      await page.getByLabel(/año/i).fill("2024");
      await page.getByLabel(/fecha inicio/i).fill("2024-03-01");
      await page.getByLabel(/fecha fin/i).fill("2024-12-20");

      // Set active year
      await page.getByLabel(/año activo/i).check();

      // Create academic year
      await page.getByRole("button", { name: /crear año académico/i }).click();

      // Verify creation
      await expect(page.getByText("Año académico 2024 creado")).toBeVisible();
    });

    test("should configure grade levels", async ({ page }) => {
      await page.goto("/admin/settings/grades");

      // Add new grade level
      await page.getByRole("button", { name: /nuevo grado/i }).click();

      await page.getByLabel(/nombre del grado/i).fill("Prekinder");
      await page.getByLabel(/orden/i).fill("0");
      await page.getByLabel(/capacidad/i).fill("25");

      // Save grade
      await page.getByRole("button", { name: /guardar grado/i }).click();

      // Verify creation
      await expect(page.getByText("Grado Prekider creado")).toBeVisible();
    });
  });

  test.describe("Security Management", () => {
    test("should configure security settings", async ({ page }) => {
      await page.goto("/admin/security");

      // Configure password policy
      await page.getByLabel(/longitud mínima/i).selectOption("8");
      await page.getByLabel(/requerir mayúsculas/i).check();
      await page.getByLabel(/requerir números/i).check();
      await page.getByLabel(/requerir caracteres especiales/i).check();

      // Configure session timeout
      await page.getByLabel(/tiempo de sesión/i).selectOption("30");

      // Configure login attempts
      await page.getByLabel(/intentos fallidos/i).selectOption("5");

      // Save security settings
      await page
        .getByRole("button", { name: /guardar configuración/i })
        .click();

      // Verify success
      await expect(
        page.getByText("Configuración de seguridad guardada"),
      ).toBeVisible();
    });

    test("should view security logs", async ({ page }) => {
      await page.goto("/admin/security/logs");

      // Verify security logs are displayed
      await expect(page.getByText(/registros de seguridad/i)).toBeVisible();
      await expect(page.getByText(/inicio de sesión/i)).toBeVisible();
      await expect(page.getByText(/intentos fallidos/i)).toBeVisible();

      // Filter logs by date
      await page.getByLabel(/fecha desde/i).fill("2024-01-01");
      await page.getByLabel(/fecha hasta/i).fill("2024-12-31");
      await page.getByRole("button", { name: /filtrar/i }).click();

      // Verify filtered results
      await expect(page.getByText("Logs filtrados")).toBeVisible();
    });

    test("should manage IP whitelist", async ({ page }) => {
      await page.goto("/admin/security/ip-whitelist");

      // Add IP to whitelist
      await page.getByRole("button", { name: /agregar ip/i }).click();
      await page.getByLabel(/dirección ip/i).fill("192.168.1.1");
      await page.getByLabel(/descripción/i).fill("Oficina administrativa");

      await page.getByRole("button", { name: /agregar/i }).click();

      // Verify addition
      await expect(page.getByText("192.168.1.1")).toBeVisible();
    });
  });

  test.describe("Reports and Analytics", () => {
    test("should generate user activity reports", async ({ page }) => {
      await page.goto("/admin/reports");

      // Select report type
      await page
        .getByLabel(/tipo de reporte/i)
        .selectOption("actividad-usuarios");

      // Set date range
      await page.getByLabel(/fecha inicio/i).fill("2024-01-01");
      await page.getByLabel(/fecha fin/i).fill("2024-12-31");

      // Generate report
      await page.getByRole("button", { name: /generar reporte/i }).click();

      // Verify report generation
      await expect(page.getByText("Reporte generado")).toBeVisible();
      await expect(page.getByText(/total usuarios/i)).toBeVisible();
      await expect(page.getByText(/usuarios activos/i)).toBeVisible();
    });

    test("should export system reports", async ({ page }) => {
      await page.goto("/admin/reports");

      // Generate and export report
      await page.getByRole("button", { name: /exportar csv/i }).click();

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: /descargar/i }).click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/reporte.*\.csv/);
    });

    test("should schedule automated reports", async ({ page }) => {
      await page.goto("/admin/reports/automated");

      // Configure automated report
      await page.getByLabel(/tipo de reporte/i).selectOption("resumen-mensual");
      await page.getByLabel(/frecuencia/i).selectOption("monthly");
      await page.getByLabel(/destinatarios/i).fill("admin@manitospintadas.cl");

      // Schedule report
      await page.getByRole("button", { name: /programar reporte/i }).click();

      // Verify scheduling
      await expect(page.getByText("Reporte programado")).toBeVisible();
    });
  });

  test.describe("System Monitoring", () => {
    test("should view system health dashboard", async ({ page }) => {
      await page.goto("/admin/monitoring");

      // Verify monitoring dashboard
      await expect(page.getByText(/salud del sistema/i)).toBeVisible();
      await expect(page.getByText(/estadísticas/i)).toBeVisible();
      await expect(page.getByText(/alertas/i)).toBeVisible();

      // Check key metrics
      await expect(page.getByText(/uptime/i)).toBeVisible();
      await expect(page.getByText(/respuesta/i)).toBeVisible();
      await expect(page.getByText(/uso de recursos/i)).toBeVisible();
    });

    test("should manage system alerts", async ({ page }) => {
      await page.goto("/admin/monitoring/alerts");

      // Create new alert rule
      await page.getByRole("button", { name: /nueva regla/i }).click();

      await page.getByLabel(/condición/i).selectOption("cpu-usage");
      await page.getByLabel(/umbral/i).fill("80");
      await page.getByLabel(/email/i).fill("admin@manitospintadas.cl");

      await page.getByRole("button", { name: /crear alerta/i }).click();

      // Verify creation
      await expect(page.getByText("Alerta creada")).toBeVisible();
    });
  });

  test.describe("Backup and Recovery", () => {
    test("should create system backup", async ({ page }) => {
      await page.goto("/admin/backup");

      // Create backup
      await page.getByRole("button", { name: /crear backup/i }).click();

      // Choose backup type
      await page.getByLabel(/tipo de backup/i).selectOption("complete");
      await page.getByRole("button", { name: /confirmar/i }).click();

      // Verify backup creation
      await expect(page.getByText("Backup creado exitosamente")).toBeVisible();
    });

    test("should restore from backup", async ({ page }) => {
      await page.goto("/admin/backup");

      // Select backup to restore
      const restoreButton = page.getByRole("button", { name: /restaurar/i });
      if ((await restoreButton.count()) > 0) {
        await restoreButton.first().click();

        // Confirm restore
        await page
          .getByRole("button", { name: /confirmar restauración/i })
          .click();

        // Verify restoration
        await expect(page.getByText("Restauración completada")).toBeVisible();
      }
    });
  });

  test.describe("Error Handling and Edge Cases", () => {
    test("should handle bulk operations gracefully", async ({ page }) => {
      await page.goto("/admin/usuarios");

      // Select multiple users
      await page.getByRole("checkbox", { name: /seleccionar todo/i }).check();

      // Attempt bulk operation
      await page.getByRole("button", { name: /acciones masivas/i }).click();
      await page
        .getByRole("button", { name: /desactivar seleccionados/i })
        .click();

      // Confirm bulk operation
      await page.getByRole("button", { name: /confirmar/i }).click();

      // Verify operation
      await expect(page.getByText("Operación masiva completada")).toBeVisible();
    });

    test("should handle invalid CSV imports", async ({ page }) => {
      await page.goto("/admin/usuarios");

      // Import invalid CSV
      const invalidCsv = "invalid,data,format\nthis,is,not,correct";

      await page.setInputFiles('input[type="file"]', {
        name: "invalid.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(invalidCsv),
      });

      // Verify error handling
      await expect(page.getByText(/error en formato csv/i)).toBeVisible();
    });

    test("should prevent unauthorized access", async ({ page }) => {
      // Logout admin
      await page.goto("/logout");

      // Attempt to access admin routes
      await page.goto("/admin/usuarios");

      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login.*/);
    });
  });
});
