export const TOWNSHIPS = [
  "Hledan",
  "Kamayut",
  "Insein",
  "Hlaing",
  "South Okkalapa",
  "North Okkalapa",
  "Tamwe",
] as const;

export type Township = (typeof TOWNSHIPS)[number];
