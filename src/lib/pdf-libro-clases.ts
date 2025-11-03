/**
 * PDF Generation Utilities for Libro de Clases
 * Chilean Educational System - Legal Document Export
 * Complies with Chilean Circular N°30 and audit requirements
 */

import puppeteer from "puppeteer";
import { APP_NAME } from "./constants";

export type PDFExportScope = "full_year" | "semester" | "student" | "course";

export type PDFExportPeriod = "PRIMER_SEMESTRE" | "SEGUNDO_SEMESTRE" | "ANUAL";

export interface PDFExportOptions {
  scope: PDFExportScope;
  courseId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  period?: PDFExportPeriod;
  institutionId: string;
}

export interface LibroClasesData {
  institution: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
  };
  course: {
    name: string;
    level: string;
    grade: string;
    section: string;
    academicYear: number;
    teacherName: string;
  };
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    attendance: Array<{
      date: string;
      status: string;
      subject?: string;
    }>;
    grades: Array<{
      date: string;
      subject: string;
      evaluationName: string;
      grade: number;
      maxGrade: number;
      period: string;
    }>;
    observations: Array<{
      date: string;
      type: string;
      category: string;
      observation: string;
      severity?: string;
    }>;
  }>;
  classContent: Array<{
    date: string;
    subject: string;
    topic: string;
    content: string;
    teacherName: string;
  }>;
  meetings: Array<{
    date: string;
    meetingNumber: number;
    studentsPresent: number;
    topicsDiscussed?: string;
  }>;
  metadata: {
    exportDate: string;
    reportType: string;
    academicYear: number;
  };
}

/**
 * Generate PDF HTML for Libro de Clases
 */
function generateLibroClasesHTML(data: LibroClasesData): string {
  const exportDate = new Date(data.metadata.exportDate).toLocaleDateString(
    "es-CL",
  );
  const academicYear = data.metadata.academicYear;

  return `
<!DOCTYPE html>
<html lang="es-CL">
<head>
    <meta charset="UTF-8">
    <title>Libro de Clases - ${data.institution.name} - ${academicYear}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 15mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: #000;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .school-name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .report-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .subtitle {
            font-size: 10pt;
            color: #333;
        }
        
        .metadata {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 8px;
            background-color: #f5f5f5;
            border: 1px solid #000;
            font-size: 8pt;
        }
        
        .course-info {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #000;
        }
        
        .course-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        
        .course-info-label {
            font-weight: bold;
        }
        
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 8pt;
        }
        
        table th, table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
        }
        
        table th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .student-section {
            margin-top: 15px;
            page-break-before: auto;
        }
        
        .student-header {
            font-weight: bold;
            font-size: 10pt;
            background-color: #d0d0d0;
            padding: 5px;
            border: 1px solid #000;
            margin-bottom: 8px;
        }
        
        .no-data {
            text-align: center;
            padding: 10px;
            color: #666;
            font-style: italic;
        }
        
        .stamp-area {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 8pt;
        }
        
        .signature-line {
            display: inline-block;
            width: 150px;
            border-top: 1px solid #000;
            margin: 20px 10px 0 10px;
        }
        
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 7pt;
            color: #666;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .attendance-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 2px;
            margin-bottom: 10px;
        }
        
        .attendance-item {
            border: 1px solid #000;
            padding: 3px;
            font-size: 7pt;
        }
        
        .grade-badge {
            display: inline-block;
            padding: 2px 6px;
            border: 1px solid #000;
            border-radius: 3px;
            font-weight: bold;
        }
        
        .grade-passing {
            background-color: #c8e6c9;
        }
        
        .grade-failing {
            background-color: #ffcdd2;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="school-name">${escapeHtml(data.institution.name)}</div>
        <div class="report-title">LIBRO DE CLASES</div>
        <div class="subtitle">Año Académico ${academicYear}</div>
        <div class="subtitle">${data.metadata.reportType}</div>
    </div>
    
    <!-- Metadata -->
    <div class="metadata">
        <div><strong>Curso:</strong> ${escapeHtml(
          data.course.name,
        )} - ${data.course.section}</div>
        <div><strong>Profesor:</strong> ${escapeHtml(
          data.course.teacherName,
        )}</div>
        <div><strong>Exportado:</strong> ${exportDate}</div>
    </div>
    
    <!-- Course Information -->
    <div class="course-info">
        <div class="course-info-row">
            <span class="course-info-label">Nivel:</span>
            <span>${escapeHtml(data.course.level)}</span>
        </div>
        <div class="course-info-row">
            <span class="course-info-label">Curso:</span>
            <span>${escapeHtml(data.course.grade)}</span>
        </div>
        <div class="course-info-row">
            <span class="course-info-label">Año Académico:</span>
            <span>${academicYear}</span>
        </div>
    </div>
    
    ${generateAttendanceSection(data)}
    ${generateGradesSection(data)}
    ${generateObservationsSection(data)}
    ${generateClassContentSection(data)}
    ${generateMeetingsSection(data)}
    
    <!-- Compliance Stamp Area -->
    <div class="stamp-area">
        <p><strong>Certificación de Registros</strong></p>
        <p style="margin-top: 15px;">Sello y Firma del Director/Directora</p>
        <div style="margin-top: 20px;">
            <span class="signature-line"></span>
            <span class="signature-line"></span>
            <span class="signature-line"></span>
        </div>
        <div style="margin-top: 5px; font-size: 7pt;">
            <span style="display: inline-block; width: 150px;">Director(a)</span>
            <span style="display: inline-block; width: 150px;">Profesor(a) Jefe</span>
            <span style="display: inline-block; width: 150px;">Fecha</span>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        ${data.institution.address} | ${data.institution.phone}<br>
        Generado por ${APP_NAME} - ${exportDate}
    </div>
</body>
</html>
  `;
}

