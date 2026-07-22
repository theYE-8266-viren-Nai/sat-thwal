import { requireAdminProfile } from "@/lib/admin/auth";

export default async function AdminDashboardPage() {
  const { profile } = await requireAdminProfile();

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8">
      <section className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Welcome, {profile.full_name ?? "admin"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin users are routed here instead of the student or driver dashboards.
        </p>
      </section>
    </main>
  );
}
