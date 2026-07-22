"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/lib/constants/subjects";

interface SubjectMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SubjectMultiSelect({ value, onChange }: SubjectMultiSelectProps) {
  function toggle(subject: string) {
    if (value.includes(subject)) {
      onChange(value.filter((s) => s !== subject));
    } else {
      onChange([...value, subject]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label>Preferred subjects</Label>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((subject) => {
          const selected = value.includes(subject);
          return (
            <Badge
              key={subject}
              onClick={() => toggle(subject)}
              variant={selected ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-brand-indigo text-white hover:bg-brand-indigo-dark"
                  : "hover:bg-secondary",
              )}
            >
              {subject}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
