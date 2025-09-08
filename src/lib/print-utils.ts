/**
 * Print utilities for meeting reports and documents
 * Quick wins for better print experience
 */

/**
 * Trigger browser print dialog with custom options
 */
export function printElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte - Manitos Pintadas</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            color: #000;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          .school-name {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          .report-title {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .date {
            font-size: 0.875rem;
            color: #666;
          }
          .content {
            line-height: 1.5;
          }
          .section {
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid #000;
            padding-bottom: 0.25rem;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          .data-table th,
          .data-table td {
            border: 1px solid #000;
            padding: 0.5rem;
            text-align: left;
          }
          .data-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #000;
            font-size: 0.875rem;
            text-align: center;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Generate print-friendly reservation report
 */
export function generateReservationReport(reservations: any[]) {
  const reportDate = new Date().toLocaleDateString('es-CL');

  return `
    <div class="header">
      <div class="school-name">Escuela Especial de Lenguaje Manitos Pintadas</div>
      <div class="report-title">Reporte de Reservas</div>
      <div class="date">Generado: ${reportDate}</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Resumen</div>
        <p>Total de reservas: ${reservations.length}</p>
        <p>Reservas pendientes: ${reservations.filter(r => r.status === 'PENDING').length}</p>
        <p>Reservas confirmadas: ${reservations.filter(r => r.status === 'CONFIRMED').length}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Detalles de Reservas</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Apoderado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${reservations
              .map(
                r => `
              <tr>
                <td>${new Date(r.preferredDate).toLocaleDateString('es-CL')}</td>
                <td>${r.preferredTime}</td>
                <td>${r.guardianName}</td>
                <td>${r.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      Escuela Especial de Lenguaje Manitos Pintadas - Centro de Padres y Consejo Escolar
    </div>
  `;
}

/**
 * Print-friendly meeting document template
 */
export function generateMeetingDocument(meeting: any) {
  const meetingDate = new Date(meeting.date).toLocaleDateString('es-CL');

  return `
    <div class="header">
      <div class="school-name">Escuela Especial de Lenguaje Manitos Pintadas</div>
      <div class="report-title">Acta de Reunión</div>
      <div class="date">Fecha: ${meetingDate}</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Información de la Reunión</div>
        <p><strong>Título:</strong> ${meeting.title}</p>
        <p><strong>Fecha:</strong> ${meetingDate}</p>
        <p><strong>Hora:</strong> ${meeting.time}</p>
        <p><strong>Ubicación:</strong> ${meeting.location}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Descripción</div>
        <p>${meeting.description}</p>
      </div>
      
      ${
        meeting.notes
          ? `
        <div class="section">
          <div class="section-title">Notas</div>
          <p>${meeting.notes}</p>
        </div>
      `
          : ''
      }
    </div>
    
    <div class="footer">
      Generado automáticamente por el Sistema de Gestión Escolar Manitos Pintadas
    </div>
  `;
}

/**
 * Utility to add print styles to any component
 */
export function addPrintStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      .print-hide { display: none !important; }
      .print-only { display: block !important; }
      .print-break { page-break-before: always; }
      body { margin: 1rem; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Quick print function for any element
 */
export function quickPrint(selector: string) {
  const element = document.querySelector(selector);
  if (element) {
    window.print();
  }
}
