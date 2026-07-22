import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMMK(amount: number) {
  return `${amount.toLocaleString("en-US")} MMK`
}

export function formatDistance(km: number) {
  return `${km} km away`
}

export function isOpenNow(openingHours: string | null) {
  if (!openingHours) return false;
  const match = openingHours.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i,
  );
  if (!match) return false;

  const toMinutes = (h: string, m: string, period: string) => {
    let hour = Number(h) % 12;
    if (period.toUpperCase() === "PM") hour += 12;
    return hour * 60 + Number(m);
  };

  const start = toMinutes(match[1], match[2], match[3]);
  const end = toMinutes(match[4], match[5], match[6]);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return nowMinutes >= start && nowMinutes <= end;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
