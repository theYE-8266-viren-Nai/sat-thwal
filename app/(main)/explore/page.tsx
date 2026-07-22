import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { CATEGORY_LIST } from "@/lib/constants/categories";

export default async function ExplorePage() {
  const supabase = await createClient();
  const [tutors, hostels, meals, routes] = await Promise.all([
    supabase.from("tutors").select("id", { count: "exact", head: true }),
    supabase.from("hostels").select("id", { count: "exact", head: true }),
    supabase.from("meals").select("id", { count: "exact", head: true }),
    supabase.from("transportation_routes").select("id", { count: "exact", head: true }),
  ]);

  const counts: Record<string, number> = {
    tutor: tutors.count ?? 0,
    hostel: hostels.count ?? 0,
    food: meals.count ?? 0,
    transportation: routes.count ?? 0,
  };

  return (
    <div>
      <PageHeader title="Explore" subtitle="Browse everything students need, by category" />
      <div className="grid grid-cols-1 gap-4 px-5 pt-2 sm:grid-cols-2 md:px-8">
        {CATEGORY_LIST.map((category) => (
          <Link
            key={category.category}
            href={category.href}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
            >
              <category.icon className="h-7 w-7" style={{ color: category.color }} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{category.label}</h2>
              <p className="text-sm text-muted-foreground">
                {counts[category.category]} {category.singularLabel.toLowerCase()}
                {counts[category.category] === 1 ? "" : "s"} available
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
