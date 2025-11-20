"use client";

// 🕊️ DIVINE PARSING ORACLE - CHUNKED I18N SYSTEM
// ARCHITECTURE: MODULAR_LOADING_FRAMEWORK
// BUNDLE_IMPACT: 97.4% REDUCTION (TARGET)
// FEATURES: LAZY_LOADING, CACHING, ROUTE_BASED_LOADING, PERFORMANCE_MONITORING
// INSPIRED BY: Parking Project's Divine Parsing Oracle
// ADAPTED FOR: Plataforma Astral School Portal

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "es" | "en";
type TranslationStrings = Record<string, any>;
type LoadedNamespace = Record<string, TranslationStrings>;
type TranslationNamespace = string;

// Core Divine Parsing Oracle Interface
interface DivineParsingOracleContextType {
  // Core translation functionality
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (
    key: string,
    namespace?: string | Record<string, any>,
    variables?: Record<string, any>,
  ) => string;
  isLoading: boolean;

  // Oracle namespace management
  loadedNamespaces: string[];
  invokeOracle: (namespace: string) => Promise<void>;
  invokeOracles: (namespaces: string[]) => Promise<void>;
  preinvokeOracles: (namespaces: string[]) => void;
  getLoadedNamespaces: () => string[];
  isOracleActive: (namespace: string) => boolean;

  // Performance monitoring
  getTranslationStats: () => TranslationStats;

  // Error handling
  error: string | null;
}

// Import translations statically at build time
import commonES from "../../locales/es/common.json";
import commonEN from "../../locales/en/common.json";
import navigationES from "../../locales/es/navigation.json";
import navigationEN from "../../locales/en/navigation.json";
import adminES from "../../locales/es/admin.json";
import adminEN from "../../locales/en/admin.json";
import parentES from "../../locales/es/parent.json";
import parentEN from "../../locales/en/parent.json";
import profesorES from "../../locales/es/profesor.json";
import profesorEN from "../../locales/en/profesor.json";
import dashboardES from "../../locales/es/dashboard.json";
import dashboardEN from "../../locales/en/dashboard.json";
import languageES from "../../locales/es/language.json";
import languageEN from "../../locales/en/language.json";
import programasES from "../../locales/es/programas.json";
import programasEN from "../../locales/en/programas.json";
import contactoES from "../../locales/es/contacto.json";
import contactEN from "../../locales/en/contact.json";
// Planes translations are now inlined to fix production loading issues

// Import validation utilities for development
import { logValidationResults } from "../../lib/translation-validation";

// Import page-specific translations
import dpaES from "../../locales/es/dpa.json";
import dpaEN from "../../locales/en/dpa.json";
import terminosES from "../../locales/es/terminos.json";
import terminosEN from "../../locales/en/terminos.json";
import privacidadES from "../../locales/es/privacidad.json";
import privacidadEN from "../../locales/en/privacidad.json";
import libroClasesES from "../../locales/es/libro-clases.json";
import libroClasesEN from "../../locales/en/libro-clases.json";
import meetingsES from "../../locales/es/meetings.json";
import meetingsEN from "../../locales/en/meetings.json";
// NOTE: masterES/masterEN exist for build compatibility but master dashboard is English-only
// DO NOT use master translations in MasterDashboard.tsx - keep it hardcoded English
import masterES from "../../locales/es/master.json";
import masterEN from "../../locales/en/master.json";

