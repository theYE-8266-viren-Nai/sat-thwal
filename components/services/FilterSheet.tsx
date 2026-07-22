"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FilterFieldConfig, FilterState, FilterValue } from "@/types/domain";

interface FilterSheetProps {
  fields: FilterFieldConfig[];
  value: FilterState;
  onChange: (value: FilterState) => void;
  formatRangeValue?: (n: number) => string;
}

export function FilterSheet({ fields, value, onChange, formatRangeValue }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(value).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "" && v !== false,
  ).length;

  function set(key: string, next: FilterValue) {
    onChange({ ...value, [key]: next });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge className="rounded-full bg-brand-indigo px-1.5 py-0 text-xs text-white">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label>{field.label}</Label>

              {field.type === "select" && (
                <Select
                  value={(value[field.key] as string) ?? ""}
                  onValueChange={(v) => set(field.key, v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Any ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "multiselect" && (
                <div className="flex flex-wrap gap-2">
                  {field.options?.map((opt) => {
                    const current = (value[field.key] as string[]) ?? [];
                    const selected = current.includes(opt.value);
                    return (
                      <Badge
                        key={opt.value}
                        onClick={() =>
                          set(
                            field.key,
                            selected
                              ? current.filter((v) => v !== opt.value)
                              : [...current, opt.value],
                          )
                        }
                        variant={selected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer select-none rounded-full px-3 py-1.5 text-sm",
                          selected && "bg-brand-indigo text-white hover:bg-brand-indigo-dark",
                        )}
                      >
                        {opt.label}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {field.type === "toggle" && (
                <Switch
                  checked={Boolean(value[field.key])}
                  onCheckedChange={(checked) => set(field.key, checked)}
                />
              )}

              {field.type === "range" && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const [lo, hi] = (value[field.key] as [number, number]) ?? [
                        field.min ?? 0,
                        field.max ?? 100,
                      ];
                      const fmt = formatRangeValue ?? ((n: number) => `${n}`);
                      return `${fmt(lo)} - ${fmt(hi)}`;
                    })()}
                  </div>
                  <Slider
                    value={(value[field.key] as [number, number]) ?? [field.min ?? 0, field.max ?? 100]}
                    min={field.min ?? 0}
                    max={field.max ?? 100}
                    step={field.step ?? 1}
                    onValueChange={(next) => set(field.key, [next[0], next[1]])}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" size="touch" className="flex-1 rounded-xl" onClick={() => onChange({})}>
            Clear all
          </Button>
          <Button
            size="touch"
            className="flex-1 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
            onClick={() => setOpen(false)}
          >
            Show results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
