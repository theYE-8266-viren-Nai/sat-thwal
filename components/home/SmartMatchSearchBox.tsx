"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Search } from "lucide-react";

export function SmartMatchSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/smartmatch${params}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-5 mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-indigo-dark p-4 shadow-md md:mx-8"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask SmartMatch AI — tutor, hostel, food, transportation..."
        className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/70 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Ask SmartMatch AI"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
      >
        <Search className="h-4 w-4 text-white" />
      </button>
    </form>
  );
}
