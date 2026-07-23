import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProviderRegistrationReviewList } from "@/components/admin/ProviderRegistrationReviewList";
import { Button } from "@/components/ui/button";
import { requireAdminProfile } from "@/lib/admin/auth";
import { getProviderRegistrationReviews } from "@/lib/queries/providerRegistrations";

export default async function ProviderRegistrationsPage() {
  const { supabase } = await requireAdminProfile();
  const reviews = await getProviderRegistrationReviews(supabase);

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Button variant="ghost" asChild className="-ml-3 mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Admin dashboard
          </Link>
        </Button>

        <section className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Provider payments
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Registration review
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Confirm provider payments before provider services are published.
          </p>
        </section>

        <ProviderRegistrationReviewList reviews={reviews} />
      </div>
    </main>
  );
}
