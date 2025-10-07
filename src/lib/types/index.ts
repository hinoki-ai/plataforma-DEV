// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "profesor" | "parent";
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Planning document types
export interface PlanningDocument {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlanningDocument {
  title: string;
  content: string;
  subject: string;
  grade: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form state types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  children?: NavItem[];
}

// School information types
export interface SchoolInfo {
  name: string;
  mission: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}
