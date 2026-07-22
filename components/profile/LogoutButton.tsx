"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Logging out..." : "Log out"}
    </Button>
  );
}
