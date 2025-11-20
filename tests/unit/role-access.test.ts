import { describe, it, expect } from "vitest";
import {
  getRoleAccess,
  hasMasterGodModeAccess,
  canMasterOverride,
  canAccessProfesor,
  canAccessAdmin,
  canAccessSection,
  getAccessibleSections,
  getAuthorFilter,
  canEditRecord,
  canDeleteRecord,
  getDefaultRedirectPath,
  getRoleFilter,
  getRoleDisplayName,
} from "../../src/lib/role-utils";

describe("Role Access System", () => {
  describe("Role Access Permissions", () => {
    it("should grant MASTER full access to all sections", () => {
      const access = getRoleAccess("MASTER");

      expect(access.canAccessAdmin).toBe(true);
      expect(access.canAccessProfesor).toBe(true);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it("should grant ADMIN access to admin, profesor, and parent sections", () => {
      const access = getRoleAccess("ADMIN");

      expect(access.canAccessAdmin).toBe(true);
      expect(access.canAccessProfesor).toBe(true);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it("should grant PROFESOR access to profesor and parent sections", () => {
      const access = getRoleAccess("PROFESOR");

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(true);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it("should grant PARENT access to parent section", () => {
      const access = getRoleAccess("PARENT");

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(false);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it("should grant PUBLIC only public access", () => {
      const access = getRoleAccess("PUBLIC");

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(false);
      expect(access.canAccessParent).toBe(false);
      expect(access.canAccessPublic).toBe(true);
    });
  });

  describe("MASTER God Mode Access", () => {
    it("should confirm MASTER has god mode access", () => {
      expect(hasMasterGodModeAccess("MASTER")).toBe(true);
      expect(hasMasterGodModeAccess("ADMIN")).toBe(false);
      expect(hasMasterGodModeAccess("PROFESOR")).toBe(false);
    });

    it("should allow MASTER to override any restriction", () => {
      expect(canMasterOverride("MASTER")).toBe(true);
      expect(canMasterOverride("ADMIN")).toBe(false);
      expect(canMasterOverride("PROFESOR")).toBe(false);
    });
  });

  describe("Section Access Functions", () => {
    it("should check admin access correctly", () => {
      expect(canAccessAdmin("MASTER")).toBe(true);
      expect(canAccessAdmin("ADMIN")).toBe(true);
      expect(canAccessAdmin("PROFESOR")).toBe(false);
    });

    it("should check profesor access correctly", () => {
      expect(canAccessProfesor("MASTER")).toBe(true);
      expect(canAccessProfesor("ADMIN")).toBe(true);
      expect(canAccessProfesor("PROFESOR")).toBe(true);
      expect(canAccessProfesor("PARENT")).toBe(false);
    });

    it("should check section access correctly", () => {
      expect(canAccessSection("MASTER", "admin")).toBe(true);
      expect(canAccessSection("ADMIN", "admin")).toBe(true);
      expect(canAccessSection("PROFESOR", "admin")).toBe(false);
      expect(canAccessSection("PROFESOR", "profesor")).toBe(true);
      expect(canAccessSection("PARENT", "parent")).toBe(true);
      expect(canAccessSection("PUBLIC", "public")).toBe(true);
    });
  });

  describe("Accessible Sections", () => {
    it("should return all sections for MASTER", () => {
      const sections = getAccessibleSections("MASTER");
      expect(sections).toEqual(["admin", "profesor", "parent", "public"]);
    });

    it("should return admin, profesor, and parent sections for ADMIN", () => {
      const sections = getAccessibleSections("ADMIN");
      expect(sections).toEqual(["admin", "profesor", "parent", "public"]);
    });

    it("should return profesor and parent sections for PROFESOR", () => {
      const sections = getAccessibleSections("PROFESOR");
      expect(sections).toEqual(["profesor", "parent", "public"]);
    });

    it("should return parent section for PARENT", () => {
      const sections = getAccessibleSections("PARENT");
      expect(sections).toEqual(["parent", "public"]);
    });
  });

  describe("Record Editing Permissions", () => {
    it("should allow MASTER to edit any record", () => {
      expect(canEditRecord("MASTER", "author-1", "user-1")).toBe(true);
      expect(canEditRecord("MASTER", "author-1", "user-2")).toBe(true);
    });

    it("should allow ADMIN to edit any record in their school", () => {
      expect(canEditRecord("ADMIN", "author-1", "user-1")).toBe(true);
      expect(canEditRecord("ADMIN", "author-1", "user-2")).toBe(true);
    });

    it("should allow PROFESOR to edit only their own records", () => {
      expect(canEditRecord("PROFESOR", "author-1", "author-1")).toBe(true);
      expect(canEditRecord("PROFESOR", "author-1", "author-2")).toBe(false);
    });

    it("should deny PARENT edit permissions", () => {
      expect(canEditRecord("PARENT", "author-1", "author-1")).toBe(false);
      expect(canEditRecord("PARENT", "author-1", "author-2")).toBe(false);
    });
  });

  describe("Record Deletion Permissions", () => {
    it("should allow MASTER to delete any record", () => {
      expect(canDeleteRecord("MASTER", "author-1", "user-1")).toBe(true);
      expect(canDeleteRecord("MASTER", "author-1", "user-2")).toBe(true);
    });

    it("should allow ADMIN to delete any record in their school", () => {
      expect(canDeleteRecord("ADMIN", "author-1", "user-1")).toBe(true);
      expect(canDeleteRecord("ADMIN", "author-1", "user-2")).toBe(true);
    });

    it("should allow PROFESOR to delete only their own records", () => {
      expect(canDeleteRecord("PROFESOR", "author-1", "author-1")).toBe(true);
      expect(canDeleteRecord("PROFESOR", "author-1", "author-2")).toBe(false);
    });

    it("should deny PARENT delete permissions", () => {
      expect(canDeleteRecord("PARENT", "author-1", "author-1")).toBe(false);
      expect(canDeleteRecord("PARENT", "author-1", "author-2")).toBe(false);
    });
  });

  describe("Author Filters", () => {
    it("should return no filters for MASTER", () => {
      const filter = getAuthorFilter("MASTER", "user-1");
      expect(filter).toEqual({});
    });

    it("should return school filter for ADMIN", () => {
      const filter = getAuthorFilter("ADMIN", "user-1");
      expect(filter).toEqual({}); // ADMIN has school-level access
    });

    it("should return ownership filter for PROFESOR", () => {
      const filter = getAuthorFilter("PROFESOR", "user-1");
      expect(filter.OR).toBeDefined();
      expect(filter.OR).toContainEqual({ createdBy: "user-1" });
      expect(filter.OR).toContainEqual({ isPublic: true });
    });

    it("should return public filter for other roles", () => {
      const filter = getAuthorFilter("PARENT", "user-1");
      expect(filter.isPublic).toBe(true);
    });
  });

  describe("Default Redirect Paths", () => {
    it("should redirect MASTER to master page", () => {
      expect(getDefaultRedirectPath("MASTER")).toBe("/master");
    });

    it("should redirect ADMIN to admin page", () => {
      expect(getDefaultRedirectPath("ADMIN")).toBe("/admin");
    });

    it("should redirect PROFESOR to profesor page", () => {
      expect(getDefaultRedirectPath("PROFESOR")).toBe("/profesor");
    });

    it("should redirect PARENT to parent page", () => {
      expect(getDefaultRedirectPath("PARENT")).toBe("/parent");
    });

    it("should redirect PUBLIC to home page", () => {
      expect(getDefaultRedirectPath("PUBLIC")).toBe("/");
    });

    it("should redirect unknown roles to home page", () => {
      expect(getDefaultRedirectPath("UNKNOWN")).toBe("/");
    });
  });

  describe("Role Filters", () => {
    it("should return no filters for MASTER", () => {
      const filter = getRoleFilter("MASTER");
      expect(filter).toEqual({});
    });

    it("should return no filters for ADMIN", () => {
      const filter = getRoleFilter("ADMIN");
      expect(filter).toEqual({});
    });

    it("should return no filters for PROFESOR", () => {
      const filter = getRoleFilter("PROFESOR");
      expect(filter).toEqual({});
    });

    it("should return no filters for other roles", () => {
      const filter = getRoleFilter("PARENT");
      expect(filter).toEqual({});
    });
  });

  describe("Role Display Names", () => {
    it("should display MASTER with god mode indicator", () => {
      expect(getRoleDisplayName("MASTER")).toBe("Master Administrator");
    });

    it("should display ADMIN correctly", () => {
      expect(getRoleDisplayName("ADMIN")).toBe("Administrador");
    });

    it("should display PROFESOR correctly", () => {
      expect(getRoleDisplayName("PROFESOR")).toBe("Profesor");
    });

    it("should display PARENT correctly", () => {
      expect(getRoleDisplayName("PARENT")).toBe("Padre/Apoderado");
    });

    it("should display PUBLIC correctly", () => {
      expect(getRoleDisplayName("PUBLIC")).toBe("Público");
    });

    it("should return role name for unknown roles", () => {
      expect(getRoleDisplayName("UNKNOWN")).toBe("UNKNOWN");
    });
  });
});
