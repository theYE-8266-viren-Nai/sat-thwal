export interface StudentOffer {
  id: string;
  title: string;
  description: string;
  category: "tutor" | "hostel" | "food" | "transportation";
  badge: string;
}

export const STUDENT_OFFERS: StudentOffer[] = [
  {
    id: "offer-1",
    title: "20% off your first tutoring session",
    description: "New students get a discount on their first booked session with any verified tutor.",
    category: "tutor",
    badge: "New student",
  },
  {
    id: "offer-2",
    title: "Free move-in cleaning at Hledan Golden Hostel",
    description: "Book this month and get a complimentary room cleaning on move-in day.",
    category: "hostel",
    badge: "Limited time",
  },
  {
    id: "offer-3",
    title: "15% off Lucky Seven Tea Shop student meals",
    description: "Show your student ID for a discount on all student meal packages.",
    category: "food",
    badge: "Student discount",
  },
  {
    id: "offer-4",
    title: "First month free seat on the Hledan - UIT Shuttle",
    description: "Sign up for a semester pass and get your first month free.",
    category: "transportation",
    badge: "Promo",
  },
];
