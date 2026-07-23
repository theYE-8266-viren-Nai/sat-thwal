"use client";

import { useState } from "react";
import { Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { sendRestaurantOwnerReset } from "@/lib/admin/ownerAccounts.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RestaurantOwnerAccount } from "@/lib/admin/ownerAccounts";

interface RestaurantOwnerAccountsProps {
  accounts: RestaurantOwnerAccount[];
  setupError?: string | null;
}

export function RestaurantOwnerAccounts({
  accounts,
  setupError = null,
}: RestaurantOwnerAccountsProps) {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function handleReset(email: string) {
    setPendingEmail(email);
    try {
      const result = await sendRestaurantOwnerReset(email);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Password reset link sent to ${email}.`);
    } finally {
      setPendingEmail(null);
    }
  }

  return (
    <section className="mx-auto mt-6 max-w-5xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Restaurant owner accounts</h2>
        <p className="text-sm text-muted-foreground">
          Email addresses and password reset links for food service owners.
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        {setupError ? (
          <Card className="p-5 text-sm text-muted-foreground">
            {setupError}
          </Card>
        ) : accounts.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">
            No restaurant owner accounts were found.
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.profileId} className="gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{account.ownerName}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>{account.email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="touch"
                  disabled={pendingEmail === account.email}
                  onClick={() => handleReset(account.email)}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {pendingEmail === account.email ? "Sending..." : "Reset password"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {account.restaurantNames.map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
