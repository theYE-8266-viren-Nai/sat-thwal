import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

interface ProfileHeaderProps {
  name: string;
  academicYear: string | null;
  avatarUrl: string | null;
}

export function ProfileHeader({ name, academicYear, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-5 pt-6 md:px-8">
      <Avatar className="h-16 w-16">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="bg-brand-indigo text-lg text-white">
          {name ? initials(name) : <User className="h-6 w-6" />}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{academicYear || "Complete your profile"}</p>
      </div>
    </div>
  );
}
