import styles from './MetricChanges.module.css';

const DELTA_COLOR = {
  up:           '#4D7A1A',
  down:         '#A32D2D',
  sign_reversal:'#854F0B',
};

function MetricRow({ metric, isFirst }) {
  const deltaColor = DELTA_COLOR[metric.direction] ?? '#9CA3AF';
  const isSignReversal = metric.direction === 'sign_reversal';

  return (
    <tr style={{ borderTop: isFirst ? 'none' : '0.5px solid #F3F4F6' }}>
      <td className={styles.tdLabel}>{metric.label}</td>
      <td className={styles.tdPrev}>{metric.previous}</td>
      <td className={styles.tdArrow}>→</td>
      <td className={styles.tdCurrent}>{metric.current}</td>
      <td className={styles.tdDelta} style={{ color: deltaColor }}>{metric.deltaLabel}</td>
      <td className={styles.tdBadge}>
        {isSignReversal && (
          <span className={styles.signReversalBadge}>⚠ 부호 전환</span>
        )}
        {metric.thresholdLabel && !isSignReversal && (
          <span className={styles.thresholdPill}>{metric.thresholdLabel}</span>
        )}
      </td>
    </tr>
  );
}

export default function MetricChanges({ data }) {
  if (!data) return null;
  const { periodLabel, anchor = [], conditional = [], suppressed = [] } = data;
  if (anchor.length === 0 && conditional.length === 0) return null;

  const hasConditional = conditional.length > 0;
  const hasSuppressed = suppressed.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Changes Since Last Filing</span>
        {periodLabel && (
          <span className={styles.periodLabel}>{periodLabel}</span>
        )}
      </div>

      <table className={styles.table}>
        <tbody>
          {anchor.length > 0 && (
            <>
              <tr className={styles.sectionDivider}>
                <td colSpan={6}>
                  <span className={styles.tierLabel}>Signal</span>
                </td>
              </tr>
              {anchor.map((m, i) => (
                <MetricRow key={m.id} metric={m} isFirst={i === 0} />
              ))}
            </>
          )}

          {hasConditional && (
            <>
              <tr className={styles.sectionDivider}>
                <td colSpan={6} style={{ paddingTop: anchor.length > 0 ? 14 : 8 }}>
                  <span className={styles.tierLabel}>Threshold exceeded</span>
                </td>
              </tr>
              {conditional.map((m, i) => (
                <MetricRow key={m.id} metric={m} isFirst={i === 0} />
              ))}
            </>
          )}
        </tbody>
      </table>

      {hasSuppressed && (
        <div className={styles.suppressedStrip}>
          <span className={styles.suppressedIcon}>◌</span>
          <div className={styles.suppressedContent}>
            <div className={styles.suppressedTitle}>임계값 미달 — 표시 제외</div>
            <div className={styles.suppressedItems}>
              {suppressed.map((m, i) => (
                <span key={m.id} className={styles.suppressedItem}>
                  {i > 0 && <span className={styles.suppressedSep}> · </span>}
                  <span className={styles.suppressedItemLabel}>{m.label}</span>
                  {' '}
                  <span className={styles.suppressedItemDelta}>{m.deltaLabel}</span>
                  {' '}
                  <span className={styles.suppressedItemReason}>({m.reason})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
