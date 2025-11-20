import { BillingCycle } from "./pricing-plans";

export interface BillingMetadataItem {
  label: string;
  description: string;
  months: number;
}

export type BillingMetadata = Record<BillingCycle, BillingMetadataItem>;

export function createBillingMetadata(
  tc: (key: string) => string,
): BillingMetadata {
  return {
    semestral: {
      label: tc("billing.semestral"),
      description:
        tc("billing.semestral") +
        " - " +
        tc("calculator.months").replace("{count}", "6"),
      months: 6,
    },
    annual: {
      label: tc("billing.annual"),
      description:
        tc("billing.annual") +
        " - " +
        tc("calculator.months").replace("{count}", "12") +
        " (" +
        tc("billing.discount_annual") +
        ")",
      months: 12,
    },
    biannual: {
      label: tc("billing.biannual"),
      description:
        tc("billing.biannual") +
        " - " +
        tc("calculator.months").replace("{count}", "24") +
        " (" +
        tc("billing.discount_biannual") +
        ")",
      months: 24,
    },
  };
}

