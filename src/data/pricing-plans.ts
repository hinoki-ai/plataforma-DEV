export type BillingCycle = "monthly" | "annual" | "biannual";

type PlanFeatureValue = boolean | number | string | null;

export interface PlanFeatures {
  platform: boolean;
  basicMaterials: boolean;
  academicTracking: boolean;
  courses: number;
  storage: string;
  meetings: number | string;
  users: number;
  support: string;
  sla: string;
  training: boolean;
  advancedReports: boolean;
  integrations: boolean;
  api: boolean;
  dedicatedManager: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  pricePerStudent: number;
  minStudents: number;
  maxStudents: number | null;
  badge: string | null;
  features: PlanFeatures;
}

export const billingCycleDiscount: Record<BillingCycle, number> = {
  monthly: 0,
  annual: 0.15,
  biannual: 0.25,
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "inicial",
    name: "Plan Inicial",
    description: "Hasta 50 estudiantes",
    pricePerStudent: 2000,
    minStudents: 1,
    maxStudents: 50,
    badge: null,
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 12,
      storage: "5 GB",
      meetings: 10,
      users: 2,
      support: "Email (48hrs)",
      sla: "80%",
      training: false,
      advancedReports: false,
      integrations: false,
      api: false,
      dedicatedManager: false,
    },
  },
  {
    id: "avanzado",
    name: "Plan Avanzado",
    description: "Hasta 350 estudiantes",
    pricePerStudent: 1750,
    minStudents: 51,
    maxStudents: 350,
    badge: "Más Popular",
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 24,
      storage: "50 GB",
      meetings: 50,
      users: 3,
      support: "Email y Chat (24hrs)",
      sla: "90%",
      training: true,
      advancedReports: true,
      integrations: false,
      api: false,
      dedicatedManager: false,
    },
  },
  {
    id: "academico",
    name: "Plan Académico",
    description: "Hasta 1.000 estudiantes",
    pricePerStudent: 1500,
    minStudents: 351,
    maxStudents: 1000,
    badge: null,
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 36,
      storage: "200 GB",
      meetings: 200,
      users: 4,
      support: "Prioritario (12hrs)",
      sla: "95%",
      training: true,
      advancedReports: true,
      integrations: true,
      api: false,
      dedicatedManager: false,
    },
  },
  {
    id: "institucional",
    name: "Plan Institucional",
    description: "Más de 1.000 estudiantes",
    pricePerStudent: 1250,
    minStudents: 1001,
    maxStudents: null,
    badge: "Premium",
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 48,
      storage: "1 TB",
      meetings: "Ilimitado",
      users: 5,
      support: "Dedicado 24/7",
      sla: "99%",
      training: true,
      advancedReports: true,
      integrations: true,
      api: true,
      dedicatedManager: true,
    },
  },
];

export const featureLabels: Array<{ key: keyof PlanFeatures; label: string }> =
  [
    { key: "platform", label: "Acceso a plataforma educativa" },
    { key: "basicMaterials", label: "Materiales de estudio" },
    { key: "academicTracking", label: "Seguimiento académico" },
    { key: "courses", label: "Cursos/asignaturas" },
    { key: "storage", label: "Almacenamiento" },
    { key: "meetings", label: "Reuniones virtuales/mes" },
    { key: "users", label: "Usuarios administrativos" },
    { key: "support", label: "Soporte técnico" },
    { key: "sla", label: "SLA de disponibilidad" },
    { key: "training", label: "Capacitación del personal" },
    { key: "advancedReports", label: "Reportes avanzados" },
    { key: "integrations", label: "Integraciones (SIGE, etc.)" },
    { key: "api", label: "API y webhooks" },
    { key: "dedicatedManager", label: "Gerente de cuenta" },
  ];

export const findPricingPlan = (planId: string) =>
  pricingPlans.find((plan) => plan.id === planId);

export const isValidBillingCycle = (
  value: string | null | undefined,
): value is BillingCycle =>
  value === "monthly" || value === "annual" || value === "biannual";

export const formatCLP = (amount: number) =>
  `$${amount.toLocaleString("es-CL")}`;

export const calculateBillingPrice = (
  pricePerStudent: number,
  students: number,
  billingCycle: BillingCycle,
) => {
  const discount = billingCycleDiscount[billingCycle];
  const base = pricePerStudent * students;
  return Math.round(base * (1 - discount));
};

export const isPlanFeatureEnabled = (value: PlanFeatureValue) => {
  if (typeof value === "boolean") {
    return value;
  }
  return Boolean(value);
};