function generateAttendanceSection(data: LibroClasesData): string {
  const totalAttendance = data.students.reduce(
    (sum, s) => sum + s.attendance.length,
    0,
  );

  if (totalAttendance === 0) {
    return `
    <div class="section">
        <div class="section-title">Asistencia Diaria</div>
        <div class="no-data">No hay registros de asistencia</div>
    </div>
    `;
  }

  // Group attendance by date
  const attendanceByDate = new Map<
    string,
    Array<{
      studentName: string;
      status: string;
    }>
  >();

  data.students.forEach((student) => {
    student.attendance.forEach((att) => {
      if (!attendanceByDate.has(att.date)) {
        attendanceByDate.set(att.date, []);
      }
      attendanceByDate.get(att.date)!.push({
        studentName: `${student.firstName} ${student.lastName}`,
        status: att.status,
      });
    });
  });

  let html = `
    <div class="section">
        <div class="section-title">Asistencia Diaria</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 100px;">Fecha</th>
                    <th>Estudiante</th>
                    <th style="width: 80px;">Estado</th>
                </tr>
            </thead>
            <tbody>
  `;

  // Sort dates
  const sortedDates = Array.from(attendanceByDate.keys()).sort();

  sortedDates.forEach((date) => {
    const attendance = attendanceByDate.get(date)!;
    attendance.forEach((att, idx) => {
      html += `
                <tr>
                    ${idx === 0 ? `<td rowspan="${attendance.length}">${formatDate(date)}</td>` : ""}
                    <td>${escapeHtml(att.studentName)}</td>
                    <td class="text-center">${formatAttendanceStatus(att.status)}</td>
                </tr>
      `;
    });
  });

  html += `
            </tbody>
        </table>
    </div>
  `;

  return html;
}

function generateGradesSection(data: LibroClasesData): string {
  const totalGrades = data.students.reduce(
    (sum, s) => sum + s.grades.length,
    0,
  );

  if (totalGrades === 0) {
    return `
    <div class="section">
        <div class="section-title">Calificaciones</div>
        <div class="no-data">No hay registros de calificaciones</div>
    </div>
    `;
  }

  let html = `
    <div class="section">
        <div class="section-title">Calificaciones</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 80px;">Fecha</th>
                    <th>Estudiante</th>
                    <th>Asignatura</th>
                    <th style="width: 120px;">Evaluación</th>
                    <th style="width: 60px;">Nota</th>
                    <th style="width: 80px;">Período</th>
                </tr>
            </thead>
            <tbody>
  `;

  data.students.forEach((student) => {
    student.grades.forEach((grade) => {
      const passing = grade.grade >= 4.0;
      html += `
                <tr>
                    <td>${formatDate(grade.date)}</td>
                    <td>${escapeHtml(
                      `${student.firstName} ${student.lastName}`,
                    )}</td>
                    <td>${escapeHtml(grade.subject)}</td>
                    <td>${escapeHtml(grade.evaluationName)}</td>
                    <td class="text-center">
                        <span class="grade-badge ${
                          passing ? "grade-passing" : "grade-failing"
                        }">${grade.grade.toFixed(1)}</span>
                    </td>
                    <td class="text-center">${formatPeriod(grade.period)}</td>
                </tr>
      `;
    });
  });

  html += `
            </tbody>
        </table>
    </div>
  `;

  return html;
}

