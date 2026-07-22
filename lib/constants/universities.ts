export const UNIVERSITIES = [
  "University of Information Technology",
  "University of Computer Studies, Yangon",
  "Yangon Technological University",
  "University of Yangon",
  "Yangon University of Economics",
] as const;

export type University = (typeof UNIVERSITIES)[number];

export const UNIVERSITY_SHORT_NAMES: Record<University, string> = {
  "University of Information Technology": "UIT",
  "University of Computer Studies, Yangon": "UCSY",
  "Yangon Technological University": "YTU",
  "University of Yangon": "UY",
  "Yangon University of Economics": "YUE",
};
