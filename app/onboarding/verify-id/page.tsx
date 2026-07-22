"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";
import { StudentIdCapture } from "@/components/onboarding/StudentIdCapture";

export default function VerifyStudentIdPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, student_id_verified, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role && profile.role !== "student") {
        router.push("/home");
        return;
      }

      if (profile?.student_id_verified) {
        router.push(profile.onboarding_completed ? "/home" : "/onboarding");
        return;
      }

      setUserId(user.id);
    }

    load();
  }, [router]);

  function handleVerified() {
    router.push("/onboarding");
    router.refresh();
  }

  if (!userId) return null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-8 px-5 py-10">
      <Logo />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Verify your student ID</h1>
        <p className="text-muted-foreground">
          Take a photo or upload an image of your student ID card. We use this to confirm you&apos;re
          a real student before setting up your account — it&apos;s only visible to you and Sat
          Thwal.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <StudentIdCapture userId={userId} onVerified={handleVerified} />
      </div>
    </div>
  );
}
