"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";
import { StudentIdCapture } from "@/components/onboarding/StudentIdCapture";

export function VerifyStudentIdClient({ userId }: { userId: string }) {
  const router = useRouter();

  function handleVerified() {
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-8 px-5 py-10">
      <Logo />

      <div className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit bg-card text-brand-indigo">
          Official UIT student access
        </Badge>
        <h1 className="text-2xl font-bold text-foreground">Verify with your official UIT student ID</h1>
        <p className="text-muted-foreground">
          Sat Thwal uses a school-controlled verification step before onboarding. We check your
          University of Information Technology student ID so student services stay limited to
          official UIT students.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 rounded-xl border border-brand-indigo/15 bg-secondary/60 p-4">
          <p className="text-sm font-semibold text-foreground">How your ID photo is handled</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>It is used only for official UIT eligibility verification on this account.</li>
            <li>It stays in protected student ID storage, separate from public profile details.</li>
            <li>Service providers never see your ID photo or verification document.</li>
          </ul>
        </div>
        <StudentIdCapture userId={userId} onVerified={handleVerified} />
      </div>
    </div>
  );
}
