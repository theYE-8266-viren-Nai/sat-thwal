import { redirect } from "next/navigation";
import { VerifyStudentIdClient } from "@/components/onboarding/VerifyStudentIdClient";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";

export default async function VerifyStudentIdPage() {
  const { userId, profile } = await getServerAuthContext();
  if (!userId || !profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleLandingPath(profile.role));
  if (profile.student_id_verified) {
    redirect(profile.onboarding_completed ? "/home" : "/onboarding");
  }

  return <VerifyStudentIdClient userId={userId} />;
}
