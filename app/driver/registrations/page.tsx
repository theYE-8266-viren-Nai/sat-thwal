import { DriverRegistrationsClient } from "@/components/driver/DriverRegistrationsClient";
import { requireDriverProfile } from "@/lib/driver/auth";
import { getDriverRegistrations } from "@/lib/queries/transportationRegistrations";

export default async function DriverRegistrationsPage() {
  const { supabase, profile } = await requireDriverProfile();
  const registrations = await getDriverRegistrations(supabase, profile.id);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Seat registrations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review student pickup details, approve available seats, or reject requests with a reason.
        </p>
      </section>

      <DriverRegistrationsClient registrations={registrations} />
    </div>
  );
}