// Inline planes translations to fix production loading issues
const planesESInline = {
  hero: {
    title: "Planes y Precios",
    subtitle: "Precios transparentes por estudiante. Sin costos ocultos.",
  },
  billing: {
    semestral: "Semestral",
    annual: "Anual",
    biannual: "Bianual",
    discount_annual: "-15%",
    discount_biannual: "-25%",
    billing_info:
      "* Precios en Pesos Chilenos (CLP) + IVA • Factura electrónica (SII)",
    per_student_per_month: "por estudiante/mes",
    savings: "Ahorro de {discount}% en plan {cycle}",
    example: "Ejemplo: {students} estudiantes = {price}/mes",
    monthly_price: "Precio Mensual",
    monthly: "Mensual",
    semester_monthly: "Semestral",
    annual_monthly: "Anual",
    example_with: "Ejemplo con {students} estudiantes:",
    monthly_total: "Mensual:",
    cycle_total: "{cycle}:",
    per_month: "/mes",
  },
  pricing: {
    select_plan: "Seleccionar Plan",
    key_features: "Características Principales",
    view_all_features: "Ver todas las características",
    hide_all_features: "Ocultar detalles completos",
    platform: "Plataforma",
    advanced_features: "Características Avanzadas",
    savings_label: "Ahorro de",
    limits_capacity: "Límites y Capacidad",
    support_details: "Soporte Técnico",
    full_platform_access: "Acceso completo a plataforma educativa",
    basic_materials: "Materiales de estudio básicos",
    academic_tracking: "Seguimiento académico completo",
    training: "Capacitación del personal",
    advanced_reports: "Reportes avanzados",
    integrations: "Integraciones (SIGE, etc.)",
    api_webhooks: "API y Webhooks",
    dedicated_manager: "Gerente de cuenta dedicado",
    included: "Incluida",
    not_included: "No incluida",
    available: "Disponible",
    not_available: "No disponible",
    students_range: "Estudiantes",
    admin_users: "Usuarios administrativos",
    storage: "Almacenamiento",
    virtual_meetings: "Reuniones virtuales",
    max_courses: "Cursos máximos",
    support_type: "Tipo",
    availability_sla: "SLA de disponibilidad",
    dedicated_account_manager: "Incluye gerente de cuenta dedicado",
    standard_support: "Soporte estándar",
    courses_subjects: "cursos/asignaturas",
    storage_label: "almacenamiento",
    virtual_meetings_per_month: "reuniones virtuales/mes",
    support_label: "Soporte",
    sla_availability: "SLA {sla} disponibilidad",
  },
  comparison: {
    title: "Comparación Detallada de Planes",
    feature: "Característica",
  },
  contact: {
    title: "Solicita tu Demo Gratuita",
    contact_sales: "Contactar a Ventas",
    form: {
      full_name: "Nombre Completo *",
      email: "Email *",
      institution: "Establecimiento *",
      commune: "Comuna *",
      students: "Matrícula (N° estudiantes) *",
      phone: "Teléfono / WhatsApp *",
      message: "Mensaje (opcional)",
      submit: "Solicitar Demo",
      whatsapp: "WhatsApp",
      privacy:
        "Al enviar este formulario, aceptas nuestra Política de Privacidad y el tratamiento de tus datos según la Ley 19.628",
    },
  },
  security: {
    title: "Seguridad y Cumplimiento",
    data_in_chile: {
      title: "Datos en Chile",
      description:
        "Servidores ubicados en Chile. Cumplimiento total con regulaciones locales.",
    },
    law_19628: {
      title: "Ley 19.628",
      description:
        "Protección de datos personales. Cifrado end-to-end y backups diarios automáticos.",
    },
    certifications: {
      title: "Certificaciones",
      description:
        "ISO 27001 en proceso. Auditorías de seguridad trimestrales.",
    },
  },
  faq: {
    title: "Preguntas Frecuentes",
    iva_question: "¿El precio incluye IVA?",
    iva_answer:
      "No, los precios mostrados son netos. Se añade 19% de IVA en la factura electrónica emitida por el SII.",
    semestral_calculation: "¿Cómo se calcula el cobro semestral?",
    semestral_answer:
      "El precio es por estudiante activo por semestre. Ejemplo: 100 estudiantes × CLP $35 = CLP $3.500/semestre + IVA. Se cobra el día 1 de cada semestre.",
    free_trial: "¿Qué incluye la prueba gratuita?",
    free_trial_answer:
      "14 días de acceso completo al plan que elijas, sin restricciones. Incluye recorrido guiado por nuestro equipo y soporte completo. No se requiere tarjeta de crédito.",
    plan_change: "¿Puedo cambiar de plan después?",
    plan_change_answer:
      "Sí, puedes cambiar de plan en cualquier momento. Los cambios se aplican en el siguiente ciclo de facturación.",
    data_after_cancel: "¿Qué pasa con mis datos si cancelo?",
    data_after_cancel_answer:
      "Puedes exportar todos tus datos en cualquier momento. Después de la cancelación, guardamos tus datos por 90 días según Ley 19.628, luego se eliminan permanentemente.",
    support_hours: "¿Qué horarios tiene el soporte técnico?",
    support_hours_answer:
      "Lunes a viernes de 9:00 a 18:00 hrs (Chile Continental). Planes Premium incluyen soporte 24/7 con tiempo de respuesta garantizado.",
  },
  calculator: {
    back_to_plans: "Volver a planes",
    title: "Calculadora de {plan}",
    subtitle:
      "Ajusta la cantidad de estudiantes y descubre la inversión real. Estamos listos para activar tu plan en minutos.",
    price_per_student: "Valor por estudiante",
    configure_students: "Configura estudiantes",
    decrease_10: "Disminuir 10 estudiantes",
    decrease_10_short: "-10",
    increase_10: "Aumentar 10 estudiantes",
    increase_10_short: "+10",
    recommended_range: "Rango recomendado",
    admin_users: "Usuarios administrativos",
    support: "Soporte",
    estimated_investment: "Tu inversión estimada",
    calculation_note: "Calculamos valores en CLP con IVA no incluido",
    semestral_payment: "Pago semestral",
    monthly_payment: "Pago mensual",
    payment_frequency: "Frecuencia de pago",
    pay_monthly: "Pago mensual",
    pay_upfront: "Pago completo por adelantado",
    upfront_discount: "5% de descuento adicional",
    upfront_discount_disclosure:
      "El pago completo por adelantado incluye un 5% de descuento adicional",
    full_payment: "Pago completo",
    savings_from_plan: "Ahorro por plan",
    total_savings: "Ahorro total",
    savings_per_month: "Ahorro por mes",
    final_student_price: "Valor final estudiante",
    savings: "Ahorro",
    students_count: "{count} estudiantes",
    savings_per_period: "Ahorro por período",
    less: "menos",
    total_per_period: "Total por {period}",
    savings_in_period: "Ahorro en el período",
    ready_to_activate: "¿Listo para activarlo?",
    ready_description:
      "Compartiremos esta simulación de inmediato con el equipo para iniciar la implementación sin demoras.",
    contact_express: "Contacto Express por WhatsApp",
    request_activation: "Solicitar activación por Email",
    contact_team: "Contacta directo al equipo de desarrollo",
    contact_description:
      "Estamos en modo reacción inmediata. Escríbenos y comencemos hoy mismo.",
    direct_email: "Email directo",
    whatsapp_immediate: "WhatsApp inmediato",
    whatsapp_now: "Enviar WhatsApp",
    send_email: "Enviar Email",
    month: "mes",
    months: "{count} meses",
    whatsapp_message:
      "Hola equipo Astral, necesito activar {plan} para {students} estudiantes. Ciclo de facturación: {cycle}. Valor mensual estimado: {monthly_price}. Total del período ({period}): {total}. Hablemos ahora mismo para confirmarlo.",
    email_subject: "[Astral] {plan} - {students} estudiantes",
    email_body:
      "==========================================\n   SOLICITUD DE ACTIVACIÓN DE PLAN\n==========================================\n\nHola equipo Astral,\n\nMe dirijo a ustedes para solicitar la activación del siguiente plan:\n\n---\nDETALLES DEL PLAN\n---\n\n  • Plan: {plan}\n  • Estudiantes: {students}\n  • Ciclo de facturación: {cycle}\n\n---\nINVERSIÓN ESTIMADA\n---\n\n  • Valor mensual: {monthly_price}\n  • Total del período ({period}): {total}\n\n==========================================\n\nPor favor contáctenme hoy para proceder con la activación.\n\nQuedo atento a su respuesta.\n\nSaludos cordiales,\n\n\n==========================================\n   PLAN ACTIVATION REQUEST\n==========================================\n\nHello Astral team,\n\nI am writing to request the activation of the following plan:\n\n---\nPLAN DETAILS\n---\n\n  • Plan: {plan}\n  • Students: {students}\n  • Billing cycle: {cycle}\n\n---\nESTIMATED INVESTMENT\n---\n\n  • Monthly value: {monthly_price}\n  • Total for period ({period}): {total}\n\n==========================================\n\nPlease contact me today to proceed with the activation.\n\nLooking forward to your response.\n\nBest regards,",
    billing_cycle_label: "Ciclo de facturación",
    estimated_monthly_price: "Valor mensual estimado",
    total_period: "Total del período",
    lets_talk: "Hablemos ahora mismo para confirmarlo.",
    please_contact: "Por favor contáctenme hoy para activarlo.",
    thanks: "Gracias!",
    plan_not_compatible: "Plan no compatible",
    plan_min_students_error: "El plan {plan} requiere mínimo {min} estudiantes",
    plan_max_students_error: "El plan {plan} admite máximo {max} estudiantes",
    change_to: "Cambiar a {plan}",
    change_to_cycle: "Cambiar a ciclo {cycle}",
    recommended_plan_available: "Plan recomendado disponible",
    recommended_plan_description:
      "Para {students} estudiantes, el <strong>{plan}</strong> es más adecuado y puede ahorrarte dinero.",
    best_option_available: "Mejor opción disponible",
    best_option_description:
      "El ciclo {cycle} te ahorraría {amount} por {months} meses ({percent}% menos)",
    price_includes_vat: "* Precio incluye IVA (19%)",
    subtotal: "Subtotal:",
    vat: "IVA (19%):",
    total: "Total:",
    institution_type_label: "Tipo de Institución",
    aria: {
      student_selector: "Selector de cantidad de estudiantes",
      monthly_payment: "Pago mensual",
      upfront_payment: "Pago completo por adelantado con 5% de descuento",
      discount_5_percent: "5% de descuento",
      student_count_range: "Número de estudiantes (rango: {min}{max})",
    },
    contacts: {
      team_astral: "Tu Equipo Astral",
      lead_developer_onboarding: "Lead Developer & Onboarding",
      loreto: "Loreto",
      onboarding_chief: "Onboarding Chief",
      agustin: "Agustin",
      lead_developer: "Lead Developer",
      sales_team: "Equipo de Ventas",
      sales_representative: "Sales Representative",
    },
  },
};

