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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const data = await fetchRows(supabase);
      if (cancelled) return;
      setRows(data);
      setProfileId(user?.id ?? null);
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

      {renderSections?.({ rows, filteredRows, profileId, loading })}

      {!hideMainList && (
        <>
          {listHeading && (
            <h2 className="mb-3 mt-7 px-5 text-lg font-bold text-foreground md:px-8">{listHeading}</h2>
          )}
          {listVariant === "compact" ? (
            <div className="flex flex-col gap-3 px-5 md:px-8">
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
            <div className="grid grid-cols-1 gap-4 px-5 sm:grid-cols-2 md:px-8 lg:grid-cols-3">
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
