import type { ServiceCardData } from "@/types/domain";

const CATEGORY_LABEL: Record<string, string> = {
  tutor: "tutor",
  hostel: "hostel",
  food: "meal plan",
  transportation: "ride",
};

function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? "option";
}

/**
 * Builds a short, natural spoken summary for the voice assistant. Instead of
 * reading every result like a list, it highlights the single best match and
 * mentions how many other options are available so it feels conversational.
 */
export function buildResultsSummary(results: ServiceCardData[]): string {
  if (results.length === 0) {
    return "I couldn't find any matches for this search. Try adjusting what you're looking for.";
  }

  const [top] = results;
  const label = categoryLabel(top.category);

  const details: string[] = [];
  if (top.subtitle) details.push(top.subtitle);
  if (top.priceLabel) details.push(top.priceLabel);
  if (typeof top.rating === "number") details.push(`rated ${top.rating.toFixed(1)}`);

  const detailText = details.length > 0 ? ` — ${details.join(", ")}` : "";
  let summary = `Your top match is ${top.title}, a ${label}${detailText}.`;

  const others = results.length - 1;
  if (others === 1) {
    summary += " I also found one other option you can scroll through below.";
  } else if (others > 1) {
    summary += ` I also found ${others} other options you can scroll through below.`;
  }

  return summary;
}