const planesENInline = {
  hero: {
    title: "Plans and Pricing",
    subtitle: "Transparent pricing per student. No hidden costs.",
  },
  billing: {
    semestral: "Semestral",
    annual: "Annual",
    biannual: "Biannual",
    discount_annual: "-15%",
    discount_biannual: "-25%",
    billing_info:
      "* Prices in Chilean Pesos (CLP) + VAT • Electronic invoice (SII)",
    per_student_per_month: "per student/month",
    savings: "Save {discount}% on {cycle} plan",
    example: "Example: {students} students = {price}/month",
    monthly_price: "Monthly Price",
    monthly: "Monthly",
    semester_monthly: "Semestral",
    annual_monthly: "Annual",
    example_with: "Example with {students} students:",
    monthly_total: "Monthly:",
    cycle_total: "{cycle}:",
    per_month: "/month",
  },
  pricing: {
    select_plan: "Select Plan",
    key_features: "Key Features",
    view_all_features: "View all features",
    hide_all_features: "Hide complete details",
    platform: "Platform",
    advanced_features: "Advanced Features",
    savings_label: "Save",
    limits_capacity: "Limits & Capacity",
    support_details: "Technical Support",
    full_platform_access: "Full access to educational platform",
    basic_materials: "Basic study materials",
    academic_tracking: "Complete academic tracking",
    training: "Staff training",
    advanced_reports: "Advanced reports",
    integrations: "Integrations (SIGE, etc.)",
    api_webhooks: "API and Webhooks",
    dedicated_manager: "Dedicated account manager",
    included: "Included",
    not_included: "Not included",
    available: "Available",
    not_available: "Not available",
    students_range: "Students",
    admin_users: "Administrative users",
    storage: "Storage",
    virtual_meetings: "Virtual meetings",
    max_courses: "Maximum courses",
    support_type: "Type",
    availability_sla: "Availability SLA",
    dedicated_account_manager: "Includes dedicated account manager",
    standard_support: "Standard support",
    courses_subjects: "courses/subjects",
    storage_label: "storage",
    virtual_meetings_per_month: "virtual meetings/month",
    support_label: "Support",
    sla_availability: "SLA {sla} availability",
  },
  comparison: {
    title: "Detailed Plan Comparison",
    feature: "Feature",
  },
  contact: {
    title: "Request Your Free Demo",
    contact_sales: "Contact Sales",
    form: {
      full_name: "Full Name *",
      email: "Email *",
      institution: "Institution *",
      commune: "Commune *",
      students: "Enrollment (Number of students) *",
      phone: "Phone / WhatsApp *",
      message: "Message (optional)",
      submit: "Request Demo",
      whatsapp: "WhatsApp",
      privacy:
        "By submitting this form, you accept our Privacy Policy and the treatment of your data according to Law 19.628",
    },
  },
  security: {
    title: "Security and Compliance",
    data_in_chile: {
      title: "Data in Chile",
      description:
        "Servers located in Chile. Full compliance with local regulations.",
    },
    law_19628: {
      title: "Law 19.628",
      description:
        "Personal data protection. End-to-end encryption and automatic daily backups.",
    },
    certifications: {
      title: "Certifications",
      description: "ISO 27001 in progress. Quarterly security audits.",
    },
  },
  faq: {
    title: "Frequently Asked Questions",
    iva_question: "Does the price include VAT?",
    iva_answer:
      "No, the prices shown are net. 19% VAT is added to the electronic invoice issued by the SII.",
    semestral_calculation: "How is the semestral billing calculated?",
    semestral_answer:
      "The price is per active student per semester. Example: 100 students × CLP $35 = CLP $3,500/semester + VAT. Billed on the 1st of each semester.",
    free_trial: "What does the free trial include?",
    free_trial_answer:
      "14 days of full access to the plan you choose, without restrictions. Includes guided tour by our team and complete support. No credit card required.",
    plan_change: "Can I change plans later?",
    plan_change_answer:
      "Yes, you can change plans at any time. Changes apply to the next billing cycle.",
    data_after_cancel: "What happens to my data if I cancel?",
    data_after_cancel_answer:
      "You can export all your data at any time. After cancellation, we keep your data for 90 days according to Law 19.628, then it is permanently deleted.",
    support_hours: "What are the technical support hours?",
    support_hours_answer:
      "Monday to Friday from 9:00 to 18:00 hrs (Chile Continental). Premium plans include 24/7 support with guaranteed response time.",
  },
  calculator: {
    back_to_plans: "Back to plans",
    title: "{plan} Calculator",
    subtitle:
      "Adjust the number of students and discover the real investment. We're ready to activate your plan in minutes.",
    price_per_student: "Price per student",
    configure_students: "Configure students",
    decrease_10: "Decrease 10 students",
    decrease_10_short: "-10",
    increase_10: "Increase 10 students",
    increase_10_short: "+10",
    recommended_range: "Recommended range",
    admin_users: "Administrative users",
    support: "Support",
    estimated_investment: "Your estimated investment",
    calculation_note: "We calculate values in CLP with VAT not included",
    semestral_payment: "Semestral payment",
    monthly_payment: "Monthly payment",
    payment_frequency: "Payment frequency",
    pay_monthly: "Monthly payments",
    pay_upfront: "Full upfront payment",
    upfront_discount: "5% additional discount",
    upfront_discount_disclosure:
      "Full upfront payment includes an additional 5% discount",
    full_payment: "Full payment",
    savings_from_plan: "Savings from plan",
    total_savings: "Total savings",
    savings_per_month: "Savings per month",
    final_student_price: "Final student price",
    savings: "Savings",
    students_count: "{count} students",
    savings_per_period: "Savings per period",
    less: "less",
    total_per_period: "Total per {period}",
    savings_in_period: "Savings in the period",
    ready_to_activate: "Ready to activate?",
    ready_description:
      "We'll share this simulation immediately with the team to start implementation without delays.",
    contact_express: "Express Contact via WhatsApp",
    request_activation: "Request activation via Email",
    contact_team: "Contact the development team directly",
    contact_description:
      "We're in immediate response mode. Write to us and let's start today.",
    direct_email: "Direct email",
    whatsapp_immediate: "Immediate WhatsApp",
    whatsapp_now: "WhatsApp Now",
    send_email: "Send Email",
    month: "month",
    months: "{count} months",
    whatsapp_message:
      "Hello Astral team, I need to activate {plan} for {students} students. Billing cycle: {cycle}. Estimated monthly price: {monthly_price}. Total for the period ({period}): {total}. Let's talk right now to confirm it.",
    email_subject: "[Astral] {plan} - {students} students",
    email_body:
      "==========================================\n   PLAN ACTIVATION REQUEST\n==========================================\n\nHello Astral team,\n\nI am writing to request the activation of the following plan:\n\n---\nPLAN DETAILS\n---\n\n  • Plan: {plan}\n  • Students: {students}\n  • Billing cycle: {cycle}\n\n---\nESTIMATED INVESTMENT\n---\n\n  • Monthly value: {monthly_price}\n  • Total for period ({period}): {total}\n\n==========================================\n\nPlease contact me today to proceed with the activation.\n\nLooking forward to your response.\n\nBest regards,\n\n\n==========================================\n   SOLICITUD DE ACTIVACIÓN DE PLAN\n==========================================\n\nHola equipo Astral,\n\nMe dirijo a ustedes para solicitar la activación del siguiente plan:\n\n---\nDETALLES DEL PLAN\n---\n\n  • Plan: {plan}\n  • Estudiantes: {students}\n  • Ciclo de facturación: {cycle}\n\n---\nINVERSIÓN ESTIMADA\n---\n\n  • Valor mensual: {monthly_price}\n  • Total del período ({period}): {total}\n\n==========================================\n\nPor favor contáctenme hoy para proceder con la activación.\n\nQuedo atento a su respuesta.\n\nSaludos cordiales,",
    billing_cycle_label: "Billing cycle",
    estimated_monthly_price: "Estimated monthly price",
    total_period: "Total for the period",
    lets_talk: "Let's talk right now to confirm it.",
    please_contact: "Please contact me today to activate it.",
    thanks: "Thanks!",
    plan_not_compatible: "Plan not compatible",
    plan_min_students_error:
      "The {plan} plan requires a minimum of {min} students",
    plan_max_students_error:
      "The {plan} plan allows a maximum of {max} students",
    change_to: "Switch to {plan}",
    change_to_cycle: "Switch to {cycle} cycle",
    recommended_plan_available: "Recommended plan available",
    recommended_plan_description:
      "For {students} students, the <strong>{plan}</strong> is more suitable and can save you money.",
    best_option_available: "Best option available",
    best_option_description:
      "The {cycle} cycle would save you {amount} for {months} months ({percent}% less)",
    price_includes_vat: "* Price includes VAT (19%)",
    subtotal: "Subtotal:",
    vat: "VAT (19%):",
    total: "Total:",
    institution_type_label: "Institution Type",
    aria: {
      student_selector: "Student count selector",
      monthly_payment: "Monthly payment",
      upfront_payment: "Full upfront payment with 5% discount",
      discount_5_percent: "5% discount",
      student_count_range: "Number of students (range: {min}{max})",
    },
    contacts: {
      team_astral: "Your Astral Team",
      lead_developer_onboarding: "Lead Developer & Onboarding",
      loreto: "Loreto",
      onboarding_chief: "Onboarding Chief",
      agustin: "Agustin",
      lead_developer: "Lead Developer",
      sales_team: "Sales Team",
      sales_representative: "Sales Representative",
    },
  },
};

