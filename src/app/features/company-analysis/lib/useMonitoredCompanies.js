import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth';
import {
  addMonitoredCompany,
  fetchMonitoredCompanies,
  removeMonitoredCompany,
} from '../api/companyAnalysisApi';
import { getMonitorLimit } from './monitoringPlan';

const EMPTY_LIST = { items: [], count: 0, limit: 3 };

/**
 * Per-user monitored companies (My Analysis) via backend API.
 * @typedef {import('../../../../mocks/companyAnalysis/types').MonitoredCompany} MonitoredCompany
 */
export function useMonitoredCompanies() {
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
      const next = await fetchMonitoredCompanies();
      const normalized = {
        items: next?.items ?? [],
        count: next?.count ?? next?.items?.length ?? 0,
        limit: next?.limit ?? getMonitorLimit(user.subscriptionLevel),
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

  const limit = useMemo(
    () => data.limit ?? getMonitorLimit(user?.subscriptionLevel),
    [data.limit, user?.subscriptionLevel],
  );

  const items = data.items;

  const isMonitored = useCallback(
    (corpCode) => items.some((item) => item.corpCode === corpCode),
    [items],
  );

  const canAddMore = items.length < limit;

  const add = useCallback(
    async (corpCode) => {
      const created = await addMonitoredCompany(corpCode);
      setData((prev) => {
        if (prev.items.some((item) => item.corpCode === corpCode)) {
          return { ...prev, count: prev.items.length };
        }
        const nextItems = [created, ...prev.items];
        return {
          ...prev,
          items: nextItems,
          count: nextItems.length,
        };
      });
      return created;
    },
    [],
  );

  const remove = useCallback(async (corpCode) => {
    await removeMonitoredCompany(corpCode);
    setData((prev) => {
      const nextItems = prev.items.filter((item) => item.corpCode !== corpCode);
      return {
        ...prev,
        items: nextItems,
        count: nextItems.length,
      };
    });
  }, []);

  return {
    items,
    limit,
    count: items.length,
    canAddMore,
    isMonitored,
    add,
    remove,
    refresh,
    loading,
  };
}
