"use client";

import { useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  createFoodPackage,
  FOOD_PACKAGE_LABELS,
  FOOD_PACKAGE_TYPES,
  updateFoodPackage,
  type FoodPackageWithSubscriberCount,
} from "@/lib/queries/food";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FoodPackageType } from "@/types/database.types";

interface FoodPackageManagerProps {
  restaurantId: string;
  packages: FoodPackageWithSubscriberCount[];
}

interface DraftState {
  name: string;
  monthlyPrice: string;
  maxSubscribers: string;
  isEnabled: boolean;
}

function toDraft(foodPackage: FoodPackageWithSubscriberCount): DraftState {
  return {
    name: foodPackage.name,
    monthlyPrice: String(foodPackage.monthly_price),
    maxSubscribers: String(foodPackage.max_subscribers),
    isEnabled: foodPackage.is_enabled,
  };
}

function defaultName(packageType: FoodPackageType) {
  return FOOD_PACKAGE_LABELS[packageType];
}

export function FoodPackageManager({ restaurantId, packages }: FoodPackageManagerProps) {
  const [rows, setRows] = useState(packages);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>(
    Object.fromEntries(packages.map((foodPackage) => [foodPackage.id, toDraft(foodPackage)])),
  );
  const [selectedType, setSelectedType] = useState<FoodPackageType | "">("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const availableTypes = useMemo(() => {
    const used = new Set(rows.map((foodPackage) => foodPackage.package_type));
    return FOOD_PACKAGE_TYPES.filter((type) => !used.has(type));
  }, [rows]);

  async function handleAdd() {
    if (!selectedType) {
      toast.error("Choose a package type first.");
      return;
    }

    setAdding(true);
    try {
      const supabase = createClient();
      const created = await createFoodPackage(supabase, {
        restaurant_id: restaurantId,
        package_type: selectedType,
        name: defaultName(selectedType),
        monthly_price: 0,
        max_subscribers: 1,
        is_enabled: false,
      });
      const row = { ...created, activeSubscriberCount: 0 };
      setRows((prev) => [...prev, row]);
      setDrafts((prev) => ({ ...prev, [row.id]: toDraft(row) }));
      setSelectedType("");
      toast.success("Package added");
    } catch {
      toast.error("Couldn't add this package. Try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleSave(foodPackage: FoodPackageWithSubscriberCount) {
    const draft = drafts[foodPackage.id];
    const monthlyPrice = Number(draft.monthlyPrice);
    const maxSubscribers = Number(draft.maxSubscribers);

    if (!draft.name.trim()) {
      toast.error("Package name is required.");
      return;
    }
    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      toast.error("Monthly price must be 0 or higher.");
      return;
    }
    if (!Number.isInteger(maxSubscribers) || maxSubscribers < 0) {
      toast.error("Maximum subscribers must be 0 or higher.");
      return;
    }
    if (maxSubscribers < foodPackage.activeSubscriberCount) {
      toast.error("Capacity can't be lower than the active subscriber count.");
      return;
    }

    setPendingId(foodPackage.id);
    try {
      const supabase = createClient();
      const updated = await updateFoodPackage(supabase, foodPackage.id, {
        name: draft.name.trim(),
        monthly_price: monthlyPrice,
        max_subscribers: maxSubscribers,
        is_enabled: draft.isEnabled,
      });
      setRows((prev) =>
        prev.map((row) =>
          row.id === foodPackage.id
            ? { ...updated, activeSubscriberCount: foodPackage.activeSubscriberCount }
            : row,
        ),
      );
      toast.success("Package updated");
    } catch {
      toast.error("Couldn't update this package. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  function updateDraft(packageId: string, updates: Partial<DraftState>) {
    setDrafts((prev) => ({
      ...prev,
      [packageId]: { ...prev[packageId], ...updates },
    }));
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">Monthly packages</h2>
        <p className="text-sm text-muted-foreground">
          Manage subscription packages students can request from your restaurant.
        </p>
      </div>

      {availableTypes.length > 0 && (
        <Card className="flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>Add package</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as FoodPackageType)}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Choose package type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {FOOD_PACKAGE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="touch"
            className="rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
            disabled={adding}
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4" />
            {adding ? "Adding..." : "Add package"}
          </Button>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((foodPackage) => {
          const draft = drafts[foodPackage.id] ?? toDraft(foodPackage);
          return (
            <Card key={foodPackage.id} className="flex flex-col gap-4 rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {FOOD_PACKAGE_LABELS[foodPackage.package_type]}
                  </p>
                  <h3 className="text-base font-semibold text-foreground">{foodPackage.name}</h3>
                </div>
                <Badge variant={foodPackage.is_enabled ? "default" : "secondary"}>
                  {foodPackage.is_enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor={`package-name-${foodPackage.id}`}>Package name</Label>
                  <Input
                    id={`package-name-${foodPackage.id}`}
                    value={draft.name}
                    onChange={(event) => updateDraft(foodPackage.id, { name: event.target.value })}
                    className="mt-2 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor={`package-price-${foodPackage.id}`}>Monthly price</Label>
                  <Input
                    id={`package-price-${foodPackage.id}`}
                    type="number"
                    min={0}
                    value={draft.monthlyPrice}
                    onChange={(event) => updateDraft(foodPackage.id, { monthlyPrice: event.target.value })}
                    className="mt-2 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor={`package-capacity-${foodPackage.id}`}>Maximum subscribers</Label>
                  <Input
                    id={`package-capacity-${foodPackage.id}`}
                    type="number"
                    min={foodPackage.activeSubscriberCount}
                    value={draft.maxSubscribers}
                    onChange={(event) => updateDraft(foodPackage.id, { maxSubscribers: event.target.value })}
                    className="mt-2 h-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {foodPackage.activeSubscriberCount} / {foodPackage.max_subscribers} active subscribers
                  </p>
                  <p className="text-xs text-muted-foreground">Confirmed student subscriptions only.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`package-enabled-${foodPackage.id}`} className="text-sm">
                    Enabled
                  </Label>
                  <Switch
                    id={`package-enabled-${foodPackage.id}`}
                    checked={draft.isEnabled}
                    onCheckedChange={(checked) => updateDraft(foodPackage.id, { isEnabled: checked })}
                  />
                </div>
              </div>

              <Button
                size="touch"
                className="rounded-xl bg-brand-indigo text-white hover:bg-brand-indigo-dark"
                disabled={pendingId === foodPackage.id}
                onClick={() => handleSave(foodPackage)}
              >
                <Save className="h-4 w-4" />
                {pendingId === foodPackage.id ? "Saving..." : "Save package"}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