// Direct translation map for reliable synchronous access
const translations = {
  es: {
    common: commonES,
    navigation: navigationES,
    admin: adminES,
    parent: parentES,
    profesor: profesorES,
    dashboard: dashboardES,
    language: languageES,
    programas: programasES,
    contacto: contactoES,
    planes: planesESInline,
    dpa: dpaES,
    terminos: terminosES,
    privacidad: privacidadES,
    "libro-clases": libroClasesES,
    meetings: meetingsES,
    master: masterES,
  },
  en: {
    common: commonEN,
    navigation: navigationEN,
    admin: adminEN,
    parent: parentEN,
    profesor: profesorEN,
    dashboard: dashboardEN,
    language: languageEN,
    programas: programasEN,
    contact: contactEN,
    planes: planesENInline,
    dpa: dpaEN,
    terminos: terminosEN,
    privacidad: privacidadEN,
    "libro-clases": libroClasesEN,
    meetings: meetingsEN,
    master: masterEN,
  },
} as const;

// Translation registry - maps language-namespace to translation objects
const translationRegistry: Record<string, TranslationStrings> = {
  "es-common": commonES,
  "en-common": commonEN,
  "es-navigation": navigationES,
  "en-navigation": navigationEN,
  "es-admin": adminES,
  "en-admin": adminEN,
  "es-parent": parentES,
  "en-parent": parentEN,
  "es-profesor": profesorES,
  "en-profesor": profesorEN,
  "es-dashboard": dashboardES,
  "en-dashboard": dashboardEN,
  "es-language": languageES,
  "en-language": languageEN,
  "es-programas": programasES,
  "en-programas": programasEN,
  "es-contacto": contactoES,
  "en-contact": contactEN,
  "es-planes": planesESInline,
  "en-planes": planesENInline,
  "es-dpa": dpaES,
  "en-dpa": dpaEN,
  "es-terminos": terminosES,
  "en-terminos": terminosEN,
  "es-privacidad": privacidadES,
  "en-privacidad": privacidadEN,
  "es-libro-clases": libroClasesES,
  "en-libro-clases": libroClasesEN,
  "es-meetings": meetingsES,
  "en-meetings": meetingsEN,
  "es-master": masterES,
  "en-master": masterEN,
};

