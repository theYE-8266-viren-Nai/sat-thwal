"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import type { ServiceCategory } from "@/types/domain";

export function RecordRecentlyViewed({ category, id }: { category: ServiceCategory; id: string }) {
  useEffect(() => {
    addRecentlyViewed(category, id);
  }, [category, id]);

  return null;
}
