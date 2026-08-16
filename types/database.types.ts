export type SessionMode = "online" | "in_person" | "both";
export type GenderPolicy = "male" | "female" | "mixed";
export type ServiceType = "tutor" | "hostel" | "food" | "transportation";
export type RequestStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type RequestResolutionSource = "student_confirmed" | "auto_resolved" | "admin_resolved";
export type UserRole = "student" | "driver" | "admin" | "restaurant";
export type FoodPackageType =
  | "breakfast_lunch_dinner"
  | "breakfast_lunch"
  | "breakfast_dinner"
  | "lunch_dinner";
export type ProviderType = "tutor" | "hostel" | "restaurant" | "transportation";
export type ProviderRegistrationStatus =
  | "pending_payment"
  | "payment_review"
  | "active"
  | "suspended";
export type ProviderPaymentStatus = "submitted" | "paid" | "rejected" | "waived";
export type ProviderPaymentMethod = "kbzpay" | "wavepay" | "bank_transfer" | "other";
export type AdminAuditEntityType = "request" | "provider_registration";
export type AdminAuditEventType =
  | "request_created"
  | "request_confirmed"
  | "request_cancelled"
  | "request_owner_completed"
  | "request_student_completed"
  | "request_completed"
  | "provider_payment_submitted"
  | "provider_approved"
  | "provider_rejected";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  academic_year: string | null;
  township: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_subjects: string[];
  language_preference: string;
  notification_opt_in: boolean;
  onboarding_completed: boolean;
  student_id_verified: boolean;
  student_id_verified_at: string | null;
  student_id_image_path: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

type TutorRow = {
  id: string;
  name: string;
  photo_url: string | null;
  subjects: string[];
  township: string;
  bio: string | null;
  rating: number;
  review_count: number;
  price_per_session: number;
  session_mode: SessionMode;
  availability_note: string | null;
  verified: boolean;
  created_at: string;
  owner_profile_id: string | null;
}

type HostelRow = {
  id: string;
  name: string;
  image_url: string | null;
  township: string;
  distance_km: number;
  monthly_rent: number;
  gender_policy: GenderPolicy;
  room_type: string;
  facilities: string[];
  available_rooms: number;
  meals_included: boolean;
  description: string | null;
  verified: boolean;
  created_at: string;
  owner_profile_id: string | null;
}

type RestaurantRow = {
  id: string;
  name: string;
  image_url: string | null;
  township: string;
  distance_km: number;
  rating: number;
  delivery: boolean;
  pickup: boolean;
  vegetarian_options: boolean;
  halal: boolean;
  opening_hours: string | null;
  student_discount_percent: number | null;
  verified: boolean;
  created_at: string;
  owner_profile_id: string | null;
}

type MealRow = {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_student_package: boolean;
  created_at: string;
}

