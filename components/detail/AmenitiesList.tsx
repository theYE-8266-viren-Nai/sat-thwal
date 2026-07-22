import { Check } from "lucide-react";

export function AmenitiesList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-5 py-4 md:px-8">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            <Check className="h-3 w-3" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
