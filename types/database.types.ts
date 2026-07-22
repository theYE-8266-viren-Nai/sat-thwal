export type SessionMode = "online" | "in_person" | "both";
export type GenderPolicy = "male" | "female" | "mixed";
export type ServiceType = "tutor" | "hostel" | "food" | "transportation";
export type RequestStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type UserRole = "student" | "driver" | "admin" | "restaurant";
export type TransportationRegistrationStatus = "pending" | "approved" | "rejected" | "cancelled";

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

type TransportationRegistrationRow = {
  id: string;
  student_id: string;
  route_id: string;
  driver_id: string;
  pickup_stop_id: string;
  pickup_stop_name: string;
  pickup_time: string | null;
  pickup_address: string;
  status: TransportationRegistrationStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
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
  seen_by_student: boolean;
  requester_completed_at: string | null;
  owner_completed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
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
      transportation_routes: {
        Row: TransportationRow;
        Insert: Partial<TransportationRow>;
        Update: Partial<TransportationRow>;
        Relationships: [];
      };
      transportation_registrations: {
        Row: TransportationRegistrationRow;
        Insert: Partial<TransportationRegistrationRow> & {
          student_id: string;
          route_id: string;
          driver_id: string;
          pickup_stop_id: string;
          pickup_stop_name: string;
          pickup_address: string;
        };
        Update: Partial<TransportationRegistrationRow>;
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
      mark_request_responses_seen: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
  };
}
