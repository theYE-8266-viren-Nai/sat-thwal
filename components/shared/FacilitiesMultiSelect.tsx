"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HOSTEL_FACILITIES } from "@/lib/constants/facilities";

interface FacilitiesMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function FacilitiesMultiSelect({ value, onChange }: FacilitiesMultiSelectProps) {
  function toggle(facility: string) {
    if (value.includes(facility)) {
      onChange(value.filter((f) => f !== facility));
    } else {
      onChange([...value, facility]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label>Facilities</Label>
      <div className="flex flex-wrap gap-2">
        {HOSTEL_FACILITIES.map((facility) => {
          const selected = value.includes(facility);
          return (
            <Badge
              key={facility}
              onClick={() => toggle(facility)}
              variant={selected ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-brand-indigo text-white hover:bg-brand-indigo-dark"
                  : "hover:bg-secondary",
              )}
            >
              {facility}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
