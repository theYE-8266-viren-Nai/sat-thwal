"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Languages, MapPin, Phone, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { getAcceptedRequestContact } from "@/lib/queries/requestContacts";
import { queryKeys } from "@/lib/queryKeys";
import type { ServiceType } from "@/types/database.types";

type AcceptedRequestContactCardProps = {
  requestId: string;
  serviceType: ServiceType;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  viewer: "student" | "provider";
};

const ROLE_LABELS = {
  student: "Student",
  tutor: "Tutor",
  hostel_owner: "Hostel owner",
};

function initials(name: string | null) {
  if (!name) return "ST";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function languageLabel(value: string | null) {
  if (!value) return null;
  if (value === "en") return "English";
  if (value === "my") return "Myanmar";
  return value;
}

export function AcceptedRequestContactCard({
  requestId,
  serviceType,
  status,
  viewer,
}: AcceptedRequestContactCardProps) {
  const canShow = (serviceType === "tutor" || serviceType === "hostel") && (status === "confirmed" || status === "completed");
  const contactQuery = useQuery({
    queryKey: queryKeys.acceptedRequestContact(requestId),
    queryFn: () => getAcceptedRequestContact(createClient(), requestId),
    enabled: canShow,
  });

  if (!canShow) return null;

  if (contactQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        Loading contact details...
      </div>
    );
  }

  if (contactQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
        Contact details are unavailable right now.
      </div>
    );
  }

  const contact = contactQuery.data;
  if (!contact) return null;

  const subjects = contact.preferredSubjects.slice(0, 3);
  const shownLanguage = languageLabel(contact.languagePreference);
  const title = viewer === "student" ? "Provider contact" : "Student contact";

  return (
    <section className="rounded-xl border border-brand-indigo/15 bg-brand-indigo/5 p-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11">
          {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.fullName ?? title} />}
          <AvatarFallback className="bg-brand-indigo/10 font-semibold text-brand-indigo">
            {initials(contact.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{contact.fullName ?? "Contact"}</p>
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
              {ROLE_LABELS[contact.contactRole]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-brand-mint" />
          <span>{contact.phone || "No phone added"}</span>
        </div>
        {contact.township && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-brand-mint" />
            <span>{contact.township}</span>
          </div>
        )}
        {contact.academicYear && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 shrink-0 text-brand-mint" />
            <span>{contact.academicYear}</span>
          </div>
        )}
        {shownLanguage && (
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 shrink-0 text-brand-mint" />
            <span>{shownLanguage}</span>
          </div>
        )}
      </div>

      {subjects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Subjects
          </span>
          {subjects.map((subject) => (
            <span key={subject} className="rounded-full bg-background px-2.5 py-1 text-xs text-foreground">
              {subject}
            </span>
          ))}
        </div>
      )}

      {!contact.phone && !contact.township && !contact.academicYear && !shownLanguage && subjects.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="h-4 w-4 shrink-0 text-brand-mint" />
          <span>No extra profile details added yet.</span>
        </div>
      )}
    </section>
  );
}
