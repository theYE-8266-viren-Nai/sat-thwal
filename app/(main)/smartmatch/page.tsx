import { Suspense } from "react";
import { SmartMatchClient } from "@/components/smartmatch/SmartMatchClient";

export default function SmartMatchPage() {
  return (
    <Suspense fallback={null}>
      <SmartMatchClient />
    </Suspense>
  );
}
