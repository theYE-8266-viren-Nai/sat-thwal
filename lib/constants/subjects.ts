export const SUBJECTS = [
  "Data Structures",
  "Algorithms",
  "Programming Fundamentals",
  "Database Systems",
  "Web Development",
  "Operating Systems",
  "Calculus",
  "Discrete Mathematics",
  "Statistics",
  "Physics",
  "Engineering Mathematics",
  "Accounting",
  "Microeconomics",
  "English for Academic Purposes",
  "IELTS Prep",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const ACADEMIC_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
] as const;

export const BUDGET_RANGES = [
  { label: "Under 50,000 MMK", min: 0, max: 50000 },
  { label: "50,000 - 100,000 MMK", min: 50000, max: 100000 },
  { label: "100,000 - 150,000 MMK", min: 100000, max: 150000 },
  { label: "150,000 - 250,000 MMK", min: 150000, max: 250000 },
  { label: "250,000+ MMK", min: 250000, max: 500000 },
] as const;
