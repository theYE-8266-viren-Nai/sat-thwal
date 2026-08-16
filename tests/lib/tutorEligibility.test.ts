import { describe, expect, it } from "vitest";
import { parseGradesCsv } from "@/lib/tutorEligibility";

const semester = (name: string, grades: string[]) =>
  grades.map((grade, index) => `${name},Subject ${index + 1},${grade}`).join("\n");

describe("lib/tutorEligibility", () => {
  it("should reject empty CSV content", () => {
    const result = parseGradesCsv("\n\r\n");

    expect(result).toMatchObject({ ok: false, eligible: false });
    expect(result.error).toContain("empty");
  });

  it("should reject header-only CSV content", () => {
    const result = parseGradesCsv("semester,subject,grade");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("no grade rows");
  });

  it("should reject malformed rows with the wrong number of columns", () => {
    const result = parseGradesCsv("semester,subject,grade\n1,Math,A,extra");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Expected 3 columns");
  });

  it("should reject missing semester values", () => {
    const result = parseGradesCsv("semester,subject,grade\n,Math,A");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("missing semester");
  });

  it("should reject semesters that do not contain exactly six subjects", () => {
    const result = parseGradesCsv("semester,subject,grade\n" + semester("1", ["A", "A"]));

    expect(result.ok).toBe(false);
    expect(result.error).toContain("exactly 6");
  });

  it("should mark a tutor eligible when every semester has at least four A grades", () => {
    const result = parseGradesCsv([
      "semester,subject,grade",
      semester("1", ["A", "A", "A", "A", "B", "C"]),
      semester("2", ["a", "A", "A", "A", "B", "B"]),
    ].join("\n"));

    expect(result.ok).toBe(true);
    expect(result.eligible).toBe(true);
    expect(result.semesters).toEqual([
      { semester: "1", aCount: 4, eligible: true },
      { semester: "2", aCount: 4, eligible: true },
    ]);
  });

  it("should explain each ineligible semester", () => {
    const result = parseGradesCsv([
      semester("1", ["A", "A", "A", "B", "B", "C"]),
      semester("2", ["A", "A", "A", "A", "B", "C"]),
    ].join("\n"));

    expect(result.ok).toBe(true);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Semester 1 has only 3 A's");
  });
});