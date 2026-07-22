import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DriverDashboardErrorProps {
  title?: string;
  error: unknown;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
    return [maybeError.code, maybeError.message, maybeError.details, maybeError.hint]
      .filter(Boolean)
      .join(" - ");
  }
  return "Something went wrong while loading the driver dashboard.";
}

export function DriverDashboardError({
  title = "Could not load driver dashboard",
  error,
}: DriverDashboardErrorProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            If the message includes an RLS recursion code like 42P17, apply migration 0011 in
            Supabase SQL Editor.
          </p>
        </div>
      </div>
    </Card>
  );
}
