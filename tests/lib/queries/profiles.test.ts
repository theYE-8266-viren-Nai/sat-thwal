import { describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../../helpers/supabaseMock";
import { getProfile, getProfilesByIds, profileToStudentProfile, updateProfile } from "@/lib/queries/profiles";

const profileRow = {
  id: "profile-1",
  full_name: "Aung Student",
  avatar_url: "avatar.png",
  phone: "091234567",
  academic_year: "Third Year",
  township: "Hlaing",
  budget_min: 50000,
  budget_max: 150000,
  preferred_subjects: ["Algorithms"],
  language_preference: "en",
  notification_opt_in: true,
  onboarding_completed: true,
  student_id_verified: true,
  role: "student",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("lib/queries/profiles", () => {
  it("should fetch one profile by id", async () => {
    const supabase = createSupabaseMock({ profiles: { data: profileRow, error: null } });

    const result = await getProfile(supabase as never, "profile-1");

    expect(result).toEqual(profileRow);
    expect(supabase.calls).toEqual(expect.arrayContaining([
      { table: "profiles", method: "eq", args: ["id", "profile-1"] },
      { table: "profiles", method: "maybeSingle", args: [] },
    ]));
  });

  it("should throw when profile fetch fails", async () => {
    const error = new Error("rls denied");
    const supabase = createSupabaseMock({ profiles: { data: null, error } });

    await expect(getProfile(supabase as never, "profile-1")).rejects.toThrow(error);
  });

  it("should return an empty array without querying when ids are empty", async () => {
    const supabase = createSupabaseMock();

    const result = await getProfilesByIds(supabase as never, []);

    expect(result).toEqual([]);
    expect(supabase.calls).toEqual([]);
  });

  it("should fetch profiles for ids and default null data to empty array", async () => {
    const supabase = createSupabaseMock({ profiles: { data: null, error: null } });

    const result = await getProfilesByIds(supabase as never, ["a", "b"]);

    expect(result).toEqual([]);
    expect(supabase.calls).toContainEqual({ table: "profiles", method: "in", args: ["id", ["a", "b"]] });
  });

  it("should update profile with updated_at timestamp", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-03T04:05:06.000Z"));
    const supabase = createSupabaseMock({ profiles: { data: profileRow, error: null } });

    const result = await updateProfile(supabase as never, "profile-1", { township: "Tamwe" } as never);

    expect(result).toEqual(profileRow);
    expect(supabase.calls).toContainEqual({
      table: "profiles",
      method: "update",
      args: [{ township: "Tamwe", updated_at: "2026-02-03T04:05:06.000Z" }],
    });
    vi.useRealTimers();
  });

  it("should map database profile rows to domain student profiles", () => {
    expect(profileToStudentProfile(profileRow as never)).toEqual({
      id: "profile-1",
      fullName: "Aung Student",
      avatarUrl: "avatar.png",
      phone: "091234567",
      academicYear: "Third Year",
      township: "Hlaing",
      budgetMin: 50000,
      budgetMax: 150000,
      preferredSubjects: ["Algorithms"],
      languagePreference: "en",
      notificationOptIn: true,
      onboardingCompleted: true,
    });
  });
});