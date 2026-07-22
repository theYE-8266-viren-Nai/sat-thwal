const SUBJECTS_PER_SEMESTER = 6;
const MIN_A_COUNT = 3; // must exceed this (i.e. at least 4 of 6)

export interface SemesterResult {
  semester: string;
  aCount: number;
  eligible: boolean;
}

export interface EligibilityResult {
  ok: boolean;
  error?: string;
  eligible: boolean;
  semesters: SemesterResult[];
  reason?: string;
}

function ineligible(error: string): EligibilityResult {
  return { ok: false, error, eligible: false, semesters: [] };
}

export function parseGradesCsv(text: string): EligibilityResult {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\r$/, "").trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return ineligible("The file is empty or could not be read.");
  }

  const rows = lines.map((line) => line.split(",").map((cell) => cell.trim()));

  const firstCell = rows[0][0];
  const hasHeader = Number.isNaN(Number(firstCell));
  const dataRows = hasHeader ? rows.slice(1) : rows;

  if (dataRows.length === 0) {
    return ineligible("The file has no grade rows.");
  }

  const bySemester = new Map<string, string[]>();
  const order: string[] = [];

  for (const row of dataRows) {
    if (row.length !== 3) {
      return ineligible(`Expected 3 columns (semester, subject, grade) but found a row with ${row.length}.`);
    }
    const [semester, , grade] = row;
    if (!semester) {
      return ineligible("Found a row with a missing semester value.");
    }
    if (!bySemester.has(semester)) {
      bySemester.set(semester, []);
      order.push(semester);
    }
    bySemester.get(semester)!.push(grade);
  }

  for (const semester of order) {
    const grades = bySemester.get(semester)!;
    if (grades.length !== SUBJECTS_PER_SEMESTER) {
      return ineligible(
        `Semester ${semester} has ${grades.length} subject rows; each semester must have exactly ${SUBJECTS_PER_SEMESTER}.`,
      );
    }
  }

  const semesters: SemesterResult[] = order.map((semester) => {
    const grades = bySemester.get(semester)!;
    const aCount = grades.filter((g) => g.toUpperCase() === "A").length;
    return { semester, aCount, eligible: aCount > MIN_A_COUNT };
  });

  const eligible = semesters.every((s) => s.eligible);
  const reason = eligible
    ? undefined
    : semesters
        .filter((s) => !s.eligible)
        .map((s) => `Semester ${s.semester} has only ${s.aCount} A's (need at least ${MIN_A_COUNT + 1}).`)
        .join(" ");

  return { ok: true, eligible, semesters, reason };
}
