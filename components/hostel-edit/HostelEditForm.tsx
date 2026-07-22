"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { FacilitiesMultiSelect } from "@/components/shared/FacilitiesMultiSelect";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { HOSTEL_ROOM_TYPES } from "@/lib/constants/facilities";
import type { GenderPolicy } from "@/types/database.types";
import { editHostelRoom } from "@/lib/actions/hostels";

interface HostelEditFormProps {
  userId: string;
  defaultName: string;
  defaultImageUrl: string;
  defaultTownship: string;
  defaultDistanceKm: string;
  defaultMonthlyRent: string;
  defaultGenderPolicy: GenderPolicy;
  defaultRoomType: string;
  defaultFacilities: string[];
  defaultAvailableRooms: string;
  defaultMealsIncluded: boolean;
  defaultDescription: string;
}

const GENDER_POLICY_OPTIONS = [
  { value: "male", label: "Male only" },
  { value: "female", label: "Female only" },
  { value: "mixed", label: "Mixed" },
] as const;

export function HostelEditForm({
  userId,
  defaultName,
  defaultImageUrl,
  defaultTownship,
  defaultDistanceKm,
  defaultMonthlyRent,
  defaultGenderPolicy,
  defaultRoomType,
  defaultFacilities,
  defaultAvailableRooms,
  defaultMealsIncluded,
  defaultDescription,
}: HostelEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(defaultName);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [township, setTownship] = useState(defaultTownship);
  const [distanceKm, setDistanceKm] = useState(defaultDistanceKm);
  const [monthlyRent, setMonthlyRent] = useState(defaultMonthlyRent);
  const [genderPolicy, setGenderPolicy] = useState<GenderPolicy>(defaultGenderPolicy);
  const [roomType, setRoomType] = useState(defaultRoomType);
  const [facilities, setFacilities] = useState<string[]>(defaultFacilities);
  const [availableRooms, setAvailableRooms] = useState(defaultAvailableRooms);
  const [mealsIncluded, setMealsIncluded] = useState(defaultMealsIncluded);
  const [description, setDescription] = useState(defaultDescription);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!name &&
    !!township &&
    !!distanceKm &&
    !!monthlyRent &&
    !!roomType &&
    !!availableRooms &&
    !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await editHostelRoom({
        name,
        imageUrl,
        township,
        distanceKm,
        monthlyRent,
        genderPolicy,
        roomType,
        facilities,
        availableRooms,
        mealsIncluded,
        description,
      });
      if (result.ok) {
        router.push(`/services/hostel/${result.hostelId}`);
      } else {
        toast.error(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 md:px-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Room listing</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostel-name">Listing name</Label>
          <Input id="hostel-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <ImageUpload bucket="hostel-images" userId={userId} label="Photo" value={imageUrl} onChange={setImageUrl} />

        <LabeledSelect
          id="hostel-township"
          label="Township"
          placeholder="Select township"
          value={township}
          onChange={setTownship}
          options={TOWNSHIPS}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostel-distance">Distance from university (km)</Label>
          <Input
            id="hostel-distance"
            type="number"
            min={0}
            step={0.1}
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostel-rent">Monthly rent (MMK)</Label>
          <Input
            id="hostel-rent"
            type="number"
            min={0}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostel-gender-policy">Gender policy</Label>
          <Select value={genderPolicy} onValueChange={(v) => setGenderPolicy(v as GenderPolicy)}>
            <SelectTrigger id="hostel-gender-policy" className="w-full">
              <SelectValue placeholder="Select gender policy" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_POLICY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <LabeledSelect
          id="hostel-room-type"
          label="Room type"
          placeholder="Select room type"
          value={roomType}
          onChange={setRoomType}
          options={HOSTEL_ROOM_TYPES}
        />

        <FacilitiesMultiSelect value={facilities} onChange={setFacilities} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostel-available-rooms">Rooms available</Label>
          <Input
            id="hostel-available-rooms"
            type="number"
            min={1}
            value={availableRooms}
            onChange={(e) => setAvailableRooms(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="hostel-meals">Meals included</Label>
          <Switch id="hostel-meals" checked={mealsIncluded} onCheckedChange={setMealsIncluded} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostel-description">Description</Label>
          <Textarea
            id="hostel-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          type="button"
          size="touch"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
        >
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
