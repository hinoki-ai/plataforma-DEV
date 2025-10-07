import nodemailer from 'nodemailer';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

// Email configuration
const createTransport = () => {
  // For development, we'll use console logging instead of actual email sending
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  // Production email configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

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
    const transporter = createTransport();

    const verificationUrl = `${process.env.APP_URL}/centro-consejo/verificar?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@manitospintadas.cl',
      to,
      subject: 'Confirma tu registro - Centro de Padres Manitos Pintadas',
      html: getConfirmationEmailTemplate({ name, verificationUrl }),
      text: getConfirmationEmailText({ name, verificationUrl }),
    };

    if (process.env.NODE_ENV === 'development') {
      // Development logging - these will be removed in production builds
      return true;
    }

    const result = await (transporter as any).sendMail(mailOptions);
    // Production logging handled by system logger
    return true;
  } catch (error) {
    // Error handling - return false for failed email sending
    return false;
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
    const transporter = createTransport();

    const dashboardUrl = `${process.env.APP_URL}/centro-consejo/dashboard`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@manitospintadas.cl',
      to,
      subject: '¡Bienvenido al Centro de Padres Manitos Pintadas!',
      html: getWelcomeEmailTemplate({ name, dashboardUrl }),
      text: getWelcomeEmailText({ name, dashboardUrl }),
    };

    if (process.env.NODE_ENV === 'development') {
      // Development logging - these will be removed in production builds
      return true;
    }

    const result = await (transporter as any).sendMail(mailOptions);
    // Production logging handled by system logger
    return true;
  } catch (error) {
    // Error handling - return false for failed email sending
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
  data: MeetingRequestEmail
): Promise<boolean> {
  try {
    const transporter = createTransport();
    const client = getConvexClient();

    const staff = await client.query(api.users.getStaffUsers, {});

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@manitospintadas.cl',
      to: staff.map(s => s.email).filter(Boolean),
      subject: `Nueva Solicitud de Reunión - ${data.studentName}`,
      html: getMeetingRequestEmailTemplate(data),
      text: getMeetingRequestEmailText(data),
    };

    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    await (transporter as any).sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending meeting request notification:', error);
    return false;
  }
}

export async function sendMeetingConfirmation(
  data: MeetingConfirmationEmail
): Promise<boolean> {
  try {
    const transporter = createTransport();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@manitospintadas.cl',
      to: data.to,
      subject: `Confirmación de Reunión - ${data.meetingTitle}`,
      html: getMeetingConfirmationEmailTemplate(data),
      text: getMeetingConfirmationEmailText(data),
    };

    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    await (transporter as any).sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending meeting confirmation:', error);
    return false;
  }
}

export async function sendMeetingStatusUpdate(
  to: string,
  parentName: string,
  meetingTitle: string,
  status: string,
  notes?: string
): Promise<boolean> {
  try {
    const transporter = createTransport();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@manitospintadas.cl',
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

    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    await (transporter as any).sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending meeting status update:', error);
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
          <p>Gracias por registrarte en el Centro de Padres</p>
        </div>
        <div class="content">
          <h2>Confirma tu cuenta</h2>
          <p>Para completar tu registro en el Centro de Padres y Consejo Escolar de la Escuela Especial de Lenguaje Manitos Pintadas, necesitamos que confirmes tu dirección de correo electrónico.</p>
          
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Confirmar mi cuenta</a>
          </p>
          
          <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
          
          <p>Este enlace de confirmación expirará en 24 horas por seguridad.</p>
          
          <p>Si no te registraste en nuestro sitio, puedes ignorar este email de forma segura.</p>
        </div>
        <div class="footer">
          <p>Escuela Especial de Lenguaje Manitos Pintadas<br>
          Centro de Padres y Consejo Escolar</p>
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

Gracias por registrarte en el Centro de Padres y Consejo Escolar de la Escuela Especial de Lenguaje Manitos Pintadas.

Para completar tu registro, necesitamos que confirmes tu dirección de correo electrónico haciendo clic en el siguiente enlace:

${verificationUrl}

Este enlace de confirmación expirará en 24 horas por seguridad.

Si no te registraste en nuestro sitio, puedes ignorar este email de forma segura.

Saludos cordiales,
Escuela Especial de Lenguaje Manitos Pintadas
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
          <p>Felicitaciones por unirte al Centro de Padres y Consejo Escolar de la Escuela Especial de Lenguaje Manitos Pintadas.</p>
          
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
          
          <p>¿Necesitas ayuda? No dudes en contactarnos. Estamos aquí para apoyarte en el proceso educativo de tu hijo/a.</p>
        </div>
        <div class="footer">
          <p>Escuela Especial de Lenguaje Manitos Pintadas<br>
          Centro de Padres y Consejo Escolar</p>
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

Tu cuenta ha sido confirmada exitosamente y ya eres parte del Centro de Padres y Consejo Escolar de la Escuela Especial de Lenguaje Manitos Pintadas.

Ahora puedes:
- Participar en eventos y reuniones
- Votar en decisiones importantes 
- Mantenerte informado de las novedades
- Conectar con otros padres y apoderados

Visita tu dashboard: ${dashboardUrl}

¿Necesitas ayuda? No dudes en contactarnos. Estamos aquí para apoyarte en el proceso educativo de tu hijo/a.

Saludos cordiales,
Escuela Especial de Lenguaje Manitos Pintadas
Centro de Padres y Consejo Escolar
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
              <span class="label">📅 Fecha Preferida:</span> ${data.preferredDate.toLocaleDateString('es-CL')}
            </div>
            <div class="detail-item">
              <span class="label">🕐 Hora Preferida:</span> ${data.preferredTime}
            </div>
            <div class="detail-item">
              <span class="label">📝 Motivo:</span> ${data.reason}
            </div>
            ${data.additionalNotes ? `<div class="detail-item"><span class="label">📋 Notas Adicionales:</span> ${data.additionalNotes}</div>` : ''}
          </div>
          
          <p>Por favor, revisa esta solicitud y asigna un profesor para la reunión.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL}/admin/reuniones" class="button">Gestionar Reunión</a>
          </p>
        </div>
        <div class="footer">
          <p>Escuela Especial de Lenguaje Manitos Pintadas<br>
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
- Fecha Preferida: ${data.preferredDate.toLocaleDateString('es-CL')}
- Hora Preferida: ${data.preferredTime}
- Motivo: ${data.reason}
${data.additionalNotes ? `- Notas Adicionales: ${data.additionalNotes}` : ''}

Por favor, revisa esta solicitud en el sistema administrativo.

Acceder: ${process.env.APP_URL}/admin/reuniones

Escuela Especial de Lenguaje Manitos Pintadas
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
              <span class="label">📅 Fecha:</span> ${data.meetingDate.toLocaleDateString('es-CL')}
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
          <p>Escuela Especial de Lenguaje Manitos Pintadas<br>
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
- Fecha: ${data.meetingDate.toLocaleDateString('es-CL')}
- Hora: ${data.meetingTime}
- Profesor Asignado: ${data.assignedTeacher}
- Ubicación: ${data.location}

Por favor, llega 5 minutos antes de la hora programada.

Ver mis reuniones: ${process.env.APP_URL}/parent/reuniones

Escuela Especial de Lenguaje Manitos Pintadas
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
            ${notes ? `<div class="detail-item"><span class="label">📝 Notas:</span> ${notes}</div>` : ''}
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL}/parent/reuniones" class="button">Ver Detalles</a>
          </p>
        </div>
        <div class="footer">
          <p>Escuela Especial de Lenguaje Manitos Pintadas<br>
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
${notes ? `- Notas: ${notes}` : ''}

Ver detalles: ${process.env.APP_URL}/parent/reuniones

Escuela Especial de Lenguaje Manitos Pintadas
  `;
}
