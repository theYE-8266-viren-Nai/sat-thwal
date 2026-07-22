"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DriverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile, error: profileError } = user
      ? await supabase.from("profiles").select("id, role").eq("id", user.id).single()
      : { data: null, error: null };

    if (profileError || !profile || (profile.role !== "driver" && profile.role !== "admin")) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("This login is only for transportation drivers.");
      return;
    }

    if (profile.role === "driver") {
      const { data: driverProfile, error: driverProfileError } = await supabase
        .from("driver_profiles")
        .select("id, status")
        .eq("id", profile.id)
        .single();

      if (driverProfileError || !driverProfile) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("This driver account is missing its driver profile.");
        return;
      }

      if (driverProfile.status !== "active") {
        await supabase.auth.signOut();
        setLoading(false);
        setError("This driver account is not active yet.");
        return;
      }
    }

    setLoading(false);
    router.push(getRoleLandingPath(profile.role));
    router.refresh();
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Driver Portal</CardTitle>
        <CardDescription>
          Transportation providers sign in here to manage route registrations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="driverEmail">Email</Label>
            <Input
              id="driverEmail"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="driver@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="driverPassword">Password</Label>
            <div className="relative">
              <Input
                id="driverPassword"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="pr-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">Driver accounts are created by the transportation administrator.</p>
            <a
              href="mailto:?subject=Driver%20password%20reset%20request"
              className="shrink-0 font-medium text-brand-indigo hover:underline"
            >
              Forgot Password
            </a>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            size="touch"
            disabled={loading}
            className="mt-2 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          Student account?{" "}
          <Link href="/login" className="font-medium text-brand-indigo hover:underline">
            Use student login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
