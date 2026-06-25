import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import styles from './ScoreBreakdown.module.css';

function ComponentBar({ component, isOpen, onToggle }) {
  return (
    <div className={styles.componentWrap}>
      <button className={styles.componentBtn} onClick={onToggle}>
        <div className={styles.componentLeft}>
          <span className={styles.componentLabel}>{component.label}</span>
          <span className={styles.componentWeight}>{component.weight}%</span>
        </div>
        <div className={styles.barTrack}>
          <div
            className={styles.barFill}
            style={{ width: `${component.rawScore}%`, backgroundColor: component.barColor }}
          />
        </div>
        <span className={styles.rawScore} style={{ color: component.barColor }}>
          {component.rawScore}
        </span>
        <span className={styles.chevron}>
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </button>

      {isOpen && (
        <div className={styles.breakdown}>
          {component.items.map(item => {
            const isMuted = item.status === 'below_threshold';
            return (
              <div
                key={item.id}
                className={`${styles.breakdownItem} ${isMuted ? styles.muted : ''}`}
              >
                <span className={styles.itemLabel}>{item.label}</span>
                <span
                  className={styles.itemPoints}
                  style={{ color: isMuted ? undefined : component.barColor }}
                >
                  {item.points}/{item.maxPoints}
                </span>
              </div>
            );
          })}
          {component.formula && (
            <div className={styles.formula}>{component.formula}</div>
          )}
        </div>
      )}
    </div>
  );
}

const TIER_COLOR = {
  high:     '#A32D2D',
  moderate: '#854F0B',
  low:      '#4D7A1A',
  none:     '#9CA3AF',
};

export default function ScoreBreakdown({ data, label = 'Score Breakdown', note = 'Score is fully deterministic' }) {
  const [openKey, setOpenKey] = useState(null);
  if (!data) return null;

  const toggle = (key) => setOpenKey(prev => prev === key ? null : key);
  const scoreColor = TIER_COLOR[data.tier] ?? '#9CA3AF';
  const hasComponents = data.components?.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header} style={hasComponents ? undefined : { marginBottom: 0 }}>
        <span className={styles.sectionLabel}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          {data.score != null && (
            <span style={{ fontSize: 26, fontWeight: 700, color: scoreColor, fontFamily: 'ui-monospace, Consolas, monospace', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {data.score}
            </span>
          )}
          {data.score != null && (
            <span style={{ fontSize: 13, color: '#D1D5DB', fontFamily: 'ui-monospace, Consolas, monospace' }}>/100</span>
          )}
          <span className={styles.note}>{note}</span>
        </div>
      </div>
      {hasComponents && (
        <div className={styles.components}>
          {data.components.map(comp => (
            <ComponentBar
              key={comp.key}
              component={comp}
              isOpen={openKey === comp.key}
              onToggle={() => toggle(comp.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
