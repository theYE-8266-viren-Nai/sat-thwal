"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("id, role").eq("id", user.id).single()
      : { data: null };

    if (profile?.role === "driver") {
      const { data: driverProfile, error: driverProfileError } = await supabase
        .from("driver_profiles")
        .select("id, status")
        .eq("id", profile.id)
        .single();

      if (driverProfileError || !driverProfile) {
        await supabase.auth.signOut();
        setError("This driver account is missing its driver profile.");
        return;
      }

      if (driverProfile.status !== "active") {
        await supabase.auth.signOut();
        setError("This driver account is not active yet.");
        return;
      }
    }

    router.push(getRoleLandingPath(profile?.role));
    router.refresh();
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to continue finding student services.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            size="touch"
            disabled={loading}
            className="mt-2 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Sat Thwal?{" "}
          <Link href="/signup" className="font-medium text-brand-indigo hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
