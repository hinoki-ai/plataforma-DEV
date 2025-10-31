const fs = require("fs");
const path = require("path");

// Enhanced PDF generation using professional HTML templates
// This script now uses the enhanced HTML templates for CPMA documents

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Read the enhanced HTML templates
const propuestaTemplatePath = path.join(
  __dirname,
  "..",
  "cpma_propuesta_tecnica.html",
);
const reglamentoTemplatePath = path.join(
  __dirname,
  "..",
  "cpma_reglamento.html",
);

// Check if template files exist
if (!fs.existsSync(propuestaTemplatePath)) {
  console.error("❌ Error: cpma_propuesta_tecnica.html template not found!");
  process.exit(1);
}

if (!fs.existsSync(reglamentoTemplatePath)) {
  console.error("❌ Error: cpma_reglamento.html template not found!");
  process.exit(1);
}

// Read template contents
const propuestaTemplate = fs.readFileSync(propuestaTemplatePath, "utf8");
const reglamentoTemplate = fs.readFileSync(reglamentoTemplatePath, "utf8");

// Add dynamic version information and current date
const currentYear = new Date().getFullYear();
const currentDate = new Date().toLocaleDateString("es-ES", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Update version information in templates
const propuestaContent = propuestaTemplate
  .replace(/VERSIÓN 2\.0 - 2025/g, `VERSIÓN 2.1 - ${currentYear}`)
  .replace(
    /Octubre 2025/g,
    new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

const reglamentoContent = reglamentoTemplate
  .replace(/VERSIÓN 2\.0 - 2025/g, `VERSIÓN 2.1 - ${currentYear}`)
  .replace(
    /Octubre 2025/g,
    new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  )
  .replace(
    /Octubre 2026/g,
    new Date(new Date().setFullYear(currentYear + 1)).toLocaleDateString(
      "es-ES",
      { year: "numeric", month: "long", day: "numeric" },
    ),
  );

// Write enhanced HTML files
fs.writeFileSync(
  path.join(uploadsDir, "propuesta_tecnica-1.html"),
  propuestaContent,
);
fs.writeFileSync(path.join(uploadsDir, "reglamento-1.html"), reglamentoContent);

console.log("✅ HTML files generated successfully!");
console.log("📁 Files created:");
console.log("   - public/uploads/propuesta_tecnica-1.html");
console.log("   - public/uploads/reglamento-1.html");

// Now generate PDFs using puppeteer
async function generatePDFs() {
  const puppeteer = require("puppeteer");

  console.log("");
  console.log("🔄 Generating PDF files...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // Generate Propuesta Técnica PDF
    console.log("📄 Generating propuesta_tecnica-1.pdf...");
    const page1 = await browser.newPage();
    const propuestaHtmlPath = path.join(uploadsDir, "propuesta_tecnica-1.html");
    const propuestaUrl = `file://${propuestaHtmlPath}`;

    await page1.goto(propuestaUrl, { waitUntil: "networkidle0" });
    await page1.pdf({
      path: path.join(uploadsDir, "propuesta_tecnica-1.pdf"),
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });
    console.log("✅ propuesta_tecnica-1.pdf generated successfully!");

    // Generate Reglamento PDF
    console.log("📄 Generating reglamento-1.pdf...");
    const page2 = await browser.newPage();
    const reglamentoHtmlPath = path.join(uploadsDir, "reglamento-1.html");
    const reglamentoUrl = `file://${reglamentoHtmlPath}`;

    await page2.goto(reglamentoUrl, { waitUntil: "networkidle0" });
    await page2.pdf({
      path: path.join(uploadsDir, "reglamento-1.pdf"),
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });
    console.log("✅ reglamento-1.pdf generated successfully!");
  } catch (error) {
    console.error("❌ Error generating PDFs:", error);
    console.log("");
    console.log("⚠️  PDF generation failed. HTML files are still available:");
    console.log("   - public/uploads/propuesta_tecnica-1.html");
    console.log("   - public/uploads/reglamento-1.html");
    console.log("");
    console.log("🔄 You can manually convert these HTML files to PDF using:");
    console.log("   - Online tools like html2pdf.com");
    console.log("   - Browser print to PDF functionality");
    console.log("   - Other PDF conversion tools");
  } finally {
    await browser.close();
  }

  console.log("");
  console.log("🎉 Process completed!");
  console.log("📁 Final files available:");
  console.log("   - public/uploads/propuesta_tecnica-1.html");
  console.log("   - public/uploads/propuesta_tecnica-1.pdf");
  console.log("   - public/uploads/reglamento-1.html");
  console.log("   - public/uploads/reglamento-1.pdf");
  console.log("");
  console.log("📋 Contact Information:");
  console.log("   📍 Centro de Perfeccionamiento y Actualización Magisterial");
  console.log("   📧 cpma@plataforma-astral.com");
  console.log("   📞 (45) 278 3486");
  console.log("   🌐 plataforma-astral.com/cpma");
}

// Run PDF generation
generatePDFs().catch(console.error);
