import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";

export default async function RootPage() {
  const { userId, profile } = await getServerAuthContext();
  if (!userId) redirect("/login");
  redirect(getRoleLandingPath(profile?.role));
}
