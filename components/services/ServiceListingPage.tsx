"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getSavedItems } from "@/lib/queries/savedItems";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterSheet } from "@/components/services/FilterSheet";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { EmptyState } from "@/components/services/EmptyState";
import type { Database } from "@/types/database.types";
import type { FilterFieldConfig, FilterState, ServiceCardData } from "@/types/domain";

interface ServiceListingPageProps<TRow> {
  title: string;
  searchPlaceholder: string;
  filterFields: FilterFieldConfig[];
  formatRangeValue?: (n: number) => string;
  fetchRows: (supabase: SupabaseClient<Database>) => Promise<TRow[]>;
  toCard: (row: TRow) => ServiceCardData;
  matchesSearch: (row: TRow, query: string) => boolean;
  applyFilters: (row: TRow, filters: FilterState) => boolean;
  emptyMessage: string;
}

export function ServiceListingPage<TRow>({
  title,
  searchPlaceholder,
  filterFields,
  formatRangeValue,
  fetchRows,
  toCard,
  matchesSearch,
  applyFilters,
  emptyMessage,
}: ServiceListingPageProps<TRow>) {
  const [rows, setRows] = useState<TRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const [data, saved] = await Promise.all([
        fetchRows(supabase),
        user ? getSavedItems(supabase, user.id) : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setRows(data);
      setProfileId(user?.id ?? null);
      setSavedKeys(new Set(saved.map((s) => `${s.service_type}:${s.service_id}`)));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCards = useMemo(() => {
    return rows
      .filter((row) => matchesSearch(row, query))
      .filter((row) => applyFilters(row, filters))
      .map(toCard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, filters]);

  return (
    <div>
      <PageHeader title={title} subtitle={`${filteredCards.length} available`} />
      <div className="flex items-center gap-2 px-5 pb-4 md:px-8">
        <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} />
        <FilterSheet
          fields={filterFields}
          value={filters}
          onChange={setFilters}
          formatRangeValue={formatRangeValue}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 sm:grid-cols-2 md:px-8 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}

        {!loading &&
          profileId &&
          filteredCards.map((card) => (
            <ServiceCard
              key={card.id}
              data={card}
              profileId={profileId}
              initialSaved={savedKeys.has(`${card.category}:${card.id}`)}
            />
          ))}
      </div>

      {!loading && filteredCards.length === 0 && <EmptyState message={emptyMessage} />}
    </div>
  );
}
