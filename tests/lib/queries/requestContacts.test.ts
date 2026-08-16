import { describe, expect, it } from "vitest";
import { getAcceptedRequestContact } from "@/lib/queries/requestContacts";
import { createSupabaseMock } from "../../helpers/supabaseMock";

describe("lib/queries/requestContacts", () => {
  it("should return normalized contact details for an accepted tutor request", async () => {
    const supabase = createSupabaseMock({
      "rpc:get_accepted_request_contact": {
        data: [
          {
            request_id: "request-1",
            service_type: "tutor",
            request_status: "confirmed",
            request_note: "Need help with DBMS",
            requested_at: "2026-08-16T01:00:00.000Z",
            contact_profile_id: "profile-tutor",
            contact_role: "tutor",
            full_name: "Daw Hnin",
            avatar_url: "avatar.png",
            phone: "09123456789",
            township: "Hlaing",
            academic_year: "Fourth year",
            preferred_subjects: ["Database Systems"],
            language_preference: "en",
          },
        ],
        error: null,
      },
    });

    const contact = await getAcceptedRequestContact(supabase as never, "request-1");

    expect(contact).toEqual({
      requestId: "request-1",
      serviceType: "tutor",
      requestStatus: "confirmed",
      requestNote: "Need help with DBMS",
      requestedAt: "2026-08-16T01:00:00.000Z",
      contactProfileId: "profile-tutor",
      contactRole: "tutor",
      fullName: "Daw Hnin",
      avatarUrl: "avatar.png",
      phone: "09123456789",
      township: "Hlaing",
      academicYear: "Fourth year",
      preferredSubjects: ["Database Systems"],
      languagePreference: "en",
    });
    expect(supabase.calls).toContainEqual({
      method: "rpc",
      args: ["get_accepted_request_contact", { p_request_id: "request-1" }],
    });
  });

  it("should return normalized contact details for a completed hostel request", async () => {
    const supabase = createSupabaseMock({
      "rpc:get_accepted_request_contact": {
        data: [
          {
            request_id: "request-2",
            service_type: "hostel",
            request_status: "completed",
            request_note: null,
            requested_at: "2026-08-16T02:00:00.000Z",
            contact_profile_id: "profile-student",
            contact_role: "student",
            full_name: "Mg Min",
            avatar_url: null,
            phone: null,
            township: "Kamayut",
            academic_year: "Second year",
            preferred_subjects: null,
            language_preference: "my",
          },
        ],
        error: null,
      },
    });

    const contact = await getAcceptedRequestContact(supabase as never, "request-2");

    expect(contact?.serviceType).toBe("hostel");
    expect(contact?.requestStatus).toBe("completed");
    expect(contact?.contactRole).toBe("student");
    expect(contact?.preferredSubjects).toEqual([]);
  });

  it("should return null when the RPC returns no visible contact", async () => {
    const supabase = createSupabaseMock({
      "rpc:get_accepted_request_contact": { data: [], error: null },
    });

    await expect(getAcceptedRequestContact(supabase as never, "request-3")).resolves.toBeNull();
  });

  it("should throw when the contact RPC fails", async () => {
    const error = new Error("Not allowed");
    const supabase = createSupabaseMock({
      "rpc:get_accepted_request_contact": { data: null, error },
    });

    await expect(getAcceptedRequestContact(supabase as never, "request-4")).rejects.toThrow("Not allowed");
  });

  it("should skip Supabase when request id is empty", async () => {
    const supabase = createSupabaseMock();

    await expect(getAcceptedRequestContact(supabase as never, "")).resolves.toBeNull();
    expect(supabase.calls).toEqual([]);
  });
});
