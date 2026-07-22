"use client";

import { Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/services/SaveButton";
import { ConfirmationModal } from "@/components/detail/ConfirmationModal";
import { CATEGORIES } from "@/lib/constants/categories";
import type { ServiceCategory } from "@/types/domain";

const PRIMARY_ACTION: Record<ServiceCategory, "book" | "request" | "requestSeat"> = {
  tutor: "request",
  hostel: "request",
  food: "book",
  transportation: "requestSeat",
};

interface DetailActionBarProps {
  category: ServiceCategory;
  serviceId: string;
  profileId: string;
  title: string;
  contactInfo: string;
  initialSaved: boolean;
}

export function DetailActionBar({
  category,
  serviceId,
  profileId,
  title,
  contactInfo,
  initialSaved,
}: DetailActionBarProps) {
  const categoryConfig = CATEGORIES[category];

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the native share sheet
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  return (
    <div className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-border bg-card px-5 py-3 md:px-8">
      <SaveButton
        profileId={profileId}
        category={category}
        serviceId={serviceId}
        initialSaved={initialSaved}
        className="static shadow-none"
      />
      <Button variant="outline" size="icon" className="rounded-full" onClick={handleShare} aria-label="Share">
        <Share2 className="h-4 w-4" />
      </Button>
      <ConfirmationModal
        action="contact"
        category={category}
        serviceId={serviceId}
        profileId={profileId}
        title={title}
        contactInfo={contactInfo}
        trigger={
          <Button variant="outline" className="gap-2 rounded-full" aria-label="Contact provider">
            <MessageCircle className="h-4 w-4" />
            Contact
          </Button>
        }
      />
      <ConfirmationModal
        action={PRIMARY_ACTION[category]}
        category={category}
        serviceId={serviceId}
        profileId={profileId}
        title={title}
        trigger={
          <Button
            className="flex-1 rounded-full text-white"
            style={{ backgroundColor: categoryConfig.color }}
          >
            {categoryConfig.bookCtaLabel}
          </Button>
        }
      />
    </div>
  );
}
