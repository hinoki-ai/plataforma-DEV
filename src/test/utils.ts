import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { Providers } from "@/components/providers";

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: Providers, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const createTestUser = (overrides = {}) => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  role: "PROFESOR" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestAdmin = (overrides = {}) => ({
  ...createTestUser(),
  role: "ADMIN" as const,
  email: "admin@manitospintadas.cl",
  ...overrides,
});

export const createTestTeacher = (overrides = {}) => ({
  ...createTestUser(),
  role: "PROFESOR" as const,
  email: "profesor@manitospintadas.cl",
  ...overrides,
});

export const createTestParent = (overrides = {}) => ({
  ...createTestUser(),
  role: "PARENT" as const,
  email: "parent@example.com",
  ...overrides,
});

export const createTestPlanningDocument = (overrides = {}) => ({
  id: "test-planning-doc-id",
  title: "Test Planning Document",
  content: "Test content for planning document",
  subject: "Mathematics",
  grade: "Pre-Kinder",
  authorId: "test-user-id",
  attachments: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestMeeting = (overrides = {}) => ({
  id: "test-meeting-id",
  title: "Test Meeting",
  description: "Test meeting description",
  studentName: "Test Student",
  studentGrade: "Pre-Kinder",
  guardianName: "Test Guardian",
  guardianEmail: "guardian@example.com",
  guardianPhone: "+56912345678",
  scheduledDate: new Date(),
  scheduledTime: "10:00",
  duration: 30,
  location: "Sala de Reuniones",
  status: "SCHEDULED" as const,
  type: "PARENT_TEACHER" as const,
  assignedTo: "test-user-id",
  source: "STAFF_CREATED" as const,
  parentRequested: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestCalendarEvent = (overrides = {}) => ({
  id: "test-event-id",
  title: "Test Event",
  description: "Test event description",
  startDate: new Date(),
  endDate: new Date(),
  category: "ACADEMIC" as const,
  priority: "MEDIUM" as const,
  level: "both",
  isRecurring: false,
  isAllDay: false,
  color: "#3b82f6",
  location: "School",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "test-user-id",
  updatedBy: "test-user-id",
  version: 1,
  ...overrides,
});

export const createTestCentroConsejoMember = (overrides = {}) => ({
  id: "test-centro-consejo-id",
  name: "Test Centro Consejo Member",
  email: "centro@example.com",
  phone: "+56912345678",
  role: "Miembro Activo",
  status: "ACTIVE" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestVote = (overrides = {}) => ({
  id: "test-vote-id",
  title: "Test Vote",
  description: "Test vote description",
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestPhoto = (overrides = {}) => ({
  id: "test-photo-id",
  title: "Test Photo",
  description: "Test photo description",
  url: "https://example.com/photo.jpg",
  uploadedBy: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestVideo = (overrides = {}) => ({
  id: "test-video-id",
  title: "Test Video",
  description: "Test video description",
  url: "https://example.com/video.mp4",
  thumbnail: "https://example.com/thumbnail.jpg",
  category: "Educational",
  tags: ["test", "education"],
  isPublic: false,
  uploadedBy: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock session helpers
export const mockSession = (
  user: any = null,
  status: string = "authenticated",
) => ({
  data: user
    ? {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    : null,
  status,
});

export const mockAdminSession = () => mockSession(createTestAdmin());
export const mockTeacherSession = () => mockSession(createTestTeacher());
export const mockParentSession = () => mockSession(createTestParent());

// Utility functions for testing
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const createFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

export const createTestFile = (
  name = "test.txt",
  content = "test content",
  type = "text/plain",
) => {
  return new File([content], name, { type });
};
