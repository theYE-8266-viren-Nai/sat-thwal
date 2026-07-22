import { DriverNotificationsClient } from "@/components/driver/DriverNotificationsClient";
import { requireDriverProfile } from "@/lib/driver/auth";
import { getDriverNotifications } from "@/lib/queries/transportationRegistrations";

export default async function DriverNotificationsPage() {
  const { supabase, profile } = await requireDriverProfile();
  const notifications = await getDriverNotifications(supabase, profile.id);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track new seat requests and student registration updates.
        </p>
      </section>

      <DriverNotificationsClient driverId={profile.id} notifications={notifications} />
    </div>
  );
}
