import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import styles from './RecentSignals.module.css';

const LANE_CONFIG = {
  positive:      { label: 'POSITIVE',       color: '#3B6D11', symbol: '▲' },
  risk:          { label: 'RISK',            color: '#A32D2D', symbol: '▼' },
  newDisclosure: { label: 'NEW DISCLOSURE',  color: '#185FA5', symbol: 'NEW' },
};

const IMPACT_STYLE = {
  high:   { bg: '#FCEBEB', text: '#A32D2D', label: 'HIGH' },
  medium: { bg: '#FAEEDA', text: '#854F0B', label: 'MED' },
  low:    { bg: '#F1EFE8', text: '#5F5E5A', label: 'LOW' },
};

function SignalRow({ signal, laneColor, symbol }) {
  const [open, setOpen] = useState(false);
  const impact = IMPACT_STYLE[signal.impact] ?? IMPACT_STYLE.low;
  const hasMeasurement = !!signal.measurement;

  return (
    <div className={styles.signalWrap}>
      <button
        className={styles.signalRow}
        onClick={() => hasMeasurement && setOpen(o => !o)}
        style={{ cursor: hasMeasurement ? 'pointer' : 'default' }}
      >
        <span className={styles.dirSymbol} style={{ color: laneColor }}>{symbol}</span>
        <span className={styles.impactBadge} style={{ background: impact.bg, color: impact.text }}>
          {impact.label}
        </span>
        <span className={styles.signalTitle}>{signal.title}</span>
        {signal.subtitle && (
          <span className={styles.signalSubtitle}>{signal.subtitle}</span>
        )}
        <span className={styles.signalSource}>
          {signal.sourceSection}{signal.pageRef !== null ? ` · p.${signal.pageRef}` : ''}
        </span>
        {hasMeasurement && (
          <span className={styles.expandChevron} style={{ color: open ? laneColor : undefined }}>
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
      </button>

      {open && signal.measurement && (
        <div className={styles.measurementPanel}>
          <div className={styles.measurementRow}>
            <span className={styles.measureLabel}>{signal.measurement.metric}</span>
            <div className={styles.measureValues}>
              <span className={styles.prevValue}>{signal.measurement.previous}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.currValue} style={{ color: laneColor }}>
                {signal.measurement.current}
              </span>
              <span className={styles.changeLabel} style={{ color: laneColor }}>
                {signal.measurement.changeLabel}
              </span>
            </div>
          </div>
          {signal.measurement.note && (
            <p className={styles.measureNote}>{signal.measurement.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Lane({ laneKey, signals }) {
  if (!signals || signals.length === 0) return null;
  const cfg = LANE_CONFIG[laneKey];

  return (
    <div className={styles.lane}>
      <div className={styles.laneHeader} style={{ color: cfg.color }}>
        <div className={styles.laneIndicator} style={{ background: cfg.color }} />
        <span className={styles.laneLabel}>{cfg.label}</span>
        <span className={styles.laneCount}>{signals.length}</span>
      </div>
      <div className={styles.laneSignals}>
        {signals.map(signal => (
          <SignalRow
            key={signal.id}
            signal={signal}
            laneColor={cfg.color}
            symbol={cfg.symbol}
          />
        ))}
      </div>
    </div>
  );
}

export default function RecentSignals({ data }) {
  if (!data) return null;
  const hasAny = data.positive?.length > 0 || data.risk?.length > 0 || data.newDisclosure?.length > 0;
  if (!hasAny) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Recent Signals</span>
      </div>
      <Lane laneKey="positive"      signals={data.positive} />
      <Lane laneKey="risk"          signals={data.risk} />
      <Lane laneKey="newDisclosure" signals={data.newDisclosure} />
    </div>
  );
}
