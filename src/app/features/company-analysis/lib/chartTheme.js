/** Recharts axis/grid colors that respect light/dark mode. */
export function chartAxisColors(isDark) {
  return {
    tick: isDark ? '#64748b' : '#94a3b8',
    axis: isDark ? '#334155' : '#e2e8f0',
    cursor: isDark ? '#334155' : '#e2e8f0',
    line: '#2563eb',
  };
}
