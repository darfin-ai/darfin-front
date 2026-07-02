import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'darfin.companyAnalysis.watchlist';

function readStoredIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists the user's watched-company ids to localStorage — this feature has
 * no backend of its own (see mocks/companyAnalysis), so there is nowhere else
 * to store it yet.
 */
export function useWatchlist() {
  const [ids, setIds] = useState(readStoredIds);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isWatched = useCallback((id) => ids.includes(id), [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }, []);

  return { ids, isWatched, toggle };
}