type FoodPackageRow = {
  id: string;
  restaurant_id: string;
  package_type: FoodPackageType;
  name: string;
  monthly_price: number;
  max_subscribers: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

type TransportationRow = {
  id: string;
  driver_name: string;
  route_name: string;
  pickup_township: string;
  route_stops: string[];
  route_pickup_times: string[];
  departure_time: string;
  return_time: string;
  monthly_price: number;
  total_seats: number;
  available_seats: number;
  vehicle_type: string | null;
  vehicle_number: string | null;
  driver_id: string | null;
  verified: boolean;
  created_at: string;
}

type NotificationRow = {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  route_id: string | null;
  registration_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

type DriverProfileRow = {
  id: string;
  provider_name: string;
  service_phone: string | null;
  township: string | null;
  vehicle_types: string[];
  license_number: string | null;
  vehicle_number: string | null;
  notes: string | null;
  status: "pending" | "active" | "suspended";
  created_at: string;
  updated_at: string;
}

type SavedItemRow = {
  id: string;
  profile_id: string;
  service_type: ServiceType;
  service_id: string;
  created_at: string;
}

type RequestRow = {
  id: string;
  profile_id: string;
  service_type: ServiceType;
  service_id: string;
  status: RequestStatus;
  note: string | null;
  pickup_stop_id: string | null;
  pickup_stop_name: string | null;
  pickup_time: string | null;
  pickup_address: string | null;
  rejection_reason: string | null;
  seen_by_student: boolean;
  requester_completed_at: string | null;
  owner_completed_at: string | null;
  completed_at: string | null;
  student_disputed_at: string | null;
  student_dispute_reason: string | null;
  resolved_by_admin_id: string | null;
  admin_resolution_note: string | null;
  auto_resolve_at: string | null;
  resolution_source: RequestResolutionSource | null;
  seen_by_owner: boolean;
  created_at: string;
  updated_at: string;
}

type ProviderFeeScheduleRow = {
  provider_type: ProviderType;
  amount_mmk: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

type ProviderRegistrationRow = {
  id: string;
  profile_id: string;
  provider_type: ProviderType;
  fee_amount_mmk: number;
  status: ProviderRegistrationStatus;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

type ProviderPaymentSubmissionRow = {
  id: string;
  registration_id: string;
  amount_mmk: number;
  payment_method: ProviderPaymentMethod;
  transaction_reference: string;
  status: ProviderPaymentStatus;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

type AdminAuditEventRow = {
  id: string;
  entity_type: AdminAuditEntityType;
  entity_id: string;
  event_type: AdminAuditEventType;
  actor_profile_id: string | null;
  actor_role: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type AcceptedRequestContactRow = {
  request_id: string;
  service_type: "tutor" | "hostel";
  request_status: Extract<RequestStatus, "confirmed" | "completed">;
  request_note: string | null;
  requested_at: string;
  contact_profile_id: string;
  contact_role: "student" | "tutor" | "hostel_owner";
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  township: string | null;
  academic_year: string | null;
  preferred_subjects: string[] | null;
  language_preference: string | null;
}
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      tutors: {
        Row: TutorRow;
        Insert: Partial<TutorRow>;
        Update: Partial<TutorRow>;
        Relationships: [];
      };
      hostels: {
        Row: HostelRow;
        Insert: Partial<HostelRow>;
        Update: Partial<HostelRow>;
        Relationships: [];
      };
      restaurants: {
        Row: RestaurantRow;
        Insert: Partial<RestaurantRow>;
        Update: Partial<RestaurantRow>;
        Relationships: [];
      };
      meals: {
        Row: MealRow;
        Insert: Partial<MealRow>;
        Update: Partial<MealRow>;
        Relationships: [];
      };
      food_packages: {
        Row: FoodPackageRow;
        Insert: Partial<FoodPackageRow> & {
          restaurant_id: string;
          package_type: FoodPackageType;
          name: string;
          monthly_price: number;
          max_subscribers: number;
        };
        Update: Partial<FoodPackageRow>;
        Relationships: [];
      };
      transportation_routes: {
        Row: TransportationRow;
        Insert: Partial<TransportationRow>;
        Update: Partial<TransportationRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Partial<NotificationRow> & {
          recipient_id: string;
          title: string;
          message: string;
        };
        Update: Partial<NotificationRow>;
        Relationships: [];
      };
      driver_profiles: {
        Row: DriverProfileRow;
        Insert: Partial<DriverProfileRow> & {
          id: string;
          provider_name: string;
        };
        Update: Partial<DriverProfileRow>;
        Relationships: [];
      };
      saved_items: {
        Row: SavedItemRow;
        Insert: Partial<SavedItemRow> & {
          profile_id: string;
          service_type: ServiceType;
          service_id: string;
        };
        Update: Partial<SavedItemRow>;
        Relationships: [];
      };
      requests: {
        Row: RequestRow;
        Insert: Partial<RequestRow> & {
          profile_id: string;
          service_type: ServiceType;
          service_id: string;
        };
        Update: Partial<RequestRow>;
        Relationships: [];
      };
      provider_fee_schedule: {
        Row: ProviderFeeScheduleRow;
        Insert: Partial<ProviderFeeScheduleRow> & {
          provider_type: ProviderType;
          amount_mmk: number;
        };
        Update: Partial<ProviderFeeScheduleRow>;
        Relationships: [];
      };
      provider_registrations: {
        Row: ProviderRegistrationRow;
        Insert: Partial<ProviderRegistrationRow> & {
          profile_id: string;
          provider_type: ProviderType;
          fee_amount_mmk: number;
        };
        Update: Partial<ProviderRegistrationRow>;
        Relationships: [];
      };
      provider_payment_submissions: {
        Row: ProviderPaymentSubmissionRow;
        Insert: Partial<ProviderPaymentSubmissionRow> & {
          registration_id: string;
          amount_mmk: number;
          payment_method: ProviderPaymentMethod;
          transaction_reference: string;
        };
        Update: Partial<ProviderPaymentSubmissionRow>;
        Relationships: [];
      };
      admin_audit_events: {
        Row: AdminAuditEventRow;
        Insert: Partial<AdminAuditEventRow> & {
          entity_type: AdminAuditEntityType;
          entity_id: string;
          event_type: AdminAuditEventType;
          summary: string;
        };
        Update: Partial<AdminAuditEventRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      mark_request_completed_by_owner: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      mark_request_completed_by_requester: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      mark_request_provided: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      confirm_request_received: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      dispute_request: {
        Args: { p_request_id: string; p_reason: string };
        Returns: RequestRow;
      };
      admin_resolve_request: {
        Args: { p_request_id: string; p_note?: string | null };
        Returns: RequestRow;
      };
      admin_cancel_request: {
        Args: { p_request_id: string; p_note?: string | null };
        Returns: RequestRow;
      };
      resolve_due_requests: {
        Args: Record<string, never>;
        Returns: RequestRow[];
      };
      mark_request_responses_seen: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_owner_unseen_resolutions: {
        Args: Record<string, never>;
        Returns: RequestRow[];
      };
      mark_owner_resolutions_seen: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      confirm_transportation_request: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      confirm_food_package_request: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      confirm_hostel_request: {
        Args: { p_request_id: string };
        Returns: RequestRow;
      };
      get_accepted_request_contact: {
        Args: { p_request_id: string };
        Returns: AcceptedRequestContactRow[];
      };
      submit_provider_registration_payment: {
        Args: {
          p_registration_id: string;
          p_payment_method: ProviderPaymentMethod;
          p_transaction_reference: string;
        };
        Returns: ProviderPaymentSubmissionRow;
      };
      review_provider_registration_payment: {
        Args: {
          p_payment_id: string;
          p_approve: boolean;
          p_rejection_reason?: string | null;
        };
        Returns: ProviderPaymentSubmissionRow;
      };
    };
  };
}
