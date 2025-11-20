import { expect, Page, test } from "@playwright/test";

const ADMIN_EMAIL =
  process.env.E2E_ADMIN_EMAIL ?? "riquelmeiturracatalina@gmail.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Catata12345";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    "E2E admin credentials are required. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.",
  );
}

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
  baseURL: string,
  callbackPath?: string,
) {
  const onLoginPage = page.url().includes("/login");
  const hasCallbackParam = page.url().includes("callbackUrl=");

  if (!onLoginPage || (callbackPath && !hasCallbackParam)) {
    const loginUrl = new URL("/login", baseURL);
    if (callbackPath) {
      loginUrl.searchParams.set("callbackUrl", callbackPath);
    }
    await page.goto(loginUrl.toString(), { waitUntil: "domcontentloaded" });
  }

  await page.getByLabel(/correo electrónico|email/i).fill(ADMIN_EMAIL, {
    timeout: 30_000,
  });
  await page.getByLabel(/contraseña|password/i).fill(ADMIN_PASSWORD);

  await dismissAudioBanner(page);

  await page
    .getByRole("button", {
      name: /ingresar|iniciar sesión|acceder|sign in/i,
    })
    .click();

  await page.waitForFunction(
    () =>
      ["/autenticacion-exitosa", "/admin"].some((segment) =>
        window.location.pathname.startsWith(segment),
      ),
    { timeout: 60_000 },
  );

  if (page.url().includes("/autenticacion-exitosa")) {
    await page.waitForFunction(
      () => window.location.pathname.startsWith("/admin"),
      { timeout: 60_000 },
    );
  }

  if (callbackPath && !page.url().includes(callbackPath)) {
    const targetUrl = new URL(callbackPath, baseURL).toString();
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  }
}

async function ensureAuthenticated(
  page: Page,
  baseURL: string,
  callbackPath: string,
) {
  const loginHeading = page.getByRole("heading", { name: /portal escolar/i });
  if ((await loginHeading.count()) > 0) {
    await performLogin(page, baseURL, callbackPath);
  }
}

test.describe("Admin navigation", () => {
  test("admin can visit all main routes", async ({ page, baseURL }) => {
    if (!baseURL) {
      throw new Error("Base URL is not configured in Playwright.");
    }

    await test.step("log in as admin", async () => {
      await performLogin(page, baseURL);
      await expect(
        page.getByRole("heading", { name: /panel administrativo/i }),
      ).toBeVisible({ timeout: 45_000 });
    });

    type RouteCheck = {
      path: string;
      headingPattern?: RegExp;
      finalUrlPattern?: RegExp;
      assert?: (page: Page) => Promise<void>;
    };

    const routes: RouteCheck[] = [
      { path: "/admin", headingPattern: /panel administrativo/i },
      {
        path: "/admin/usuarios",
        headingPattern: /gestión de usuarios/i,
        assert: async (currentPage) => {
          const createButton = currentPage.getByRole("button", {
            name: /crear usuario/i,
          });
          await expect(createButton).toBeVisible();
          await createButton.click();
          const dialog = currentPage.getByRole("dialog");
          await expect(dialog).toBeVisible({ timeout: 15_000 });
          await dialog
            .getByRole("button", { name: /cancelar|cerrar/i })
            .first()
            .click();
        },
      },
      {
        path: "/admin/documentos",
        headingPattern: /gestión de documentos/i,
      },
      {
        path: "/admin/reuniones",
        headingPattern: /gestión de reuniones/i,
        assert: async (currentPage) => {
          const newMeeting = currentPage.getByRole("button", {
            name: /nueva reunión/i,
          });
          await expect(newMeeting).toBeVisible();
          await newMeeting.click();
          await expect(currentPage.getByRole("dialog")).toBeVisible({
            timeout: 15_000,
          });
          await currentPage
            .getByRole("button", { name: /cancelar|cerrar/i })
            .first()
            .click();
        },
      },
      {
        path: "/admin/votaciones",
        headingPattern: /gestión de votaciones/i,
        assert: async (currentPage) => {
          const createVote = currentPage.getByRole("button", {
            name: /nueva votación/i,
          });
          await expect(createVote).toBeVisible();
          await createVote.click();
          const dialog = currentPage.getByRole("dialog");
          await expect(dialog).toBeVisible({ timeout: 15_000 });
          await dialog
            .getByRole("button", { name: /cancelar|cerrar/i })
            .first()
            .click();
        },
      },
      {
        path: "/admin/calendario-escolar",
        headingPattern: /calendario escolar 2025 - administración/i,
      },
      {
        path: "/admin/horarios",
        headingPattern: /coordinación integral de horarios/i,
      },
      {
        path: "/admin/pme",
        headingPattern: /pme - control administrativo total/i,
      },
      {
        path: "/admin/debug-navigation",
        headingPattern: /enhanced debug panel/i,
      },
    ];

    for (const route of routes) {
      await test.step(`visit ${route.path}`, async () => {
        const target = new URL(route.path, baseURL).toString();
        const response = await page.goto(target, {
          waitUntil: "domcontentloaded",
        });

        expect(
          response,
          `No response received for ${route.path}`,
        ).not.toBeNull();
        const status = response?.status();
        if (typeof status === "number") {
          expect(
            status,
            `Unexpected status code for ${route.path}`,
          ).toBeLessThan(400);
        }

        if (route.finalUrlPattern) {
          await expect(page).toHaveURL(route.finalUrlPattern);
        }

        await ensureAuthenticated(page, baseURL, route.path);

        if (route.finalUrlPattern) {
          await expect(page).toHaveURL(route.finalUrlPattern);
        }

        if (route.assert) {
          await route.assert(page);
        } else if (route.headingPattern) {
          await expect(
            page.getByRole("heading", { name: route.headingPattern }),
          ).toBeVisible({ timeout: 45_000 });
        }
      });
    }
  });
});
