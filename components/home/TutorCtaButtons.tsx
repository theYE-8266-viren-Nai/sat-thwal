import Link from "next/link";
import { GraduationCap, Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorCtaButtonsProps {
  existingTutorId: string | null;
}

export function TutorCtaButtons({ existingTutorId }: TutorCtaButtonsProps) {
  return (
    <div className="mx-5 mt-4 flex gap-3 md:mx-8">
      <Button asChild size="touch" variant="outline" className="flex-1 rounded-xl">
        <Link href="/tutors">
          <Search className="h-4 w-4" />
          Find Tutor
        </Link>
      </Button>
      {existingTutorId && (
        <Button asChild size="touch" variant="outline" className="flex-1 rounded-xl">
          <Link href="/tutors/requests">
            <Inbox className="h-4 w-4" />
            Requests
          </Link>
        </Button>
      )}
      <Button
        asChild
        size="touch"
        className="flex-1 rounded-xl bg-category-tutor text-white hover:bg-category-tutor/90"
      >
        <Link href={existingTutorId ? `/services/tutor/${existingTutorId}` : "/tutors/apply"}>
          <GraduationCap className="h-4 w-4" />
          {existingTutorId ? "My Tutor Profile" : "Become a Tutor"}
        </Link>
      </Button>
    </div>
  );
}
