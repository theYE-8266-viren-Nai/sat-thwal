export function toErrorMessage(error: unknown, fallback = "Supabase request failed.") {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
    const parts = [maybeError.code, maybeError.message, maybeError.details, maybeError.hint].filter(Boolean);
    if (parts.length > 0) return parts.join(" - ");
  }
  return fallback;
}

export function throwSupabaseError(error: unknown, fallback?: string): never {
  throw new Error(toErrorMessage(error, fallback));
}
