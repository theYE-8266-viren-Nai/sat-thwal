import { MapPin } from "lucide-react";
import { NotificationBell } from "@/components/nav/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITY_SHORT_NAMES, type University } from "@/lib/constants/universities";

interface GreetingHeaderProps {
  name: string;
  university: string | null;
  township: string | null;
}

export function GreetingHeader({ name, university, township }: GreetingHeaderProps) {
  const shortUniversity = university ? UNIVERSITY_SHORT_NAMES[university as University] ?? university : null;

  return (
    <div
      className="flex items-center justify-between gap-3 px-5 md:px-8"
      style={{ paddingTop: "calc(1.5rem + var(--safe-top))" }}
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-foreground">Hello, {name} 👋</h1>
        {(shortUniversity || township) && (
          <Badge variant="secondary" className="w-fit gap-1 font-normal text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {[shortUniversity, township].filter(Boolean).join(" · ")}
          </Badge>
        )}
      </div>
      <NotificationBell />
    </div>
  );
}
