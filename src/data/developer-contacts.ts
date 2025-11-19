export interface DeveloperContact {
  id: string;
  nameKey: string;
  roleKey: string;
  email: string;
  whatsappDisplay: string;
  whatsappLink: string;
}

export const developerContacts: DeveloperContact[] = [
  {
    id: "principal",
    nameKey: "calculator.contacts.team_astral",
    roleKey: "calculator.contacts.lead_developer_onboarding",
    email: "plataforma@astral.cl",
    whatsappDisplay: "+56 9 7500 1234",
    whatsappLink: "https://wa.me/56975001234",
  },
  {
    id: "loreto",
    nameKey: "calculator.contacts.loreto",
    roleKey: "calculator.contacts.onboarding_chief",
    email: "loreto@astral.cl",
    whatsappDisplay: "+56 9 6854 3210",
    whatsappLink: "https://wa.me/56968543210",
  },
  {
    id: "agustin",
    nameKey: "calculator.contacts.agustin",
    roleKey: "calculator.contacts.lead_developer",
    email: "agustin@astral.cl",
    whatsappDisplay: "+56 9 8889 6773",
    whatsappLink: "https://wa.me/56988896773",
  },
  {
    id: "salesman",
    nameKey: "calculator.contacts.sales_team",
    roleKey: "calculator.contacts.sales_representative",
    email: "ventas@astral.cl",
    whatsappDisplay: "+56 9 8008 8008",
    whatsappLink: "https://wa.me/56980088008",
  },
];
