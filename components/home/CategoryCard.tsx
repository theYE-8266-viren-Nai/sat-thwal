"use client";

import Link from "next/link";
import { GraduationCap, Home, Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CategoryConfig } from "@/lib/constants/categories";

interface CategoryCardProps {
  category: CategoryConfig;
  existingTutorId: string | null;
  existingHostelId: string | null;
}

interface SheetAction {
  label: string;
  href: string;
  icon: typeof Search;
  className?: string;
}

export function CategoryCard({ category, existingTutorId, existingHostelId }: CategoryCardProps) {
  const Icon = category.icon;
  const actions = getCategoryActions(category, existingTutorId, existingHostelId);

  const cardContent = (
    <>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
      >
        <Icon className="h-6 w-6" style={{ color: category.color }} />
      </div>
      <span className="text-sm font-semibold text-foreground">{category.label}</span>
    </>
  );

  const cardClassName =
    "flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md";

  if (!actions) {
    return (
      <Link href={category.href} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return (
    <Sheet>
      <SheetTrigger className={cardClassName}>{cardContent}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>{category.label}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4 pb-4">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={action.href}
                asChild
                size="touch"
                variant={action.className ? "default" : "outline"}
                className={action.className ?? "justify-start rounded-xl"}
              >
                <Link href={action.href}>
                  <ActionIcon className="h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getCategoryActions(
  category: CategoryConfig,
  existingTutorId: string | null,
  existingHostelId: string | null,
): SheetAction[] | null {
  if (category.category === "tutor") {
    return [
      { label: "Find Tutors", href: "/tutors", icon: Search },
      ...(existingTutorId
        ? [
            { label: "Requests", href: "/tutors/requests", icon: Inbox },
            {
              label: "My Tutor Profile",
              href: `/services/tutor/${existingTutorId}`,
              icon: GraduationCap,
              className: "justify-start rounded-xl bg-category-tutor text-white hover:bg-category-tutor/90",
            },
          ]
        : [
            {
              label: "Become a Tutor",
              href: "/tutors/apply",
              icon: GraduationCap,
              className: "justify-start rounded-xl bg-category-tutor text-white hover:bg-category-tutor/90",
            },
          ]),
    ];
  }

  if (category.category === "hostel") {
    return [
      { label: "Find Hostels", href: "/hostels", icon: Search },
      ...(existingHostelId
        ? [
            { label: "Requests", href: "/hostels/requests", icon: Inbox },
            {
              label: "My Room Listing",
              href: `/services/hostel/${existingHostelId}`,
              icon: Home,
              className: "justify-start rounded-xl bg-category-hostel text-white hover:bg-category-hostel/90",
            },
          ]
        : [
            {
              label: "List Your Room",
              href: "/hostels/list",
              icon: Home,
              className: "justify-start rounded-xl bg-category-hostel text-white hover:bg-category-hostel/90",
            },
          ]),
    ];
  }

  return null;
}
