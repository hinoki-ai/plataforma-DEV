import { Resend } from "resend";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

// Development logging for Resend
const isDevelopment = process.env.NODE_ENV === "development";

// Email configuration
const createResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }

  // For development, we'll use console logging instead of actual email sending
  if (isDevelopment) {
    return {
      emails: {
        send: async (options: any) => {
          console.info("📨 Email preview (development)", {
            from: options.from,
            to: options.to,
            subject: options.subject,
            html: options.html?.substring(0, 200) + "...",
          });
          return { data: { id: "dev-" + Date.now() } };
        },
      },
    };
  }

  return new Resend(apiKey);
};

const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || "preuastral@gmail.com";
const DEFAULT_CONTACT_RECIPIENTS = ["preuastral@gmail.com"];

// Stub implementations for missing functions to fix TypeScript errors
// TODO: Implement proper email functionality
function createTransport() {
  throw new Error("Email functionality not implemented");
}

async function dispatchMail(transporter: any, mailOptions: any) {
  throw new Error("Email functionality not implemented");
}

function parseRecipientList(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((email) => email.length > 0);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getContactRecipients(): string[] {
  const sources = [
    process.env.CONTACT_FORM_RECIPIENTS,
    process.env.SCHOOL_EMAIL,
    process.env.EMAIL_FROM,
  ];

  const recipients = new Set<string>();

  for (const source of sources) {
    for (const email of parseRecipientList(source)) {
      recipients.add(email);
    }
  }

  for (const fallbackRecipient of DEFAULT_CONTACT_RECIPIENTS) {
    recipients.add(fallbackRecipient);
  }

  if (!recipients.size) {
    throw new Error(
      "Contact email recipients are not configured. Set CONTACT_FORM_RECIPIENTS, SCHOOL_EMAIL or EMAIL_FROM.",
    );
  }

  return [...recipients];
}

interface SendConfirmationEmailParams {
  to: string;
  name: string;
  verificationToken: string;
}

export async function sendConfirmationEmail({
  to,
  name,
  verificationToken,
}: SendConfirmationEmailParams): Promise<boolean> {
  try {
    const resend = createResendClient();

    const verificationUrl = `${process.env.APP_URL}/cpma/verificar?token=${verificationToken}`;

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject:
        "Confirma tu registro - CPMA Centro de Padres, Madres y Apoderados Plataforma Astral",
      html: getConfirmationEmailTemplate({ name, verificationUrl }),
      text: getConfirmationEmailText({ name, verificationUrl }),
    });

    return result.data?.id ? true : false;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return false;
  }
}

interface SendWelcomeEmailParams {
  to: string;
  name: string;
}

export async function sendWelcomeEmail({
  to,
  name,
}: SendWelcomeEmailParams): Promise<boolean> {
  try {
    const resend = createResendClient();

    const dashboardUrl = `${process.env.APP_URL}/cpma/dashboard`;

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject:
        "¡Bienvenido al CPMA Centro de Padres, Madres y Apoderados Plataforma Astral!",
      html: getWelcomeEmailTemplate({ name, dashboardUrl }),
      text: getWelcomeEmailText({ name, dashboardUrl }),
    });

    return result.data?.id ? true : false;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

interface ContactEmailPayload {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(
  payload: ContactEmailPayload,
): Promise<boolean> {
  try {
    const resend = createResendClient();
    const recipients = getContactRecipients();
    const submittedAt = new Date();

    const normalizedSubject = payload.subject.replace(/\s+/g, " ").trim();
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipients,
      replyTo: payload.email,
      subject: `[Contacto] ${normalizedSubject}`,
      html: getContactEmailTemplate({
        ...payload,
        fullName,
        submittedAt,
      }),
      text: getContactEmailText({
        ...payload,
        fullName,
        submittedAt,
      }),
    });

    return result.data?.id ? true : false;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
}

// Meeting notification interfaces
interface MeetingRequestEmail {
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentGrade: string;
  preferredDate: Date;
  preferredTime: string;
  reason: string;
  additionalNotes?: string;
}

interface MeetingConfirmationEmail {
  to: string;
  parentName: string;
  meetingTitle: string;
  meetingDate: Date;
  meetingTime: string;
  assignedTeacher: string;
  location: string;
}

