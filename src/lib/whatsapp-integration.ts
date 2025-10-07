/**
 * WhatsApp integration utilities for notifications
 * Quick win for parent communication
 */

interface WhatsAppMessage {
  phone: string;
  message: string;
  template?: string;
}

/**
 * Generate WhatsApp share URL
 */
export function generateWhatsAppUrl(message: string, phone?: string): string {
  const encodedMessage = encodeURIComponent(message);
  const baseUrl = "https://wa.me/";

  if (phone) {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, "");
    return `${baseUrl}${cleanPhone}?text=${encodedMessage}`;
  }

  return `${baseUrl}?text=${encodedMessage}`;
}

/**
 * Reservation confirmation message
 */
export function getReservationMessage(reservation: {
  guardianName: string;
  guardianPhone: string;
  studentName: string;
  preferredDate: string | Date;
  preferredTime: string;
}): WhatsAppMessage {
  const date = new Date(reservation.preferredDate).toLocaleDateString("es-CL");
  const time = reservation.preferredTime;

  return {
    phone: reservation.guardianPhone,
    message: `📅 *Reserva Confirmada*\n\nHola ${reservation.guardianName},\n\n✅ Tu reunión ha sido confirmada:\n\n📍 *Escuela:* Manitos Pintadas\n📅 *Fecha:* ${date}\n⏰ *Hora:* ${time}\n👨‍👩‍👧‍👦 *Estudiante:* ${reservation.studentName}\n\nPor favor llega 10 minutos antes.\n\n¡Nos vemos pronto!`,
  };
}

/**
 * Meeting reminder message
 */
export function getMeetingReminder(meeting: {
  phone: string;
  date: string | Date;
  time: string;
  location?: string;
  title: string;
}): WhatsAppMessage {
  const date = new Date(meeting.date).toLocaleDateString("es-CL");
  const time = meeting.time;

  return {
    phone: meeting.phone,
    message: `⏰ *Recordatorio de Reunión*\n\n📅 *Fecha:* ${date}\n⏰ *Hora:* ${time}\n📍 *Lugar:* ${meeting.location || "Escuela Manitos Pintadas"}\n\n*Título:* ${meeting.title}\n\n¡No olvides asistir!`,
  };
}

/**
 * General notification message
 */
type NotificationType =
  | "reservation-confirmed"
  | "meeting-reminder"
  | "meeting-cancelled"
  | "event-reminder";

export function getNotificationMessage(
  type: NotificationType,
  data: {
    guardianName?: string;
    guardianPhone?: string;
    studentName?: string;
    preferredDate?: string | Date;
    preferredTime?: string;
    phone: string;
    date: string | Date;
    time: string;
    location?: string;
    title: string;
    description?: string;
  },
): WhatsAppMessage {
  const messages: Record<NotificationType, WhatsAppMessage> = {
    "reservation-confirmed": getReservationMessage({
      guardianName: data.guardianName || "",
      guardianPhone: data.guardianPhone || "",
      studentName: data.studentName || "",
      preferredDate: data.preferredDate || new Date(),
      preferredTime: data.preferredTime || "",
    }),
    "meeting-reminder": getMeetingReminder({
      phone: data.phone,
      date: data.date,
      time: data.time,
      location: data.location,
      title: data.title,
    }),
    "meeting-cancelled": {
      phone: data.phone,
      message: `❌ *Reunión Cancelada*\n\nLo sentimos, tu reunión del ${new Date(data.date).toLocaleDateString("es-CL")} a las ${data.time} ha sido cancelada.\n\nTe contactaremos para reprogramar.`,
    },
    "event-reminder": {
      phone: data.phone,
      message: `📅 *Recordatorio de Evento*\n\n*${data.title}*\n\n📅 *Fecha:* ${new Date(data.date).toLocaleDateString("es-CL")}\n⏰ *Hora:* ${data.time}\n📍 *Lugar:* ${data.location}\n\n${data.description}`,
    },
  };

  return messages[type] || messages["event-reminder"];
}

/**
 * Share buttons for quick WhatsApp integration
 */
export const whatsAppButtons = {
  reservation: (reservation: {
    guardianName: string;
    guardianPhone: string;
    studentName: string;
    preferredDate: string | Date;
    preferredTime: string;
  }) => [
    {
      label: "Enviar por WhatsApp",
      url: generateWhatsAppUrl(
        getReservationMessage(reservation).message,
        reservation.guardianPhone,
      ),
      icon: "💬",
    },
    {
      label: "Compartir Link",
      url: generateWhatsAppUrl(getReservationMessage(reservation).message),
      icon: "🔗",
    },
  ],

  meeting: (meeting: {
    phone: string;
    date: string | Date;
    time: string;
    location?: string;
    title: string;
  }) => [
    {
      label: "Recordatorio WhatsApp",
      url: generateWhatsAppUrl(
        getMeetingReminder(meeting).message,
        meeting.phone,
      ),
      icon: "💬",
    },
  ],

  share: (message: string) => [
    {
      label: "Compartir por WhatsApp",
      url: generateWhatsAppUrl(message),
      icon: "💬",
    },
  ],
};

/**
 * Quick share for any content
 */
export function shareViaWhatsApp(content: string, phone?: string) {
  const url = generateWhatsAppUrl(content, phone);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove spaces, dashes, and parentheses
  return phone.replace(/\s+/g, "").replace(/[-()]/g, "");
}

/**
 * Check if WhatsApp is available on device
 */
export function isWhatsAppAvailable(): boolean {
  return (
    typeof window !== "undefined" && navigator.userAgent.includes("Mobile")
  );
}

/**
 * Quick templates for common messages
 */
export const whatsAppTemplates = {
  welcome: (name: string) =>
    `🎉 *¡Bienvenido a Manitos Pintadas!*\n\nHola ${name},\n\nGracias por unirte al Centro de Padres. Aquí encontrarás:\n\n✅ Información importante\n✅ Eventos y reuniones\n✅ Comunicación directa\n\n¡Estamos aquí para apoyarte!`,

  birthday: (name: string) =>
    `🎂 *¡Feliz Cumpleaños!*\n\nHola ${name},\n\nDesde la Escuela Especial de Lenguaje Manitos Pintadas te deseamos un feliz cumpleaños.\n\n🎉 Que este día esté lleno de alegría y bendiciones.\n\n¡Felicidades!`,

  emergency: (message: string) =>
    `🚨 *COMUNICADO URGENTE*\n\n${message}\n\nPor favor, contacta a la escuela lo antes posible.\n\n📞 Teléfono: +569XXXXXXXX\n📧 Email: contacto@manitospintadas.cl`,
};