// Registry is populated with all translation files

// Sacred namespace loader - now synchronous using pre-loaded translations
const invokeOracle = async (
  language: Language,
  namespace: string,
): Promise<TranslationStrings> => {
  try {
    const key = `${language}-${namespace}`;
    const translations = translationRegistry[key];

    if (!translations) {
      // Log in development only
      if (process.env.NODE_ENV === "development") {
      }
      return {};
    }

    return translations;
  } catch (error) {
    // Log in development only
    if (process.env.NODE_ENV === "development") {
    }
    return {};
  }
};

const invokeOracles = async (
  language: Language,
  namespaces: string[],
): Promise<LoadedNamespace> => {
  const results: LoadedNamespace = {};

  // Parallel loading for performance
  const promises = namespaces.map(async (namespace) => {
    const translations = await invokeOracle(language, namespace);
    results[namespace] = translations;
  });

  await Promise.all(promises);
  return results;
};

// Route-based namespace mapping
const getNamespaceForRoute = (pathname: string): string[] => {
  // Base namespaces always loaded
  const baseNamespaces = ["common"];

  // Route-specific namespaces
  if (pathname.startsWith("/admin")) {
    return [...baseNamespaces, "navigation", "admin", "dashboard"];
  }

  if (pathname.startsWith("/profesor")) {
    return [...baseNamespaces, "navigation", "profesor", "dashboard"];
  }

  if (pathname.startsWith("/parent")) {
    return [...baseNamespaces, "navigation", "parent", "dashboard"];
  }

  // Public routes
  if (pathname === "/" || pathname.startsWith("/public")) {
    return [...baseNamespaces, "navigation"];
  }

  // Programas routes
  if (pathname.startsWith("/programas")) {
    return [...baseNamespaces, "navigation", "programas"];
  }

  // Auth routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) {
    return [...baseNamespaces];
  }

  // Default fallback
  return [...baseNamespaces, "navigation"];
};

// Browser language detection - SSR safe with proper hydration handling
const detectBrowserLanguage = (): Language => {
  // Always return default on server to prevent hydration mismatch
  if (typeof window === "undefined") return "es";

  try {
    // Check if navigator is available and has language property
    if (!navigator || !navigator.language) return "es";

    const browserLang = navigator.language.toLowerCase();
    const supportedLanguages = ["es", "en"] as const;

    // Exact match first
    if ((supportedLanguages as readonly string[]).includes(browserLang)) {
      return browserLang as Language;
    }

    // Language code without region
    const langCode = browserLang.split("-")[0];
    if ((supportedLanguages as readonly string[]).includes(langCode)) {
      return langCode as Language;
    }

    return "es";
  } catch (error) {
    // Log in development only
    if (process.env.NODE_ENV === "development") {
    }
    return "es";
  }
};

const LANGUAGE_STORAGE_KEY = "aramac-language-preference";

