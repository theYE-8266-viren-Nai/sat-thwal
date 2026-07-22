import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AmenitiesList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-5 py-4 md:px-8">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="h-auto gap-1 px-3 py-1 font-medium">
            <Check className="h-3 w-3" />
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
