import { useState, useEffect, useCallback } from "react";
import {
  fetchStudentDashboard,
  fetchOpportunities,
  toggleOpportunityBookmark,
  searchDashboard,
  connectWithStudent,
} from "../api/studentDashboard";

export function useStudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await fetchStudentDashboard();
      setData(dashboard);
      setFilteredOpportunities(dashboard.opportunities);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Keep the dashboard live: quietly re-fetch in the background every few
  // seconds, and immediately whenever the tab regains focus/visibility —
  // so a startup hiring/accepting shows up here without needing to log
  // out and back in.
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const dashboard = await fetchStudentDashboard();
        setData(dashboard);
        setFilteredOpportunities((prev) => {
          // Preserve whatever filter/search is currently applied by just
          // refreshing the underlying data shape; the filter effect above
          // will re-derive filteredOpportunities from `data` changes.
          return prev.length ? prev : dashboard.opportunities;
        });
      } catch {
        // Silent — don't disrupt the UI over a background refresh failing.
      }
    };
    const intervalId = setInterval(silentRefresh, 8000);
    const onFocus = () => silentRefresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") silentRefresh();
    });
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function applyFilters() {
      if (!data) return;

      if (searchQuery.trim()) {
        const results = await searchDashboard(searchQuery);
        if (!cancelled) {
          const filtered =
            activeFilter === "All"
              ? results
              : results.filter((o) => o.filters.includes(activeFilter));
          setFilteredOpportunities(filtered);
        }
        return;
      }

      const results = await fetchOpportunities(activeFilter);
      if (!cancelled) setFilteredOpportunities(results);
    }

    applyFilters();
    return () => {
      cancelled = true;
    };
  }, [activeFilter, searchQuery, data]);

  const handleBookmark = useCallback(async (opportunityId) => {
    const { bookmarked } = await toggleOpportunityBookmark(opportunityId);
    setFilteredOpportunities((prev) =>
      prev.map((o) =>
        o.id === opportunityId ? { ...o, bookmarked } : o
      )
    );
    setData((prev) =>
      prev
        ? {
            ...prev,
            opportunities: prev.opportunities.map((o) =>
              o.id === opportunityId ? { ...o, bookmarked } : o
            ),
          }
        : prev
    );
  }, []);

  const handleApply = useCallback(async (opportunityId) => {
    await connectWithStudent(opportunityId);
    setFilteredOpportunities((prev) =>
      prev.map((o) => (o.id === opportunityId ? { ...o, applied: true } : o))
    );
    setData((prev) =>
      prev
        ? {
            ...prev,
            opportunities: prev.opportunities.map((o) =>
              o.id === opportunityId ? { ...o, applied: true } : o
            ),
          }
        : prev
    );
  }, []);

  const featuredMatches = filteredOpportunities.filter((o) => o.featured);
  const allOpportunities = filteredOpportunities.filter((o) => !o.featured);

  return {
    data,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredOpportunities,
    featuredMatches,
    allOpportunities,
    handleBookmark,
    handleApply,
    reload: loadDashboard,
  };
}