export async function sendMeetingRequestNotification(
  data: MeetingRequestEmail,
): Promise<boolean> {
  try {
    const transporter = createTransport();
    let recipients: string[] = [];

    try {
      const client = getConvexClient();
      const staff = await client.query(api.users.getStaffUsers, {});
      recipients = staff
        .map((staffMember) => staffMember.email)
        .filter((email): email is string => Boolean(email?.length));
    } catch (convexError) {
      console.warn(
        "Unable to fetch staff recipients from Convex, falling back to contact recipients:",
        convexError,
      );
    }

    if (!recipients.length) {
      recipients = getContactRecipients();
    }

    const mailOptions = {
      from: DEFAULT_FROM_EMAIL,
      to: recipients,
      replyTo: data.parentEmail,
      subject: `Nueva Solicitud de Reunión - ${data.studentName}`,
      html: getMeetingRequestEmailTemplate(data),
      text: getMeetingRequestEmailText(data),
    };

    await dispatchMail(transporter, mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending meeting request notification:", error);
    return false;
  }
}

export async function sendMeetingConfirmation(
  data: MeetingConfirmationEmail,
): Promise<boolean> {
  try {
    const transporter = createTransport();

    const mailOptions = {
      from: DEFAULT_FROM_EMAIL,
      to: data.to,
      subject: `Confirmación de Reunión - ${data.meetingTitle}`,
      html: getMeetingConfirmationEmailTemplate(data),
      text: getMeetingConfirmationEmailText(data),
    };

    await dispatchMail(transporter, mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending meeting confirmation:", error);
    return false;
  }
}

export async function sendMeetingStatusUpdate(
  to: string,
  parentName: string,
  meetingTitle: string,
  status: string,
  notes?: string,
): Promise<boolean> {
  try {
    const transporter = createTransport();

    const mailOptions = {
      from: DEFAULT_FROM_EMAIL,
      to,
      subject: `Actualización de Reunión - ${meetingTitle}`,
      html: getMeetingStatusUpdateTemplate({
        parentName,
        meetingTitle,
        status,
        notes,
      }),
      text: getMeetingStatusUpdateText({
        parentName,
        meetingTitle,
        status,
        notes,
      }),
    };

    await dispatchMail(transporter, mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending meeting status update:", error);
    return false;
  }
}

// Email templates
function getConfirmationEmailTemplate({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu registro</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Hola ${name}!</h1>
          <p>Gracias por registrarte en el CPMA Centro de Padres, Madres y Apoderados</p>
        </div>
        <div class="content">
          <h2>Confirma tu cuenta</h2>
          <p>Para completar tu registro en el CPMA Centro de Padres, Madres y Apoderados de la Plataforma Educativa Astral, necesitamos que confirmes tu dirección de correo electrónico.</p>
          
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Confirmar mi cuenta</a>
          </p>
          
          <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
          
          <p>Este enlace de confirmación expirará en 24 horas por seguridad.</p>
          
          <p>Si no te registraste en nuestro sitio, puedes ignorar este email de forma segura.</p>
        </div>
        <div class="footer">
          <p>Plataforma Educativa Astral<br>
          CPMA Centro de Padres, Madres y Apoderados</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getConfirmationEmailText({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}) {
  return `
¡Hola ${name}!

Gracias por registrarte en el CPMA Centro de Padres, Madres y Apoderados de la Plataforma Educativa Astral.

Para completar tu registro, necesitamos que confirmes tu dirección de correo electrónico haciendo clic en el siguiente enlace:

${verificationUrl}

Este enlace de confirmación expirará en 24 horas por seguridad.

Si no te registraste en nuestro sitio, puedes ignorar este email de forma segura.

Saludos cordiales,
Plataforma Educativa Astral
Centro de Padres y Consejo Escolar
  `;
}

function getWelcomeEmailTemplate({
  name,
  dashboardUrl,
}: {
  name: string;
  dashboardUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .feature { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido ${name}!</h1>
          <p>Tu cuenta ha sido confirmada exitosamente</p>
        </div>
        <div class="content">
          <h2>¡Ya eres parte de nuestra comunidad!</h2>
          <p>Felicitaciones por unirte al CPMA Centro de Padres, Madres y Apoderados de la Plataforma Educativa Astral.</p>
          
          <div class="features">
            <div class="feature">
              <h3>📅 Eventos</h3>
              <p>Participa en reuniones y actividades escolares</p>
            </div>
            <div class="feature">
              <h3>🗳️ Votaciones</h3>
              <p>Vota en decisiones importantes del centro</p>
            </div>
            <div class="feature">
              <h3>📢 Noticias</h3>
              <p>Mantente informado de las últimas novedades</p>
            </div>
            <div class="feature">
              <h3>👥 Comunidad</h3>
              <p>Conecta con otros padres y apoderados</p>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Ir a mi Dashboard</a>
          </p>
          
          <p>¿Necesitas ayuda? No dudes en contactarnos. Estamos aquí para apoyarte en el proceso educativo de tu estudiante.</p>
        </div>
        <div class="footer">
          <p>Plataforma Educativa Astral<br>
          CPMA Centro de Padres, Madres y Apoderados</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmailText({
  name,
  dashboardUrl,
}: {
  name: string;
  dashboardUrl: string;
}) {
  return `
¡Bienvenido ${name}!

Tu cuenta ha sido confirmada exitosamente y ya eres parte del CPMA Centro de Padres, Madres y Apoderados de la Plataforma Educativa Astral.

Ahora puedes:
- Participar en eventos y reuniones
- Votar en decisiones importantes 
- Mantenerte informado de las novedades
- Conectar con otros padres y apoderados

Visita tu dashboard: ${dashboardUrl}

¿Necesitas ayuda? No dudes en contactarnos. Estamos aquí para apoyarte en el proceso educativo de tu estudiante.

Saludos cordiales,
Plataforma Educativa Astral
Centro de Padres y Consejo Escolar
  `;
}

function getContactEmailTemplate({
  fullName,
  email,
  subject,
  message,
  submittedAt,
}: ContactEmailPayload & { fullName: string; submittedAt: Date }) {
  const formattedDate = submittedAt.toLocaleString("es-CL");
  const sanitizedMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva consulta de contacto</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 640px; margin: 0 auto; padding: 24px; }
        .card { background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); overflow: hidden; }
        .header { background: linear-gradient(135deg, #312e81 0%, #1d4ed8 100%); color: #ffffff; padding: 32px; }
        .header h1 { margin: 0 0 8px 0; font-size: 24px; }
        .content { padding: 32px; }
        .meta { display: grid; gap: 12px; margin-bottom: 24px; }
        .meta-item { display: flex; gap: 8px; }
        .meta-label { font-weight: 600; color: #1f2937; min-width: 120px; }
        .message { background: #f4f5f7; border-radius: 12px; padding: 20px; white-space: pre-wrap; }
        .footer { padding: 24px 32px 32px; color: #4b5563; font-size: 14px; border-top: 1px solid #e5e7eb; }
        a { color: #2563eb; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>Nueva consulta de contacto</h1>
            <p>Se recibió un mensaje desde el formulario público</p>
          </div>
          <div class="content">
            <div class="meta">
              <div class="meta-item">
                <span class="meta-label">Nombre:</span>
                <span>${escapeHtml(fullName)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Correo:</span>
                <span><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Asunto:</span>
                <span>${escapeHtml(subject)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Enviado:</span>
                <span>${escapeHtml(formattedDate)}</span>
              </div>
            </div>
            <div class="message">${sanitizedMessage}</div>
          </div>
          <div class="footer">
            <p>Responder directamente a este correo contestará a <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>.</p>
            <p>Este mensaje fue generado por el formulario de contacto en ${process.env.APP_URL || "Plataforma Astral"}.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getContactEmailText({
  fullName,
  email,
  subject,
  message,
  submittedAt,
}: ContactEmailPayload & { fullName: string; submittedAt: Date }) {
  const formattedDate = submittedAt.toLocaleString("es-CL");

  return `
NUEVA CONSULTA DE CONTACTO

Nombre: ${fullName}
Correo: ${email}
Asunto: ${subject}
Enviado: ${formattedDate}

Mensaje:
${message}

Responder a este correo contestará directamente a ${email}.

Formulario público de Plataforma Astral (${process.env.APP_URL || "URL no configurada"})
  `;
}

// Meeting notification email templates
function getMeetingRequestEmailTemplate(data: MeetingRequestEmail) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Solicitud de Reunión</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; }
        .meeting-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: #495057; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Nueva Solicitud de Reunión</h1>
          <p>Un apoderado ha solicitado una reunión</p>
        </div>
        <div class="content">
          <h2>Detalles de la Solicitud</h2>
          
          <div class="meeting-details">
            <div class="detail-item">
              <span class="label">👨‍👩‍👧‍👦 Apoderado:</span> ${data.parentName} (${data.parentEmail})
            </div>
            <div class="detail-item">
              <span class="label">👨‍🎓 Estudiante:</span> ${data.studentName} (${data.studentGrade})
            </div>
            <div class="detail-item">
              <span class="label">📅 Fecha Preferida:</span> ${data.preferredDate.toLocaleDateString("es-CL")}
            </div>
            <div class="detail-item">
              <span class="label">🕐 Hora Preferida:</span> ${data.preferredTime}
            </div>
            <div class="detail-item">
              <span class="label">📝 Motivo:</span> ${data.reason}
            </div>
            ${data.additionalNotes ? `<div class="detail-item"><span class="label">📋 Notas Adicionales:</span> ${data.additionalNotes}</div>` : ""}
          </div>
          
          <p>Por favor, revisa esta solicitud y asigna un profesor para la reunión.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL}/admin/reuniones" class="button">Gestionar Reunión</a>
          </p>
        </div>
        <div class="footer">
          <p>Plataforma Educativa Astral<br>
          Sistema de Gestión de Reuniones</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getMeetingRequestEmailText(data: MeetingRequestEmail) {
  return `
NUEVA SOLICITUD DE REUNIÓN

Detalles de la Solicitud:
- Apoderado: ${data.parentName} (${data.parentEmail})
- Estudiante: ${data.studentName} (${data.studentGrade})
- Fecha Preferida: ${data.preferredDate.toLocaleDateString("es-CL")}
- Hora Preferida: ${data.preferredTime}
- Motivo: ${data.reason}
${data.additionalNotes ? `- Notas Adicionales: ${data.additionalNotes}` : ""}

Por favor, revisa esta solicitud en el sistema administrativo.

Acceder: ${process.env.APP_URL}/admin/reuniones

Plataforma Educativa Astral
  `;
}

function getMeetingConfirmationEmailTemplate(data: MeetingConfirmationEmail) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reunión</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; }
        .meeting-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: #495057; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Reunión Confirmada</h1>
          <p>Tu reunión ha sido confirmada</p>
        </div>
        <div class="content">
          <h2>Hola ${data.parentName}</h2>
          <p>Te informamos que tu solicitud de reunión ha sido confirmada. A continuación, te compartimos los detalles:</p>
          
          <div class="meeting-details">
            <div class="detail-item">
              <span class="label">📋 Título:</span> ${data.meetingTitle}
            </div>
            <div class="detail-item">
              <span class="label">📅 Fecha:</span> ${data.meetingDate.toLocaleDateString("es-CL")}
            </div>
            <div class="detail-item">
              <span class="label">🕐 Hora:</span> ${data.meetingTime}
            </div>
            <div class="detail-item">
              <span class="label">👨‍🏫 Profesor Asignado:</span> ${data.assignedTeacher}
            </div>
            <div class="detail-item">
              <span class="label">📍 Ubicación:</span> ${data.location}
            </div>
          </div>
          
          <p>Por favor, llega 5 minutos antes de la hora programada. Si necesitas reprogramar, contáctanos con al menos 24 horas de anticipación.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL}/parent/reuniones" class="button">Ver mis Reuniones</a>
          </p>
        </div>
        <div class="footer">
          <p>Plataforma Educativa Astral<br>
          Sistema de Gestión de Reuniones</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getMeetingConfirmationEmailText(data: MeetingConfirmationEmail) {
  return `
CONFIRMACIÓN DE REUNIÓN

Hola ${data.parentName},

Tu reunión ha sido confirmada:

- Título: ${data.meetingTitle}
- Fecha: ${data.meetingDate.toLocaleDateString("es-CL")}
- Hora: ${data.meetingTime}
- Profesor Asignado: ${data.assignedTeacher}
- Ubicación: ${data.location}

Por favor, llega 5 minutos antes de la hora programada.

Ver mis reuniones: ${process.env.APP_URL}/parent/reuniones

Plataforma Educativa Astral
  `;
}

function getMeetingStatusUpdateTemplate({
  parentName,
  meetingTitle,
  status,
  notes,
}: {
  parentName: string;
  meetingTitle: string;
  status: string;
  notes?: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Reunión</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; }
        .meeting-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: #495057; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Actualización de Reunión</h1>
          <p>Estado actualizado de tu reunión</p>
        </div>
        <div class="content">
          <h2>Hola ${parentName}</h2>
          <p>Te informamos que el estado de tu reunión ha sido actualizado:</p>
          
          <div class="meeting-details">
            <div class="detail-item">
              <span class="label">📋 Reunión:</span> ${meetingTitle}
            </div>
            <div class="detail-item">
              <span class="label">🔄 Nuevo Estado:</span> ${status}
            </div>
            ${notes ? `<div class="detail-item"><span class="label">📝 Notas:</span> ${notes}</div>` : ""}
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL}/parent/reuniones" class="button">Ver Detalles</a>
          </p>
        </div>
        <div class="footer">
          <p>Plataforma Educativa Astral<br>
          Sistema de Gestión de Reuniones</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getMeetingStatusUpdateText({
  parentName,
  meetingTitle,
  status,
  notes,
}: {
  parentName: string;
  meetingTitle: string;
  status: string;
  notes?: string;
}) {
  return `
ACTUALIZACIÓN DE REUNIÓN

Hola ${parentName},

Te informamos que el estado de tu reunión ha sido actualizado:

- Reunión: ${meetingTitle}
- Nuevo Estado: ${status}
${notes ? `- Notas: ${notes}` : ""}

Ver detalles: ${process.env.APP_URL}/parent/reuniones

Plataforma Educativa Astral
  `;
}
