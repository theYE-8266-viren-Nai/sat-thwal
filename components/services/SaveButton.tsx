"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { saveItem, unsaveItem } from "@/lib/queries/savedItems";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/types/domain";

interface SaveButtonProps {
  profileId: string;
  category: ServiceCategory;
  serviceId: string;
  initialSaved: boolean;
  className?: string;
}

export function SaveButton({ profileId, category, serviceId, initialSaved, className }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const next = !saved;
    setSaved(next);
    setPending(true);
    const supabase = createClient();

    try {
      if (next) {
        await saveItem(supabase, profileId, category, serviceId);
      } else {
        await unsaveItem(supabase, profileId, category, serviceId);
      }
    } catch {
      setSaved(!next);
      toast.error("Couldn't update saved services. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from saved" : "Save"}
      aria-pressed={saved}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white",
        className,
      )}
    >
      <Heart
        className={cn("h-4 w-4", saved ? "fill-brand-orange text-brand-orange" : "text-muted-foreground")}
      />
    </button>
  );
}
