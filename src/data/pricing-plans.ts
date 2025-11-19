export type BillingCycle = "semestral" | "annual" | "biannual";

type PlanFeatureValue = boolean | number | string | null;

export interface PlanFeatures {
  platform: boolean;
  basicMaterials: boolean;
  academicTracking: boolean;
  courses: number;
  subjects: number;
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
  semestral: 0,
  annual: 0.15,
  biannual: 0.25,
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "inicial",
    name: "Plan Inicial",
    description: "Hasta 50 estudiantes",
    pricePerStudent: 1000,
    minStudents: 1,
    maxStudents: 50,
    badge: null,
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 6,
      subjects: 6,
      storage: "5 GB",
      meetings: 10,
      users: 1,
      support: "Email (48hrs)",
      sla: "80%",
      training: false,
      advancedReports: false,
      integrations: true,
      api: false,
      dedicatedManager: false,
    },
  },
  {
    id: "avanzado",
    name: "Plan Avanzado",
    description: "Hasta 350 estudiantes",
    pricePerStudent: 875,
    minStudents: 51,
    maxStudents: 350,
    badge: "Más Popular",
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 14,
      subjects: 15,
      storage: "50GB+",
      meetings: 50,
      users: 2,
      support: "Email y Chat (24hrs)",
      sla: "90%",
      training: true,
      advancedReports: true,
      integrations: true,
      api: false,
      dedicatedManager: false,
    },
  },
  {
    id: "academico",
    name: "Plan Académico",
    description: "Hasta 1.000 estudiantes",
    pricePerStudent: 750,
    minStudents: 351,
    maxStudents: 1000,
    badge: null,
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 18,
      subjects: 18,
      storage: "200GB+",
      meetings: 200,
      users: 3,
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
    pricePerStudent: 600,
    minStudents: 1001,
    maxStudents: null,
    badge: "Premium",
    features: {
      platform: true,
      basicMaterials: true,
      academicTracking: true,
      courses: 24,
      subjects: 24,
      storage: "1TB+",
      meetings: "Ilimitado",
      users: 4,
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
    { key: "courses", label: "Cursos" },
    { key: "subjects", label: "Asignaturas" },
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
  value === "semestral" || value === "annual" || value === "biannual";

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

/**
 * Finds the appropriate pricing plan for a given student count
 * Returns the plan that matches the student count range
 */
export const findPlanByStudentCount = (studentCount: number): PricingPlan => {
  // Find the plan where studentCount falls within minStudents and maxStudents
  const matchingPlan = pricingPlans.find((plan) => {
    if (plan.maxStudents === null) {
      return studentCount >= plan.minStudents;
    }
    return studentCount >= plan.minStudents && studentCount <= plan.maxStudents;
  });

  // If no exact match, return the closest plan (prefer higher tier if on boundary)
  if (!matchingPlan) {
    // If student count is below minimum, return first plan
    if (studentCount < pricingPlans[0].minStudents) {
      return pricingPlans[0];
    }
    // If student count is above all maxes, return last plan
    return pricingPlans[pricingPlans.length - 1];
  }

  return matchingPlan;
};

/**
 * Validates if a student count is within the range of a given plan
 */
export const validatePlanForStudents = (
  plan: PricingPlan,
  studentCount: number,
): { isValid: boolean; reason?: string } => {
  if (studentCount < plan.minStudents) {
    return {
      isValid: false,
      reason: `El plan ${plan.name} requiere mínimo ${plan.minStudents} estudiantes`,
    };
  }
  if (plan.maxStudents !== null && studentCount > plan.maxStudents) {
    return {
      isValid: false,
      reason: `El plan ${plan.name} admite máximo ${plan.maxStudents} estudiantes`,
    };
  }
  return { isValid: true };
};

/**
 * Calculates comprehensive price breakdown including VAT
 */
export interface PriceBreakdown {
  basePrice: number;
  basePricePerMonth: number;
  billingCycleDiscount: number;
  billingCycleDiscountAmount: number;
  priceAfterBillingDiscount: number;
  priceAfterBillingDiscountPerMonth: number;
  upfrontDiscount: number;
  upfrontDiscountAmount: number;
  subtotal: number;
  vat: number;
  vatAmount: number;
  total: number;
  totalPerMonth: number;
  savings: {
    fromBillingCycle: number;
    fromUpfront: number;
    total: number;
  };
}

export const calculatePriceBreakdown = (
  pricePerStudent: number,
  students: number,
  billingCycle: BillingCycle,
  paymentFrequency: "monthly" | "upfront",
  upfrontDiscountPercent: number = 0.05,
  vatPercent: number = 0.19,
): PriceBreakdown => {
  // Base calculations (no rounding until final step)
  const basePrice = pricePerStudent * students;
  const billingCycleMonths =
    billingCycle === "semestral" ? 6 : billingCycle === "annual" ? 12 : 24;
  const basePricePerMonth = basePrice;

  // Apply billing cycle discount
  const cycleDiscount = billingCycleDiscount[billingCycle];
  const billingCycleDiscountAmount = basePrice * cycleDiscount;
  const priceAfterBillingDiscount = basePrice * (1 - cycleDiscount);
  const priceAfterBillingDiscountPerMonth = priceAfterBillingDiscount;

  // Calculate period total (before upfront discount)
  const periodTotalBeforeUpfront =
    priceAfterBillingDiscountPerMonth * billingCycleMonths;

  // Apply upfront discount if applicable
  const upfrontDiscount =
    paymentFrequency === "upfront" ? upfrontDiscountPercent : 0;
  const upfrontDiscountAmount =
    paymentFrequency === "upfront"
      ? periodTotalBeforeUpfront * upfrontDiscountPercent
      : 0;
  const subtotal = periodTotalBeforeUpfront - upfrontDiscountAmount;

  // Calculate VAT
  const vatAmount = Math.round(subtotal * vatPercent);
  const total = subtotal + vatAmount;

  // Per month calculations
  const totalPerMonth = total / billingCycleMonths;

  // Savings calculations
  const savingsFromBillingCycle =
    billingCycleDiscountAmount * billingCycleMonths;
  const savingsFromUpfront = upfrontDiscountAmount;
  const totalSavings = savingsFromBillingCycle + savingsFromUpfront;

  return {
    basePrice: Math.round(basePrice),
    basePricePerMonth: Math.round(basePricePerMonth),
    billingCycleDiscount: cycleDiscount,
    billingCycleDiscountAmount: Math.round(billingCycleDiscountAmount),
    priceAfterBillingDiscount: Math.round(priceAfterBillingDiscount),
    priceAfterBillingDiscountPerMonth: Math.round(
      priceAfterBillingDiscountPerMonth,
    ),
    upfrontDiscount,
    upfrontDiscountAmount: Math.round(upfrontDiscountAmount),
    subtotal: Math.round(subtotal),
    vat: vatPercent,
    vatAmount,
    total: Math.round(total),
    totalPerMonth: Math.round(totalPerMonth),
    savings: {
      fromBillingCycle: Math.round(savingsFromBillingCycle),
      fromUpfront: Math.round(savingsFromUpfront),
      total: Math.round(totalSavings),
    },
  };
};

/**
 * Compares all billing cycles and returns the best option
 */
export interface BillingCycleComparison {
  cycle: BillingCycle;
  totalCost: number;
  monthlyCost: number;
  savings: number;
  savingsPercent: number;
}

export const compareBillingCycles = (
  pricePerStudent: number,
  students: number,
  paymentFrequency: "monthly" | "upfront" = "monthly",
): BillingCycleComparison[] => {
  const cycles: BillingCycle[] = ["semestral", "annual", "biannual"];
  const basePrice = pricePerStudent * students;

  const comparisons: BillingCycleComparison[] = cycles.map((cycle) => {
    const breakdown = calculatePriceBreakdown(
      pricePerStudent,
      students,
      cycle,
      paymentFrequency,
    );
    // Calculate base total (no discounts, but with VAT) for comparison
    const months = cycle === "semestral" ? 6 : cycle === "annual" ? 12 : 24;
    const baseTotalWithoutDiscounts = basePrice * months;
    const baseTotalWithVAT = Math.round(baseTotalWithoutDiscounts * 1.19); // Add VAT
    const savings = baseTotalWithVAT - breakdown.total;
    const savingsPercent = (savings / baseTotalWithVAT) * 100;

    return {
      cycle,
      totalCost: breakdown.total,
      monthlyCost: breakdown.totalPerMonth,
      savings: Math.max(0, Math.round(savings)), // Ensure non-negative
      savingsPercent: Math.max(0, Math.round(savingsPercent * 100) / 100),
    };
  });

  return comparisons.sort((a, b) => a.totalCost - b.totalCost);
};
