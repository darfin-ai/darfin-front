import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth';
import {
  addStarredCompany,
  fetchStarredCompanies,
  removeStarredCompany,
} from '../api/companyAnalysisApi';

const EMPTY_LIST = { items: [], count: 0 };

/**
 * 관심 기업(watchlist) — 무료·무제한 별표 북마크, 백엔드 API 연동.
 * AI 분석 열람권과는 독립: 별표를 해제해도 열람권은 유지된다.
 * @typedef {import('../../../../mocks/companyAnalysis/types').StarredCompany} StarredCompany
 */
export function useStarredCompanies() {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY_LIST);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(EMPTY_LIST);
      return EMPTY_LIST;
    }
    setLoading(true);
    try {
      const next = await fetchStarredCompanies();
      const normalized = {
        items: next?.items ?? [],
        count: next?.count ?? next?.items?.length ?? 0,
      };
      setData(normalized);
      return normalized;
    } catch {
      setData(EMPTY_LIST);
      return EMPTY_LIST;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const items = data.items;

  const isStarred = useCallback(
    (corpCode) => items.some((item) => item.corpCode === corpCode),
    [items],
  );

  const star = useCallback(async (corpCode) => {
    const created = await addStarredCompany(corpCode);
    setData((prev) => {
      if (prev.items.some((item) => item.corpCode === corpCode)) {
        return { ...prev, count: prev.items.length };
      }
      const nextItems = [created, ...prev.items];
      return { items: nextItems, count: nextItems.length };
    });
    return created;
  }, []);

  const unstar = useCallback(async (corpCode) => {
    await removeStarredCompany(corpCode);
    setData((prev) => {
      const nextItems = prev.items.filter((item) => item.corpCode !== corpCode);
      return { items: nextItems, count: nextItems.length };
    });
  }, []);

  return {
    items,
    count: items.length,
    isStarred,
    star,
    unstar,
    refresh,
    loading,
  };
}
