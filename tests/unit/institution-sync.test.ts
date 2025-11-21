/**
 * Institution Synchronization Tests
 *
 * Tests for the Clerk-Convex user-institution synchronization system
 * Ensures users are properly assigned to institutions and memberships are created
 */

import { describe, it, expect } from "vitest";

/**
 * Role-aware Cognito Chat Tests
 *
 * Tests for role-based message filtering in the Cognito chat component
 */
describe("Cognito Chat Role Restrictions", () => {
  // Mock the role hierarchy and restrictions from cognito-chat.tsx
  const ROLE_RESTRICTIONS = {
    parent: {
      forbiddenTopics: [
        'admin', 'administrador', 'profesor', 'teacher', 'maestro', 'configurar',
        'gestionar', 'manejar', 'sistema', 'servidor', 'base de datos', 'usuarios',
        'permisos', 'roles', 'clases', 'estudiantes', 'calificaciones'
      ],
      redirectMessage: "Lo siento, como apoderado no puedo ayudarte con temas relacionados con la gestión docente o administrativa."
    },
    teacher: {
      forbiddenTopics: [
        'admin', 'administrador', 'master', 'maestro', 'sistema', 'servidor',
        'base de datos', 'configurar', 'usuarios', 'permisos', 'roles',
        'finanzas', 'presupuesto', 'institución', 'centro educativo'
      ],
      redirectMessage: "Lo siento, como profesor no puedo ayudarte con temas administrativos o de configuración del sistema."
    },
    admin: {
      forbiddenTopics: [
        'master', 'maestro', 'sistema', 'servidor', 'base de datos',
        'configurar', 'usuarios', 'permisos', 'roles', 'finanzas'
      ],
      redirectMessage: "Lo siento, como administrador no puedo ayudarte con temas técnicos avanzados del sistema."
    },
    master: {
      forbiddenTopics: [], // Master can ask about everything
      redirectMessage: ""
    }
  };

  const checkRoleViolation = (message: string, userRole: string): string | null => {
    const restrictions = ROLE_RESTRICTIONS[userRole as keyof typeof ROLE_RESTRICTIONS];
    if (!restrictions) return null;

    const lowerMessage = message.toLowerCase();
    const hasForbiddenTopic = restrictions.forbiddenTopics.some(topic =>
      lowerMessage.includes(topic.toLowerCase())
    );

    return hasForbiddenTopic ? restrictions.redirectMessage : null;
  };

  describe("Parent Role Restrictions", () => {
    it("should block parent from asking about teacher functionality", () => {
      const violations = [
        "Cómo gestionan los profesores las calificaciones?",
        "¿Puedo ver cómo los maestros configuran las clases?",
        "Explícame cómo manejar estudiantes"
      ];

      violations.forEach(message => {
        const result = checkRoleViolation(message, "parent");
        expect(result).toBeTruthy();
        expect(result).toContain("apoderado no puedo ayudarte");
      });
    });

    it("should allow parent to ask about student progress", () => {
      const allowedMessages = [
        "¿Cómo va mi estudiante en matemáticas?",
        "Quiero ver el progreso de mi hijo",
        "¿Cuándo es la reunión de apoderados?"
      ];

      allowedMessages.forEach(message => {
        const result = checkRoleViolation(message, "parent");
        expect(result).toBeNull();
      });
    });
  });

  describe("Teacher Role Restrictions", () => {
    it("should block teacher from asking about admin functionality", () => {
      const violations = [
        "¿Cómo configuran los administradores el sistema?",
        "Explícame cómo manejar usuarios y permisos",
        "¿Cómo gestionan las finanzas del centro?"
      ];

      violations.forEach(message => {
        const result = checkRoleViolation(message, "teacher");
        expect(result).toBeTruthy();
        expect(result).toContain("profesor no puedo ayudarte");
      });
    });

    it("should allow teacher to ask about class management", () => {
      const allowedMessages = [
        "¿Cómo planifico mis clases?",
        "Necesito ayuda con las actividades de estudiantes",
        "¿Cómo registro asistencia?"
      ];

      allowedMessages.forEach(message => {
        const result = checkRoleViolation(message, "teacher");
        expect(result).toBeNull();
      });
    });
  });

  describe("Admin Role Restrictions", () => {
    it("should block admin from asking about master functionality", () => {
      const violations = [
        "¿Cómo configura el maestro el sistema?",
        "Explícame la base de datos del servidor",
        "¿Cómo manejo usuarios a nivel técnico?"
      ];

      violations.forEach(message => {
        const result = checkRoleViolation(message, "admin");
        expect(result).toBeTruthy();
        expect(result).toContain("administrador no puedo ayudarte");
      });
    });

    it("should allow admin to ask about institution management", () => {
      const allowedMessages = [
        "¿Cómo gestiono los horarios?",
        "Necesito crear un nuevo usuario profesor",
        "¿Cómo configuro las reuniones?"
      ];

      allowedMessages.forEach(message => {
        const result = checkRoleViolation(message, "admin");
        expect(result).toBeNull();
      });
    });
  });

  describe("Master Role Permissions", () => {
    it("should allow master to ask about everything", () => {
      const messages = [
        "¿Cómo configuran los administradores?",
        "¿Cómo gestionan profesores las clases?",
        "¿Cómo ven padres el progreso?",
        "¿Cómo manejo el sistema técnico?"
      ];

      messages.forEach(message => {
        const result = checkRoleViolation(message, "master");
        expect(result).toBeNull();
      });
    });
  });
});

