import Link from "next/link";
import type { CategoryConfig } from "@/lib/constants/categories";

export function CategoryCard({ category }: { category: CategoryConfig }) {
  const Icon = category.icon;

  return (
    <Link
      href={category.href}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
      >
        <Icon className="h-6 w-6" style={{ color: category.color }} />
      </div>
      <span className="text-sm font-semibold text-foreground">{category.label}</span>
    </Link>
  );
}
