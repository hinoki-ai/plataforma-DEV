export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";
  createdAt: Date;
  updatedAt: Date;
  googleUserId: string | null;
  workspaceEmail: string | null;
  workspaceId: string | null;
  // lastLogin: Date | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface UserFormData {
  name: string;
  email: string;
  role: "ADMIN" | "PROFESOR" | "PARENT";
  isActive?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user: User;
}

export interface GoogleWorkspaceUser {
  id: string;
  primaryEmail: string;
  name: {
    givenName: string;
    familyName: string;
    fullName: string;
  };
  suspended: boolean;
  password: string;
  changePasswordAtNextLogin: boolean;
  includeInGlobalAddressList: boolean;
}

export interface DNSRecord {
  type: "MX" | "SPF" | "DKIM" | "DMARC";
  host: string;
  value: string;
  priority?: number;
  status: "VALID" | "INVALID" | "PENDING";
  message?: string;
}

export interface DomainConfig {
  domain: string;
  verified: boolean;
  dnsRecords: DNSRecord[];
  usersCount: number;
  lastSync: Date | null;
}
