"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DriverSignupPage() {
  const router = useRouter();
  const [providerName, setProviderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [township, setTownship] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "driver",
          full_name: providerName,
          provider_name: providerName,
          phone,
          township,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          license_number: licenseNumber,
          notes,
        },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/driver/dashboard");
      router.refresh();
      return;
    }

    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to {email}. Confirm your email, then log in to open the
            driver dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            size="touch"
            className="w-full rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
          >
            <Link href="/driver-login">Back to driver login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Driver account</CardTitle>
        <CardDescription>
          Create a transportation provider login for the driver dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="providerName">Provider or driver name</Label>
            <Input
              id="providerName"
              required
              value={providerName}
              onChange={(event) => setProviderName(event.target.value)}
              placeholder="Ko Nay Lin"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="09..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="township">Township</Label>
              <Input
                id="township"
                value={township}
                onChange={(event) => setTownship(event.target.value)}
                placeholder="Hlaing"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicleType">Vehicle type</Label>
              <Input
                id="vehicleType"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                placeholder="Van, bus, ferry"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicleNumber">Vehicle number</Label>
              <Input
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(event) => setVehicleNumber(event.target.value)}
                placeholder="YGN-7A-2145"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="licenseNumber">License number</Label>
            <Input
              id="licenseNumber"
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
              placeholder="Driver license or provider registration"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="driver@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Service area, route notes, or admin reference"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            size="touch"
            disabled={loading}
            className="mt-2 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
          >
            {loading ? "Creating account..." : "Create driver account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have a driver account?{" "}
          <Link href="/driver-login" className="font-medium text-brand-indigo hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
