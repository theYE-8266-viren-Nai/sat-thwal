import { MapPin } from "lucide-react";
import { NotificationBell } from "@/components/nav/NotificationBell";
import { UNIVERSITY_SHORT_NAMES, type University } from "@/lib/constants/universities";

interface GreetingHeaderProps {
  name: string;
  university: string | null;
  township: string | null;
}

export function GreetingHeader({ name, university, township }: GreetingHeaderProps) {
  const shortUniversity = university ? UNIVERSITY_SHORT_NAMES[university as University] ?? university : null;

  return (
    <div className="flex items-center justify-between px-5 pt-6 md:px-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Hello, {name} 👋</h1>
        {(shortUniversity || township) && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {[shortUniversity, township].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <NotificationBell />
    </div>
  );
}
