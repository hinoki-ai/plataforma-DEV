import { describe, expect, it } from "vitest";

import { USER_ROLES, USER_ROLE_LIST } from "@/lib/constants";
import { normalizeRole } from "@/lib/user-creation";
import type { ExtendedUserRole } from "@/lib/authorization";

describe("USER_ROLES constants", () => {
  const expectedRoles: ExtendedUserRole[] = [
    "MASTER",
    "ADMIN",
    "PROFESOR",
    "PARENT",
    "PUBLIC",
  ];

  it("maps each role key to its normalized uppercase value", () => {
    expectedRoles.forEach((role) => {
      expect(USER_ROLES[role]).toBe(role);
    });
  });

  it("exposes a list with all unique roles", () => {
    expect(USER_ROLE_LIST).toHaveLength(expectedRoles.length);
    expect(new Set(USER_ROLE_LIST)).toEqual(new Set(expectedRoles));
  });
});

describe("normalizeRole", () => {
  it("accepts already normalized roles", () => {
    expect(normalizeRole("MASTER")).toBe("MASTER");
    expect(normalizeRole("ADMIN")).toBe("ADMIN");
  });

  it("normalizes lowercase role inputs", () => {
    expect(normalizeRole("parent")).toBe("PARENT");
    expect(normalizeRole("profesor")).toBe("PROFESOR");
  });

  it("throws for unknown roles", () => {
    expect(() => normalizeRole("unknown")).toThrow(/Invalid role/i);
  });
});
