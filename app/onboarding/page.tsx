import { redirect } from "next/navigation";
import { OnboardingClient } from "@/components/onboarding/OnboardingClient";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";

export default async function OnboardingPage() {
  const { userId, profile } = await getServerAuthContext();
  if (!userId || !profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleLandingPath(profile.role));
  if (!profile.student_id_verified) redirect("/onboarding/verify-id");
  if (profile.onboarding_completed) redirect("/home");

  return <OnboardingClient profileId={userId} />;
}
