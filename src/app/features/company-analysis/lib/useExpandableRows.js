import { useState } from 'react';

const DEFAULT_VISIBLE = 6;

export function useExpandableRows(rows, visibleCount = DEFAULT_VISIBLE) {
  const [expanded, setExpanded] = useState(false);
  const list = rows ?? [];
  const visible = expanded ? list : list.slice(0, visibleCount);
  const hasMore = list.length > visibleCount;
  return { visible, hasMore, expanded, toggle: () => setExpanded((v) => !v), total: list.length };
}
