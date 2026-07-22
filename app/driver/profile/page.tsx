import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireDriverProfile } from "@/lib/driver/auth";

export default async function DriverProfilePage() {
  const { profile, user } = await requireDriverProfile();

  const rows = [
    { label: "Name", value: profile.full_name ?? "Not added", icon: UserRound },
    { label: "Email", value: user.email ?? "Not added", icon: Mail },
    { label: "Phone", value: profile.phone ?? "Not added", icon: Phone },
    { label: "Township", value: profile.township ?? "Not added", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Driver profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These details are used to identify your provider account.
        </p>
      </section>

      <Card className="gap-0 divide-y divide-border p-0">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center gap-3 px-4 py-4">
              <Icon className="h-5 w-5 text-brand-mint" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </p>
                <p className="mt-1 text-sm text-foreground">{row.value}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