function generateObservationsSection(data: LibroClasesData): string {
  const totalObservations = data.students.reduce(
    (sum, s) => sum + s.observations.length,
    0,
  );

  if (totalObservations === 0) {
    return `
    <div class="section">
        <div class="section-title">Observaciones</div>
        <div class="no-data">No hay observaciones registradas</div>
    </div>
    `;
  }

  let html = `
    <div class="section">
        <div class="section-title">Observaciones del Estudiante</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 80px;">Fecha</th>
                    <th>Estudiante</th>
                    <th style="width: 80px;">Tipo</th>
                    <th style="width: 100px;">Categoría</th>
                    <th>Observación</th>
                </tr>
            </thead>
            <tbody>
  `;

  data.students.forEach((student) => {
    student.observations.forEach((obs) => {
      html += `
                <tr>
                    <td>${formatDate(obs.date)}</td>
                    <td>${escapeHtml(
                      `${student.firstName} ${student.lastName}`,
                    )}</td>
                    <td class="text-center">${formatObservationType(obs.type)}</td>
                    <td>${formatCategory(obs.category)}</td>
                    <td>${escapeHtml(obs.observation)}</td>
                </tr>
      `;
    });
  });

  html += `
            </tbody>
        </table>
    </div>
  `;

  return html;
}

function generateClassContentSection(data: LibroClasesData): string {
  if (data.classContent.length === 0) {
    return `
    <div class="section">
        <div class="section-title">Contenidos de Clase</div>
        <div class="no-data">No hay registros de contenidos de clase</div>
    </div>
    `;
  }

  let html = `
    <div class="section page-break">
        <div class="section-title">Contenidos de Clase</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 80px;">Fecha</th>
                    <th>Asignatura</th>
                    <th>Tema</th>
                    <th>Contenido</th>
                    <th style="width: 100px;">Profesor</th>
                </tr>
            </thead>
            <tbody>
  `;

  data.classContent.forEach((content) => {
    html += `
                <tr>
                    <td>${formatDate(content.date)}</td>
                    <td>${escapeHtml(content.subject)}</td>
                    <td>${escapeHtml(content.topic)}</td>
                    <td>${escapeHtml(content.content.substring(0, 100))}${
                      content.content.length > 100 ? "..." : ""
                    }</td>
                    <td>${escapeHtml(content.teacherName)}</td>
                </tr>
    `;
  });

  html += `
            </tbody>
        </table>
    </div>
  `;

  return html;
}

function generateMeetingsSection(data: LibroClasesData): string {
  if (data.meetings.length === 0) {
    return `
    <div class="section">
        <div class="section-title">Reuniones de Apoderados</div>
        <div class="no-data">No hay registros de reuniones</div>
    </div>
    `;
  }

  let html = `
    <div class="section">
        <div class="section-title">Reuniones de Apoderados</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 80px;">Fecha</th>
                    <th style="width: 80px;">Número</th>
                    <th style="width: 100px;">Asistentes</th>
                    <th>Temas Tratados</th>
                </tr>
            </thead>
            <tbody>
  `;

  data.meetings.forEach((meeting) => {
    html += `
                <tr>
                    <td>${formatDate(meeting.date)}</td>
                    <td class="text-center">${meeting.meetingNumber}</td>
                    <td class="text-center">${meeting.studentsPresent} estudiantes</td>
                    <td>${meeting.topicsDiscussed ? escapeHtml(meeting.topicsDiscussed) : "-"}</td>
                </tr>
    `;
  });

  html += `
            </tbody>
        </table>
    </div>
  `;

  return html;
}

// Utility functions
function escapeHtml(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-CL");
  } catch {
    return dateStr;
  }
}

function formatAttendanceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PRESENTE: "P",
    AUSENTE: "A",
    ATRASADO: "T",
    JUSTIFICADO: "J",
    RETIRADO: "R",
  };
  return statusMap[status] || status;
}

function formatPeriod(period: string): string {
  const periodMap: Record<string, string> = {
    PRIMER_SEMESTRE: "1° Sem",
    SEGUNDO_SEMESTRE: "2° Sem",
    ANUAL: "Anual",
  };
  return periodMap[period] || period;
}

function formatObservationType(type: string): string {
  const typeMap: Record<string, string> = {
    POSITIVA: "Positiva",
    NEGATIVA: "Negativa",
    NEUTRA: "Neutra",
  };
  return typeMap[type] || type;
}

function formatCategory(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

/**
 * Generate PDF from libro de clases data
 */
export async function generateLibroClasesPDF(
  data: LibroClasesData,
): Promise<Buffer> {
  const html = generateLibroClasesHTML(data);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Save PDF to file
 */
export async function saveLibroClasesPDF(
  data: LibroClasesData,
  outputPath: string,
): Promise<void> {
  const pdfBuffer = await generateLibroClasesPDF(data);
  const fs = await import("fs/promises");
  await fs.writeFile(outputPath, pdfBuffer);
}
