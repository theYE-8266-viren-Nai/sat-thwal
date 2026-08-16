import { describe, expect, it } from "vitest";
import { getRoleLandingPath, isAdminRole, isDriverRole, isRestaurantRole } from "@/lib/auth/roles";

describe("lib/auth/roles", () => {
  it.each([
    ["driver", "/driver/dashboard"],
    ["admin", "/admin/dashboard"],
    ["restaurant", "/restaurant/dashboard"],
    ["student", "/home"],
    [null, "/home"],
    [undefined, "/home"],
  ] as const)("should route %s users to %s", (role, path) => {
    expect(getRoleLandingPath(role)).toBe(path);
  });

  it("should identify privileged roles exactly", () => {
    expect(isDriverRole("driver")).toBe(true);
    expect(isDriverRole("admin")).toBe(false);
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole(null)).toBe(false);
    expect(isRestaurantRole("restaurant")).toBe(true);
    expect(isRestaurantRole(undefined)).toBe(false);
  });
});