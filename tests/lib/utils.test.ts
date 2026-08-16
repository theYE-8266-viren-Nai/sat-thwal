import { describe, expect, it, vi, afterEach } from "vitest";
import { cn, formatDistance, formatMMK, initials, isOpenNow } from "@/lib/utils";

describe("lib/utils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should merge class names and resolve Tailwind conflicts", () => {
    // Arrange
    const classes = ["px-2", false && "hidden", "px-4", "text-sm"];

    // Act
    const result = cn(classes);

    // Assert
    expect(result).toBe("px-4 text-sm");
  });

  it.each([
    [0, "0 MMK"],
    [150000, "150,000 MMK"],
    [-5000, "-5,000 MMK"],
  ])("should format %s as MMK currency", (amount, expected) => {
    expect(formatMMK(amount)).toBe(expected);
  });

  it("should format distance labels", () => {
    expect(formatDistance(1.25)).toBe("1.25 km away");
  });

  it("should return false when opening hours are missing or malformed", () => {
    expect(isOpenNow(null)).toBe(false);
    expect(isOpenNow("always open")).toBe(false);
  });

  it("should return true when current time is inside the opening range", () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00"));

    // Act & Assert
    expect(isOpenNow("9:00 AM - 5:00 PM")).toBe(true);
  });

  it("should return false when current time is outside the opening range", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T18:01:00"));

    expect(isOpenNow("9:00 AM - 5:00 PM")).toBe(false);
  });

  it.each([
    ["Aung Kyaw Zin", "AK"],
    ["single", "S"],
    ["", ""],
  ])("should derive initials for %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});