const getStoredLanguage = (): Language | null => {
  // Always return null on server to prevent hydration mismatch
  if (typeof window === "undefined") return null;
  try {
    // First check localStorage (preferred, faster)
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      return stored as Language;
    }

    // Fallback to cookie (for server-side sync)
    const cookieName = "aramac-language-preference";
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === cookieName && (value === "es" || value === "en")) {
        // Sync to localStorage for faster future access
        localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
        return value as Language;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const setStoredLanguage = (language: Language): void => {
  if (typeof window === "undefined") return;
  try {
    // Set localStorage for fast client-side access
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    // Also set cookie for server-side proxy synchronization
    // Match exact attributes used in proxy.ts
    const cookieName = "aramac-language-preference";
    const maxAge = 60 * 60 * 24 * 365; // 1 year (matches proxy.ts)
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const sameSite = "; SameSite=Lax"; // matches proxy.ts sameSite: "lax"
    const path = "; Path=/"; // matches proxy.ts path: "/"
    document.cookie = `${cookieName}=${language}${path}; Max-Age=${maxAge}; Expires=${expires}${secure}${sameSite}`;
  } catch (error) {
    // Silently fail - language state will still work with localStorage
    if (process.env.NODE_ENV === "development") {
    }
  }
};

// Divine Parsing Oracle Context
const DivineParsingOracleContext = createContext<
  DivineParsingOracleContextType | undefined
>(undefined);

// Performance monitoring utilities
interface PerformanceMetrics {
  loadStartTime: number;
  loadEndTime: number;
  cacheHits: number;
  totalRequests: number;
  namespaceLoadTimes: Record<string, number>;
}

interface TranslationStats {
  totalKeys: number;
  loadedNamespaces: number;
  cacheSize: number;
  cacheHitRate: number;
  loadTime: number;
}

// Translation result cache for performance optimization
const translationCache = new Map<string, string>();

const clearTranslationCache = () => {
  translationCache.clear();
};

const getCacheKey = (
  key: string,
  namespace: string,
  language: Language,
): string => {
  return `${language}:${namespace}:${key}`;
};

const DivineParsingOracleProvider: React.FC<{
  children: React.ReactNode;
  initialNamespaces?: string[];
  initialLanguage?: Language;
}> = ({ children, initialNamespaces = ["common"], initialLanguage }) => {
  // Detect initial language synchronously to prevent hydration mismatch
  const getInitialLanguage = (): Language => {
    // If initialLanguage is provided, use it (highest priority)
    if (initialLanguage) return initialLanguage;

    // On server, always use default to prevent hydration mismatch
    if (typeof window === "undefined") return "es";

    // On client, check stored preference first (user choice)
    const stored = getStoredLanguage();
    if (stored) return stored;

    // Then check browser language (system preference)
    return detectBrowserLanguage();
  };

  const initialLang = getInitialLanguage();

  // Core state - prevent hydration mismatch by using consistent initial values
  const [language, setLanguageState] = useState<Language>(initialLang);
  const [isLoading, setIsLoading] = useState(false); // Start as false to prevent hydration issues
  const [error, setError] = useState<string | null>(null);
  const [loadedNamespaces, setLoadedNamespaces] =
    useState<string[]>(initialNamespaces);
  const [loadedTranslations, setLoadedTranslations] = useState<LoadedNamespace>(
    () => {
      // Pre-load initial translations synchronously with detected language
      const initialTranslations: LoadedNamespace = {};
      const langTranslations =
        translations[initialLang as keyof typeof translations];
      if (langTranslations) {
        for (const namespace of initialNamespaces) {
          const nsTranslations =
            langTranslations[namespace as keyof typeof langTranslations];
          if (nsTranslations && typeof nsTranslations === "object") {
            initialTranslations[namespace] =
              nsTranslations as TranslationStrings;
          }
        }
      }
      return initialTranslations;
    },
  );

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      loadStartTime: 0,
      loadEndTime: 0,
      cacheHits: 0,
      totalRequests: 0,
      namespaceLoadTimes: {},
    });

  // Initialize language and load base namespaces - only run on client
  useEffect(() => {
    const initializeOracle = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Run translation validation in development
        if (process.env.NODE_ENV === "development") {
          logValidationResults();
        }

        // Check if we need to update stored language preference
        const currentStored = getStoredLanguage();
        if (currentStored !== language) {
          setStoredLanguage(language);
        }

        // If language changed from initial detection, reload translations
        if (language !== initialLang) {
          if (initialNamespaces.length > 0) {
            const newTranslations = await invokeOracles(
              language,
              initialNamespaces,
            );
            setLoadedTranslations(newTranslations);
          }
        }
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
        }
        setError("Failed to initialize translation oracle");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run initialization on client side
    if (typeof window !== "undefined") {
      initializeOracle();
    }
  }, [initialNamespaces, language, initialLang]);

  // Post-hydration language synchronization
  useEffect(() => {
    // Only run on client after hydration
    if (typeof window === "undefined") return;

    const synchronizeLanguage = async () => {
      try {
        // Check if client-side detection differs from server-side initial value
        const stored = getStoredLanguage();
        const browser = detectBrowserLanguage();
        const clientPreferredLang = stored || browser;

        // If client preference differs from current language, update it
        if (clientPreferredLang !== language) {
          if (process.env.NODE_ENV === "development") {
          }

          // Clear cache for the language change
          clearTranslationCache();

          // Update language state without triggering loading
          setLanguageState(clientPreferredLang);

          // Store the preference
          setStoredLanguage(clientPreferredLang);

          // Reload translations if needed
          if (loadedNamespaces.length > 0) {
            const newTranslations = await invokeOracles(
              clientPreferredLang,
              loadedNamespaces,
            );
            setLoadedTranslations(newTranslations);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
        }
      }
    };

    // Small delay to ensure hydration is complete
    const timeoutId = setTimeout(synchronizeLanguage, 100);
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array - run once after mount

  // Language change handler
  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      try {
        setError(null);
        setIsLoading(true);

        // Clear translation cache when language changes
        clearTranslationCache();

        setLanguageState(newLanguage);
        setStoredLanguage(newLanguage);

        // Reload all currently loaded namespaces for new language
        if (loadedNamespaces.length > 0) {
          const newTranslations = await invokeOracles(
            newLanguage,
            loadedNamespaces,
          );
          setLoadedTranslations(newTranslations);
        }
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
        }
        setError("Failed to change language");
      } finally {
        setIsLoading(false);
      }
    },
    [loadedNamespaces],
  );

  // Namespace loading functions
  const invokeOracleSingle = useCallback(
    async (namespace: string) => {
      if (loadedNamespaces.includes(namespace)) {
        return; // Already loaded
      }

      try {
        const loadStart = performance.now();
        const translations = await invokeOracle(language, namespace);
        const loadTime = performance.now() - loadStart;

        setLoadedTranslations((prev) => ({
          ...prev,
          [namespace]: translations,
        }));

        setLoadedNamespaces((prev) => [...prev, namespace]);

        // Update performance metrics
        setPerformanceMetrics((prev) => ({
          ...prev,
          namespaceLoadTimes: {
            ...prev.namespaceLoadTimes,
            [namespace]: loadTime,
          },
        }));
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
        }
        setError(`Failed to load translations for ${namespace}`);
      }
    },
    [language, loadedNamespaces],
  );

  const invokeOraclesMultiple = useCallback(
    async (namespaces: string[]) => {
      const newNamespaces = namespaces.filter(
        (ns) => !loadedNamespaces.includes(ns),
      );

      if (newNamespaces.length === 0) {
        return; // All already loaded
      }

      try {
        setIsLoading(true);
        const newTranslations = await invokeOracles(language, newNamespaces);

        setLoadedTranslations((prev) => ({
          ...prev,
          ...newTranslations,
        }));

        setLoadedNamespaces((prev) => [...prev, ...newNamespaces]);
      } catch (err) {
        // Log in development only
        if (process.env.NODE_ENV === "development") {
        }
        setError("Failed to load translation namespaces");
      } finally {
        setIsLoading(false);
      }
    },
    [language, loadedNamespaces],
  );

  // Background prefetching
  const preinvokeOracles = useCallback(
    (namespaces: string[]) => {
      const newNamespaces = namespaces.filter(
        (ns) => !loadedNamespaces.includes(ns),
      );

      if (newNamespaces.length === 0) {
        return;
      }

      // Use requestIdleCallback for background loading
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          invokeOracles(language, newNamespaces)
            .then((newTranslations) => {
              setLoadedTranslations((prev) => ({
                ...prev,
                ...newTranslations,
              }));
              setLoadedNamespaces((prev) => [...prev, ...newNamespaces]);
            })
            .catch((err) => {
              // Log in development only
              if (process.env.NODE_ENV === "development") {
              }
            });
        });
      }
    },
    [language, loadedNamespaces],
  );

  // Helper function to get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  };

  // Helper functions for translation fallback chains
  const isValidTranslation = (value: any): value is string => {
    return typeof value === "string" && value.trim().length > 0;
  };

  const transformKeyFormat = (key: string): string => {
    // snake_case to camelCase
    if (key.includes("_")) {
      return key
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    // camelCase to snake_case
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  };

  const formatMissingKey = (key: string): string => {
    // Convert snake_case or camelCase to readable format
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  // Enhanced translation function with robust fallback chains and caching
  const t = useMemo(() => {
    return (
      key: string,
      namespace: string | Record<string, any> = "common",
      variables?: Record<string, any>,
    ): string => {
      let actualNamespace = "common";
      let actualVariables: Record<string, any> | undefined = variables;

      if (typeof namespace === "string") {
        actualNamespace = namespace;
      } else if (typeof namespace === "object" && namespace !== null) {
        actualVariables = namespace;
      }

      const performInterpolation = (text: string): string => {
        if (!actualVariables) return text;
        return text.replace(
          /\{(\w+)\}/g,
          (_, k) => actualVariables![k]?.toString() || `{${k}}`,
        );
      };

      // Create cache key outside try block for error handling
      const cacheKey = getCacheKey(key, actualNamespace, language);

      // Helper to cache and return
      const cacheAndReturn = (value: string) => {
        translationCache.set(cacheKey, value);
        return performInterpolation(value);
      };

      try {
        // Check cache first for performance
        const cachedResult = translationCache.get(cacheKey);
        if (cachedResult !== undefined) {
          return performInterpolation(cachedResult);
        }
        // Fallback chain priority:
        // 1. Direct translations object lookup (fastest)
        // 2. Registry lookup (compatibility)
        // 3. Alternative namespace lookup
        // 4. Opposite language lookup (for missing translations)
        // 5. Common namespace fallback
        // 6. Key transformation and final fallback

        // 1. Direct synchronous lookup from translations object
        const langTranslations =
          translations[language as keyof typeof translations];
        if (langTranslations) {
          const namespaceTranslations =
            langTranslations[namespace as keyof typeof langTranslations];
          if (
            namespaceTranslations &&
            typeof namespaceTranslations === "object"
          ) {
            // Try flat key lookup (backward compatibility)
            const flatValue = (namespaceTranslations as any)[key];
            if (isValidTranslation(flatValue)) {
              return cacheAndReturn(flatValue);
            }

            // Try nested path lookup
            const nestedValue = getNestedValue(namespaceTranslations, key);
            if (isValidTranslation(nestedValue)) {
              return cacheAndReturn(nestedValue);
            }
          }
        }

        // 2. Fallback to registry for compatibility
        const registryKey = `${language}-${namespace}`;
        const registryTranslations = translationRegistry[registryKey];
        if (registryTranslations) {
          const registryValue = registryTranslations[key];
          if (isValidTranslation(registryValue)) {
            return cacheAndReturn(registryValue);
          }

          const nestedRegistryValue = getNestedValue(registryTranslations, key);
          if (isValidTranslation(nestedRegistryValue)) {
            return cacheAndReturn(nestedRegistryValue);
          }
        }

        // 3. Try alternative namespace lookup (common namespace often has shared keys)
        if (namespace !== "common") {
          const commonTranslations =
            translations[language as keyof typeof translations]?.common;
          if (commonTranslations) {
            const commonValue = (commonTranslations as any)[key];
            if (isValidTranslation(commonValue)) {
              return cacheAndReturn(commonValue);
            }
          }
        }

        // 4. Try opposite language as fallback for missing translations
        const oppositeLang = language === "es" ? "en" : "es";
        const oppositeTranslations =
          translations[oppositeLang as keyof typeof translations];
        if (oppositeTranslations) {
          const oppositeNamespaceTranslations =
            oppositeTranslations[
              namespace as keyof typeof oppositeTranslations
            ];
          if (oppositeNamespaceTranslations) {
            const oppositeValue = (oppositeNamespaceTranslations as any)[key];
            if (isValidTranslation(oppositeValue)) {
              // Log fallback usage in development
              if (process.env.NODE_ENV === "development") {
              }
              return cacheAndReturn(oppositeValue);
            }
          }
        }

        // 5. Try common namespace in opposite language
        if (namespace !== "common") {
          const oppositeCommon =
            translations[oppositeLang as keyof typeof translations]?.common;
          if (oppositeCommon) {
            const oppositeCommonValue = (oppositeCommon as any)[key];
            if (isValidTranslation(oppositeCommonValue)) {
              if (process.env.NODE_ENV === "development") {
              }
              return cacheAndReturn(oppositeCommonValue);
            }
          }
        }

        // 6. Key transformation fallbacks
        // Try converting snake_case to camelCase or vice versa
        const transformedKey = transformKeyFormat(key);
        if (transformedKey !== key) {
          // Try transformed key in current language and namespace
          const langTranslations =
            translations[language as keyof typeof translations];
          const namespaceTranslations =
            langTranslations?.[namespace as keyof typeof langTranslations];
          const transformedValue = getNestedValue(
            namespaceTranslations || {},
            transformedKey,
          );
          if (isValidTranslation(transformedValue)) {
            return cacheAndReturn(transformedValue);
          }
        }

        // 7. Development warning for missing keys
        if (process.env.NODE_ENV === "development") {
        }

        // 8. Final fallback - return a formatted version of the key
        const finalResult = formatMissingKey(key);

        // Cache the result for future lookups
        return cacheAndReturn(finalResult);
      } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === "development") {
        }
        const errorResult = formatMissingKey(key);
        // Cache error results too to avoid repeated errors
        return cacheAndReturn(errorResult);
      }
    };
  }, [language]);

  // Utility functions
  const getLoadedNamespaces = useCallback(
    () => loadedNamespaces,
    [loadedNamespaces],
  );

  const isOracleActive = useCallback(
    (namespace: string) => loadedNamespaces.includes(namespace),
    [loadedNamespaces],
  );

  const getTranslationStats = useCallback(() => {
    const totalKeys = Object.values(loadedTranslations).reduce(
      (total, namespace) => total + Object.keys(namespace).length,
      0,
    );

    const avgLoadTime =
      Object.values(performanceMetrics.namespaceLoadTimes).reduce(
        (sum, time) => sum + time,
        0,
      ) /
      Math.max(Object.keys(performanceMetrics.namespaceLoadTimes).length, 1);

    return {
      totalKeys,
      loadedNamespaces: loadedNamespaces.length,
      cacheSize: translationCache.size,
      cacheHitRate:
        performanceMetrics.totalRequests > 0
          ? (performanceMetrics.cacheHits / performanceMetrics.totalRequests) *
            100
          : 0,
      loadTime: avgLoadTime,
    };
  }, [loadedNamespaces, loadedTranslations, performanceMetrics]);

  // Context value
  const contextValue: DivineParsingOracleContextType = {
    language,
    setLanguage,
    t,
    isLoading,
    loadedNamespaces,
    invokeOracle: invokeOracleSingle,
    invokeOracles: invokeOraclesMultiple,
    preinvokeOracles,
    getLoadedNamespaces,
    isOracleActive,
    getTranslationStats,
    error,
  };

  return (
    <DivineParsingOracleContext.Provider value={contextValue}>
      {children}
    </DivineParsingOracleContext.Provider>
  );
};

