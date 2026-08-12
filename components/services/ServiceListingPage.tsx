"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterSheet } from "@/components/services/FilterSheet";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceCardCompact } from "@/components/services/ServiceCardCompact";
import { ServiceCardSkeleton, ServiceCardCompactSkeleton } from "@/components/services/ServiceCardSkeleton";
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
  renderCard?: (card: ServiceCardData, profileId: string) => ReactNode;
  matchesSearch: (row: TRow, query: string) => boolean;
  applyFilters: (row: TRow, filters: FilterState) => boolean;
  emptyMessage: string;
  listHeading?: string;
  listVariant?: "grid" | "compact";
  hideMainList?: boolean;
  renderSections?: (args: {
    rows: TRow[];
    filteredRows: TRow[];
    profileId: string | null;
    loading: boolean;
  }) => ReactNode;
}

export function ServiceListingPage<TRow>({
  title,
  searchPlaceholder,
  filterFields,
  formatRangeValue,
  fetchRows,
  toCard,
  renderCard,
  matchesSearch,
  applyFilters,
  emptyMessage,
  listHeading,
  listVariant = "grid",
  hideMainList = false,
  renderSections,
}: ServiceListingPageProps<TRow>) {
  const [rows, setRows] = useState<TRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const [authResult, data] = await Promise.all([
        supabase.auth.getUser(),
        fetchRows(supabase),
      ]);
      if (cancelled) return;
      setRows(data);
      setProfileId(authResult.data.user?.id ?? null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => matchesSearch(row, query))
      .filter((row) => applyFilters(row, filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, filters]);

  const filteredCards = useMemo(() => filteredRows.map(toCard), [filteredRows, toCard]);

  return (
    <div>
      <PageHeader title={title} subtitle={`${filteredCards.length} approved option${filteredCards.length === 1 ? "" : "s"}`} />

      <div className="flex items-center gap-2 px-4 pb-3 md:px-6">
        <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} />
        <FilterSheet
          fields={filterFields}
          value={filters}
          onChange={setFilters}
          formatRangeValue={formatRangeValue}
        />
      </div>

      {renderSections?.({ rows, filteredRows, profileId, loading })}

      {!hideMainList && (
        <>
          {listHeading && (
            <h2 className="mb-2 mt-5 px-4 text-base font-semibold text-foreground md:px-6">{listHeading}</h2>
          )}
          {listVariant === "compact" ? (
            <div className="flex flex-col gap-2.5 px-4 md:px-6">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <ServiceCardCompactSkeleton key={i} />)}

              {!loading &&
                profileId &&
                filteredCards.map((card) => (
                  <div key={card.id}>
                    {renderCard ? renderCard(card, profileId) : <ServiceCardCompact data={card} />}
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 md:px-6 xl:grid-cols-4">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}

              {!loading &&
                profileId &&
                filteredCards.map((card) => (
                  <div key={card.id}>
                    {renderCard ? renderCard(card, profileId) : <ServiceCard data={card} />}
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {!loading && filteredCards.length === 0 && <EmptyState message={emptyMessage} />}
    </div>
  );
}
