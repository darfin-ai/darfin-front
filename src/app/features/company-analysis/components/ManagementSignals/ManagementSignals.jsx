import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './ManagementSignals.module.css';

function highlightTerm(text, term) {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === term.toLowerCase()
      ? <mark key={i}>{p}</mark>
      : p
  );
}

function ThemePanel({ theme, onClose }) {
  return (
    <div className={styles.themePanel}>
      <div className={styles.themePanelHeader}>
        <span className={styles.themePanelTerm}>
          "{theme.term}"  {theme.previousCount} → {theme.currentCount}회
        </span>
        <button className={styles.themePanelClose} onClick={onClose}>
          <X size={13} />
        </button>
      </div>

      {theme.sectionDistribution?.length > 0 && (
        <div className={styles.distSection}>
          <div className={styles.distLabel}>섹션 분포</div>
          {theme.sectionDistribution.map(row => (
            <div key={row.section} className={styles.distRow}>
              <span className={styles.distSectionName}>{row.section}</span>
              <div className={styles.distBarTrack}>
                <div className={styles.distBarFill} style={{ width: `${row.pct}%` }} />
              </div>
              <span className={styles.distCount}>{row.count}회</span>
            </div>
          ))}
        </div>
      )}

      {theme.appearsInHeading && theme.headingNote && (
        <div className={`${styles.callout} ${styles.heading}`}>
          <span className={styles.calloutIcon}>◈</span>
          <span>{theme.headingNote}</span>
        </div>
      )}

      {theme.deemphasizedNote && (
        <div className={`${styles.callout} ${styles.deemphasized}`}>
          <span className={styles.calloutIcon}>↓</span>
          <span>{theme.deemphasizedNote}</span>
        </div>
      )}

      {theme.excerpts?.length > 0 && (
        <div className={styles.excerptsSection}>
          <div className={styles.distLabel}>발췌</div>
          {theme.excerpts.map((ex, i) => (
            <div key={i} className={styles.excerptItem}>
              <div className={styles.excerptMeta}>
                {ex.section}{ex.page ? ` · p.${ex.page}` : ''}
              </div>
              <p className={styles.excerptText}>
                "…{highlightTerm(ex.text, theme.term)}…"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManagementSignals({ data }) {
  const [activeTerm, setActiveTerm] = useState(null);
  if (!data?.themes?.length) return null;

  const activeTheme = data.themes.find(t => t.term === activeTerm) ?? null;
  const toggle = (term) => setActiveTerm(prev => prev === term ? null : term);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Management Signals</span>
        <span className={styles.meta}>vs previous filing</span>
      </div>

      <div className={styles.pills}>
        {data.themes.map(kw => {
          const delta = kw.currentCount - kw.previousCount;
          const isUp = delta > 0;
          const isDown = delta < 0;
          const magnitude = Math.abs(delta);
          const arrowCount = magnitude >= 10 ? 3 : magnitude >= 4 ? 2 : 1;
          const arrows = isUp ? '▲'.repeat(arrowCount) : isDown ? '▼'.repeat(arrowCount) : '';
          const arrowColor = isUp ? '#4D7A1A' : isDown ? '#A32D2D' : '#9CA3AF';
          const isActive = activeTerm === kw.term;
          const isDeemphasized = delta < 0;

          return (
            <button
              key={kw.term}
              className={`${styles.pill} ${isActive ? styles.active : ''} ${isDeemphasized ? styles.deemphasized : ''}`}
              onClick={() => toggle(kw.term)}
            >
              <span className={styles.pillTerm}>{kw.term}</span>
              {kw.isNew && <span className={styles.pillNewBadge}>NEW</span>}
              <span className={styles.pillCounts}>
                {kw.previousCount} → {kw.currentCount}
              </span>
              {delta !== 0 && (
                <span className={styles.pillArrows} style={{ color: arrowColor }}>
                  {arrows}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTheme && (
        <ThemePanel
          theme={activeTheme}
          onClose={() => setActiveTerm(null)}
        />
      )}
    </div>
  );
}