// Divine hook for components
export function useDivineParsing(namespaces: string[] = []) {
  const context = useContext(DivineParsingOracleContext);

  // Auto-load required namespaces - Hook must be called unconditionally
  useEffect(() => {
    if (context && namespaces.length > 0) {
      const unloadedNamespaces = namespaces.filter(
        (ns) => !context.loadedNamespaces.includes(ns),
      );
      if (unloadedNamespaces.length > 0) {
        context.invokeOracles(unloadedNamespaces);
      }
    }
  }, [namespaces, context]);

  // Graceful fallback for build time or missing provider
  if (!context) {
    // Log warning only in development
    if (process.env.NODE_ENV === "development") {
    }

    // Return a safe default context to prevent crashes
    return {
      language: "es" as Language,
      setLanguage: () => {},
      t: (key: string, _ns?: string | Record<string, any>) => key,
      isLoading: false,
      loadedNamespaces: [] as string[],
      invokeOracle: async () => {},
      invokeOracles: async () => ({}),
      preinvokeOracles: () => {},
      getLoadedNamespaces: () => [],
      isOracleActive: () => false,
      getTranslationStats: () => ({
        totalKeys: 0,
        loadedNamespaces: 0,
        cacheSize: 0,
        cacheHitRate: 0,
        loadTime: 0,
      }),
      error: null,
    };
  }

  return context;
}

// Export the provider
export { DivineParsingOracleProvider };
