"use client";

import { CATEGORY_LIST } from "@/lib/constants/categories";
import { CategoryCard } from "@/components/home/CategoryCard";

interface CategoryCardGridProps {
  existingTutorId: string | null;
  existingHostelId: string | null;
}

export function CategoryCardGrid({ existingTutorId, existingHostelId }: CategoryCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 pt-5 md:grid-cols-4 md:px-8">
      {CATEGORY_LIST.map((category) => (
        <CategoryCard
          key={category.category}
          category={category}
          existingTutorId={existingTutorId}
          existingHostelId={existingHostelId}
        />
      ))}
    </div>
  );
}
