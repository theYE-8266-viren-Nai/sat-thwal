import type { ServiceCardData } from "@/types/domain";

export function buildResultsSummary(results: ServiceCardData[]): string {
  if (results.length === 0) {
    return "No tutor or hostel matches were found for this search.";
  }

  return results
    .map((item, index) => {
      const details = [item.subtitle, item.priceLabel].filter(Boolean).join(", ");
      return `${index + 1}. ${item.title} (${item.category}) - ${details}`;
    })
    .join("\n");
}
