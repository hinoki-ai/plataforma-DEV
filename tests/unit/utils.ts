import { Role } from "@/lib/types";

// Test user creation utilities
export const createTestAdmin = () => ({
  id: "admin-123",
  email: "admin@manitospintadas.cl",
  name: "Admin User",
  role: "ADMIN" as Role,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

export const createTestTeacher = () => ({
  id: "teacher-123",
  email: "profesor@manitospintadas.cl",
  name: "Teacher User",
  role: "PROFESOR" as Role,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

export const createTestCentroConsejoMember = () => ({
  id: "centro-123",
  email: "centro@example.com",
  name: "Centro Consejo Member",
  role: "CENTRO_CONSEJO" as Role,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

export const createTestParent = () => ({
  id: "parent-123",
  email: "parent@example.com",
  name: "Parent User",
  role: "PARENT" as Role,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

// Test data utilities
export const mockSession = (role: Role = "ADMIN") => ({
  user: {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    role,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

export const mockPlanningDocument = () => ({
  id: "planning-123",
  title: "Test Planning Document",
  content: "Test content",
  grade: "1° Básico",
  subject: "Matemáticas",
  week: 1,
  date: new Date("2024-01-15"),
  attachments: [],
  authorId: "test-user-123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

export const mockMeeting = () => ({
  id: "meeting-123",
  title: "Test Meeting",
  description: "Test meeting description",
  date: new Date("2024-01-15"),
  time: "14:00",
  duration: 60,
  type: "PARENT" as const,
  teacherId: "teacher-123",
  parentId: "parent-123",
  status: "CONFIRMED" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});
