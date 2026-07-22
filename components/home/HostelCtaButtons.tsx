import Link from "next/link";
import { Home, Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HostelCtaButtonsProps {
  existingHostelId: string | null;
}

export function HostelCtaButtons({ existingHostelId }: HostelCtaButtonsProps) {
  return (
    <div className="mx-5 mt-3 flex gap-3 md:mx-8">
      <Button asChild size="touch" variant="outline" className="flex-1 rounded-xl">
        <Link href="/hostels">
          <Search className="h-4 w-4" />
          Find Hostel
        </Link>
      </Button>
      {existingHostelId && (
        <Button asChild size="touch" variant="outline" className="flex-1 rounded-xl">
          <Link href="/hostels/requests">
            <Inbox className="h-4 w-4" />
            Requests
          </Link>
        </Button>
      )}
      <Button
        asChild
        size="touch"
        className="flex-1 rounded-xl bg-category-hostel text-white hover:bg-category-hostel/90"
      >
        <Link href={existingHostelId ? `/services/hostel/${existingHostelId}` : "/hostels/list"}>
          <Home className="h-4 w-4" />
          {existingHostelId ? "My Room Listing" : "List Your Room"}
        </Link>
      </Button>
    </div>
  );
}
