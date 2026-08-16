import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/nav/BottomNav";
import { SidebarNav } from "@/components/nav/SidebarNav";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";
import { queryKeys } from "@/lib/queryKeys";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { userId, profile } = await getServerAuthContext();
  if (!userId || !profile) redirect("/login");

  if (profile.role !== "student") {
    redirect(getRoleLandingPath(profile.role));
  }

  if (!profile.student_id_verified) redirect("/onboarding/verify-id");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.currentUser, userId);
  queryClient.setQueryData(queryKeys.currentProfile, profile);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <div className="flex min-w-0 min-h-screen flex-1 flex-col">
          <main className="min-w-0 flex-1 pb-[calc(var(--bottom-nav-h)+var(--safe-bottom)+1.5rem)] md:pb-10">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </HydrationBoundary>
  );
}
