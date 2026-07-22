import { redirect } from "next/navigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { SidebarNav } from "@/components/nav/SidebarNav";
import { getProfile } from "@/lib/queries/profiles";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "driver") {
    const { data: driverProfile } = await supabase
      .from("driver_profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();
    redirect(driverProfile?.status === "active" ? "/driver/dashboard" : "/driver-login");
  }

  if (profile?.role === "admin") {
    redirect(getRoleLandingPath(profile.role));
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarNav />
      <div className="flex min-w-0 min-h-screen flex-1 flex-col">
        <main className="min-w-0 flex-1 pb-[calc(var(--bottom-nav-h)+var(--safe-bottom)+1.5rem)] md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
