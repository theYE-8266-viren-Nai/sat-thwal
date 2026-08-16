import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabaseMock";
import { getAcademicSupportRelationships, getHousingRelationships } from "@/lib/serviceFlowData";

const baseRequest = {
  id: "request-1",
  profile_id: "profile-1",
  service_type: "tutor",
  service_id: "tutor-2",
  status: "confirmed",
  note: null,
  pickup_stop_id: null,
  pickup_stop_name: null,
  pickup_time: null,
  pickup_address: null,
  rejection_reason: null,
  seen_by_student: true,
  requester_completed_at: null,
  owner_completed_at: null,
  completed_at: null,
  student_disputed_at: null,
  student_dispute_reason: null,
  resolved_by_admin_id: null,
  admin_resolution_note: null,
  auto_resolve_at: null,
  resolution_source: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const tutor = {
  id: "tutor-2",
  name: "Tutor Two",
  photo_url: null,
  subjects: ["Algorithms"],
  township: "Hlaing",
  bio: null,
  rating: 4.8,
  review_count: 12,
  price_per_session: 9000,
  session_mode: "both",
  availability_note: null,
  verified: true,
  created_at: "2026-01-01T00:00:00.000Z",
  owner_profile_id: "profile-2",
};

const ownedTutor = {
  ...tutor,
  id: "owned-tutor",
  name: "Owned Tutor",
  owner_profile_id: "profile-1",
};

const hostel = {
  id: "hostel-2",
  name: "Hostel Two",
  image_url: null,
  township: "Hlaing",
  distance_km: 1.2,
  monthly_rent: 120000,
  gender_policy: "mixed",
  room_type: "Shared room",
  facilities: ["Wi-Fi"],
  available_rooms: 2,
  meals_included: true,
  description: null,
  verified: true,
  created_at: "2026-01-01T00:00:00.000Z",
  owner_profile_id: "profile-2",
};

const ownedHostel = {
  ...hostel,
  id: "owned-hostel",
  name: "Owned Hostel",
  owner_profile_id: "profile-1",
};
const student = {
  id: "student-1",
  full_name: "Student One",
  avatar_url: null,
  phone: null,
  academic_year: "Second year",
  township: "Hledan",
  budget_min: null,
  budget_max: null,
  preferred_subjects: [],
  language_preference: "en",
  notification_opt_in: true,
  onboarding_completed: true,
  student_id_verified: true,
  student_id_verified_at: null,
  student_id_image_path: null,
  role: "student",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("getAcademicSupportRelationships", () => {
  it("should return confirmed tutors and accepted students for a tutor account", async () => {
    const outgoing = { ...baseRequest, id: "outgoing", profile_id: "profile-1", service_id: "tutor-2" };
    const pending = { ...baseRequest, id: "pending", profile_id: "profile-1", service_id: "tutor-3", status: "pending" };
    const incoming = { ...baseRequest, id: "incoming", profile_id: "student-1", service_id: "owned-tutor", status: "completed" };
    const supabase = createSupabaseMock({
      requests: [
        { data: [outgoing, pending], error: null },
        { data: [incoming], error: null },
      ],
      tutors: [
        { data: ownedTutor, error: null },
        { data: [tutor], error: null },
      ],
      profiles: { data: [student], error: null },
    });

    const result = await getAcademicSupportRelationships(supabase as never, "profile-1");

    expect(result.myTutors).toHaveLength(1);
    expect(result.myTutors[0].request.id).toBe("outgoing");
    expect(result.myTutors[0].tutor.id).toBe("tutor-2");
    expect(result.myStudents).toHaveLength(1);
    expect(result.myStudents[0].request.id).toBe("incoming");
    expect(result.myStudents[0].student.id).toBe("student-1");
  });

  it("should return empty lists when there are no accepted tutor relationships", async () => {
    const supabase = createSupabaseMock({
      requests: { data: [{ ...baseRequest, status: "pending" }], error: null },
      tutors: { data: null, error: null },
    });

    const result = await getAcademicSupportRelationships(supabase as never, "profile-1");

    expect(result).toEqual({ myTutors: [], myStudents: [] });
  });
});
describe("getHousingRelationships", () => {
  it("should return confirmed hostels and accepted residents for a hostel owner", async () => {
    const outgoing = {
      ...baseRequest,
      id: "hostel-outgoing",
      profile_id: "profile-1",
      service_type: "hostel",
      service_id: "hostel-2",
    };
    const cancelled = {
      ...baseRequest,
      id: "hostel-cancelled",
      profile_id: "profile-1",
      service_type: "hostel",
      service_id: "hostel-3",
      status: "cancelled",
    };
    const incoming = {
      ...baseRequest,
      id: "resident-incoming",
      profile_id: "student-1",
      service_type: "hostel",
      service_id: "owned-hostel",
      status: "completed",
    };
    const supabase = createSupabaseMock({
      requests: [
        { data: [outgoing, cancelled], error: null },
        { data: [incoming], error: null },
      ],
      hostels: [
        { data: ownedHostel, error: null },
        { data: [hostel], error: null },
      ],
      profiles: { data: [student], error: null },
    });

    const result = await getHousingRelationships(supabase as never, "profile-1");

    expect(result.myHostels).toHaveLength(1);
    expect(result.myHostels[0].request.id).toBe("hostel-outgoing");
    expect(result.myHostels[0].hostel.id).toBe("hostel-2");
    expect(result.myResidents).toHaveLength(1);
    expect(result.myResidents[0].request.id).toBe("resident-incoming");
    expect(result.myResidents[0].resident.id).toBe("student-1");
  });

  it("should return empty lists when there are no accepted hostel relationships", async () => {
    const supabase = createSupabaseMock({
      requests: { data: [{ ...baseRequest, service_type: "hostel", status: "pending" }], error: null },
      hostels: { data: null, error: null },
    });

    const result = await getHousingRelationships(supabase as never, "profile-1");

    expect(result).toEqual({ myHostels: [], myResidents: [] });
  });
});