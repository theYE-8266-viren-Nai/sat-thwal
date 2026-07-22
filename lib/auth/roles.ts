import type { UserRole } from "@/types/database.types";

export function getRoleLandingPath(role: UserRole | null | undefined) {
  if (role === "driver") return "/driver/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/home";
}

export function isDriverRole(role: UserRole | null | undefined) {
  return role === "driver";
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "admin";
}
