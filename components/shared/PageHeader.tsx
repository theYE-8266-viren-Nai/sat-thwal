"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 px-4 pb-2 backdrop-blur md:px-6"
      style={{ paddingTop: "calc(1rem + var(--safe-top))" }}
    >
      <Button
        variant="ghost"
        size="icon-touch"
        className="rounded-full md:hidden"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground md:text-xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