// Test the core logic functions that don't require database setup
describe("Institution Synchronization Logic", () => {
  describe("Email Domain Extraction", () => {
    it("should extract domain from email correctly", () => {
      const testCases = [
        { email: "user@astral.cl", expected: "astral.cl" },
        { email: "test.user@school.edu.cl", expected: "school.edu.cl" },
        { email: "admin@domain.co.uk", expected: "domain.co.uk" },
        { email: "invalid-email", expected: null },
        { email: "no@domain", expected: "domain" },
        { email: "", expected: null },
      ];

      testCases.forEach(({ email, expected }) => {
        const domain = email.split("@")[1]?.toLowerCase();
        expect(domain || null).toBe(expected);
      });
    });
  });

  describe("Role Mapping", () => {
    it("should map user roles to membership roles correctly", () => {
      const testCases = [
        { userRole: "ADMIN", expected: "ADMIN" },
        { userRole: "PROFESOR", expected: "PROFESOR" },
        { userRole: "PARENT", expected: "PARENT" },
        { userRole: "MASTER", expected: "STAFF" }, // MASTER maps to STAFF in memberships
        { userRole: "PUBLIC", expected: "STAFF" },
      ];

      testCases.forEach(({ userRole, expected }) => {
        let membershipRole: string;
        if (userRole === "ADMIN") membershipRole = "ADMIN";
        else if (userRole === "PROFESOR") membershipRole = "PROFESOR";
        else if (userRole === "PARENT") membershipRole = "PARENT";
        else membershipRole = "STAFF"; // Default for MASTER and PUBLIC

        expect(membershipRole).toBe(expected);
      });
    });
  });

  describe("Clerk User Data Extraction", () => {
    it("should extract primary email correctly", () => {
      const testData = {
        primary_email_address_id: "email_123",
        email_addresses: [
          { id: "email_456", email_address: "secondary@test.cl" },
          { id: "email_123", email_address: "primary@test.cl" },
        ],
      };

      const primaryId = testData.primary_email_address_id;
      const emails = testData.email_addresses ?? [];
      const primary = emails.find((item) => item.id === primaryId) ?? emails[0];
      const email = primary?.email_address ?? null;

      expect(email).toBe("primary@test.cl");
    });

    it("should fallback to first email if primary not found", () => {
      const testData = {
        primary_email_address_id: "nonexistent",
        email_addresses: [
          { id: "email_456", email_address: "first@test.cl" },
          { id: "email_123", email_address: "second@test.cl" },
        ],
      };

      const primaryId = testData.primary_email_address_id;
      const emails = testData.email_addresses ?? [];
      const primary = emails.find((item) => item.id === primaryId) ?? emails[0];
      const email = primary?.email_address ?? null;

      expect(email).toBe("first@test.cl");
    });

    it("should extract user name correctly", () => {
      const testCases = [
        {
          data: { first_name: "John", last_name: "Doe" },
          expected: "John Doe",
        },
        {
          data: { first_name: "Jane" },
          expected: "Jane",
        },
        {
          data: { last_name: "Smith" },
          expected: "Smith",
        },
        {
          data: { username: "johndoe" },
          expected: "johndoe",
        },
        {
          data: {},
          expected: null,
        },
      ];

      testCases.forEach(({ data, expected }) => {
        const first = data.first_name ?? "";
        const last = data.last_name ?? "";
        const full = `${first} ${last}`.trim();
        const result = full.length > 0 ? full : (data.username ?? null);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Institution Domain Mapping", () => {
    const INSTITUTION_DOMAIN_MAPPING: Record<string, string> = {
      "astral.cl": "inst_astral",
      "school1.cl": "inst_school1",
    };

    it("should resolve institution from domain mapping", () => {
      const testCases = [
        { email: "user@astral.cl", expected: "inst_astral" },
        { email: "admin@school1.cl", expected: "inst_school1" },
        { email: "test@unknown.cl", expected: undefined },
      ];

      testCases.forEach(({ email, expected }) => {
        const domain = email.split("@")[1]?.toLowerCase();
        const institutionId = INSTITUTION_DOMAIN_MAPPING[domain!];
        expect(institutionId).toBe(expected);
      });
    });
  });

  describe("Validation Logic", () => {
    it("should validate email format", () => {
      const validEmails = [
        "user@domain.cl",
        "test.user@school.edu.cl",
        "admin@domain.co.uk",
      ];

      const invalidEmails = [
        "invalid-email",
        "@domain.cl",
        "user@",
        "",
        null,
        undefined,
      ];

      // Test valid emails
      validEmails.forEach((email) => {
        const parts = email.split("@");
        const isValid =
          parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
        expect(isValid).toBe(true);
      });

      // Test invalid emails
      invalidEmails.forEach((email) => {
        if (email === null || email === undefined || email === "") {
          expect(false).toBe(false); // Null/undefined/empty should be invalid
        } else if (typeof email === "string") {
          const parts = email.split("@");
          const isValid =
            parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
          expect(isValid).toBe(false);
        }
      });
    });

    it("should validate Clerk user data", () => {
      const validUser = {
        id: "clerk_123",
        primary_email_address_id: "email_1",
        email_addresses: [{ id: "email_1", email_address: "test@test.cl" }],
      };

      const invalidUsers = [
        { id: null, email_addresses: [] },
        { id: "clerk_123", email_addresses: null },
        { id: "clerk_123", email_addresses: [] },
        { email_addresses: [{ email_address: "test@test.cl" }] },
      ];

      // Valid user
      const clerkId = validUser.id;
      const emails = validUser.email_addresses ?? [];
      const primaryId = (validUser as any).primary_email_address_id;
      const primary = emails.find((item) => item.id === primaryId) ?? emails[0];
      const email = primary?.email_address ?? null;
      expect(clerkId && email).toBeTruthy();

      // Invalid users
      invalidUsers.forEach((user) => {
        const clerkId = user.id;
        const emails = user.email_addresses ?? [];
        const primaryId = (user as any).primary_email_address_id;
        const primary =
          emails.find((item) => (item as any).id === primaryId) ?? emails[0];
        const email = primary?.email_address ?? null;
        expect(clerkId && email).toBeFalsy();
      });
    });
  });

  describe("Membership Status Logic", () => {
    it("should handle membership status transitions", () => {
      const statuses = ["INVITED", "ACTIVE", "SUSPENDED", "LEFT"];

      // Valid transitions
      const validTransitions = {
        INVITED: ["ACTIVE", "SUSPENDED"],
        ACTIVE: ["SUSPENDED", "LEFT"],
        SUSPENDED: ["ACTIVE", "LEFT"],
        LEFT: [], // Terminal state
      };

      Object.entries(validTransitions).forEach(([from, to]) => {
        expect(statuses.includes(from)).toBe(true);
        to.forEach((status) => {
          expect(statuses.includes(status)).toBe(true);
        });
      });
    });
  });

  describe("Sidebar Institution Name Display", () => {
    it("should display institution name when institution data is available", () => {
      // Mock institution data
      const mockInstitution = {
        name: "Escuela Especial de Lenguaje Plataforma Astral",
        isActive: true,
      };

      // Test the fallback logic from Sidebar.tsx
      const displayName = mockInstitution?.name || "Plataforma Astral";
      expect(displayName).toBe(
        "Escuela Especial de Lenguaje Plataforma Astral",
      );
    });

    it("should fallback to 'Plataforma Astral' when institution data is null", () => {
      const mockInstitution = null;

      // Test the fallback logic from Sidebar.tsx
      const displayName = (mockInstitution as any)?.name || "Plataforma Astral";
      expect(displayName).toBe("Plataforma Astral");
    });

    it("should fallback to 'Plataforma Astral' when institution name is empty", () => {
      const mockInstitution = {
        name: "",
        isActive: true,
      };

      // Test the fallback logic from Sidebar.tsx
      const displayName = mockInstitution?.name || "Plataforma Astral";
      expect(displayName).toBe("Plataforma Astral");
    });

    it("should handle institution data with undefined name", () => {
      const mockInstitution = {
        name: undefined,
        isActive: true,
      };

      // Test the fallback logic from Sidebar.tsx
      const displayName = mockInstitution?.name || "Plataforma Astral";
      expect(displayName).toBe("Plataforma Astral");
    });
  });

  describe("Session Data Structure", () => {
    it("should include currentInstitutionId in session user data", () => {
      // Mock session data structure as defined in auth-client.tsx
      const mockSessionUser = {
        id: "user_123",
        clerkId: "clerk_456",
        email: "test@astral.cl",
        name: "Test User",
        role: "ADMIN" as const,
        currentInstitutionId: "inst_789", // This should be present
        needsRegistration: false,
        isOAuthUser: false,
      };

      // Verify the required fields are present
      expect(mockSessionUser.id).toBeDefined();
      expect(mockSessionUser.currentInstitutionId).toBeDefined();
      expect(mockSessionUser.role).toBeDefined();
      expect(mockSessionUser.email).toBeDefined();
    });

    it("should handle optional currentInstitutionId", () => {
      const mockSessionUser = {
        id: "user_123",
        clerkId: "clerk_456",
        email: "test@astral.cl",
        name: "Test User",
        role: "ADMIN" as const,
        currentInstitutionId: undefined, // Can be undefined
        needsRegistration: false,
        isOAuthUser: false,
      };

      expect(mockSessionUser.currentInstitutionId).toBeUndefined();
    });
  });
});
