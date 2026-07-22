"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatMMK } from "@/lib/utils";

interface BudgetRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function BudgetRangeSlider({
  value,
  onChange,
  min = 0,
  max = 300000,
  step = 5000,
}: BudgetRangeSliderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Monthly budget</Label>
        <span className="text-sm font-medium text-brand-indigo">
          {formatMMK(value[0])} - {formatMMK(value[1])}
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange([next[0], next[1]] as [number, number])}
      />
    </div>
  );
}
