export type SessionMode = "online" | "in_person" | "both";
export type GenderPolicy = "male" | "female" | "mixed";
export type ServiceType = "tutor" | "hostel" | "food" | "transportation";
export type RequestStatus = "pending" | "confirmed" | "completed" | "cancelled";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  university: string | null;
  academic_year: string | null;
  township: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_subjects: string[];
  language_preference: string;
  notification_opt_in: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

type TutorRow = {
  id: string;
  name: string;
  photo_url: string | null;
  subjects: string[];
  university: string;
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
  university: string;
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
  university: string;
  departure_time: string;
  return_time: string;
  monthly_price: number;
  total_seats: number;
  available_seats: number;
  vehicle_type: string | null;
  verified: boolean;
  created_at: string;
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
    Functions: Record<string, never>;
  };
}
