import { useState, useEffect, useMemo, memo } from 'react';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type FilterSev = 'ALL' | Severity;

interface AuditEntry {
  id: number; severity: Severity; detector: string; repo: string; desc: string; time: string; pr: string; url: string;
}

const SEV_CLASS: Record<Severity, string> = {
  CRITICAL: 'sev-critical', HIGH: 'sev-high', MEDIUM: 'sev-medium', LOW: 'sev-low', INFO: 'sev-info',
};

const AuditRow = memo(function AuditRow({ e }: { e: AuditEntry }) {
  return (
    <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="audit-entry" style={{ cursor: 'pointer' }} onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.02)'} onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = 'transparent'}>
        <span className={`audit-sev ${SEV_CLASS[e.severity]}`}>{e.severity}</span>
        <div>
          <div className="audit-detector">{e.detector}</div>
          <div className="audit-repo">{e.repo}</div>
          <div className="audit-desc">{e.desc}</div>
        </div>
        <div className="audit-meta">
          <div className="audit-time">{e.time}</div>
          <div className="audit-pr">{e.pr}</div>
        </div>
      </div>
    </a>
  );
});

export default function AuditSection() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSev, setFilterSev] = useState<FilterSev>('ALL');
  const [source, setSource] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/audits');
        const data = await res.json() as { ok: boolean; entries: AuditEntry[]; source: string };
        if (data.ok) {
          setEntries(data.entries);
          setSource(data.source);
        } else {
          setError('Audit feed unavailable.');
        }
      } catch {
        setError('Could not connect to audit service.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => filterSev === 'ALL' ? entries : entries.filter(e => e.severity === filterSev),
    [entries, filterSev]
  );

  const stats = useMemo(() => ({
    total: entries.length,
    critical: entries.filter(e => e.severity === 'CRITICAL').length,
    high: entries.filter(e => e.severity === 'HIGH').length,
    clean: entries.filter(e => e.severity === 'INFO').length,
  }), [entries]);

  const SEVS: FilterSev[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

  return (
    <section id="audits" className="z">
      <div className="sec-label reveal">Live Vulnerability Feed · GitHub</div>
      <div className="sec-title reveal">AUDIT<br />ACTIVITY</div>

      <div className="audit-terminal reveal">
        <div className="audit-bar">
          <div className="term-dot td-r" /><div className="term-dot td-y" /><div className="term-dot td-g" />
          <span className="term-title">smart-contract-auditor-bot · {source === 'live' ? 'live' : source === 'cache' ? 'cached' : 'connecting'}</span>
          <div className="term-live"><div className="gas-dot" />LIVE</div>
        </div>

        {!loading && entries.length > 0 && (
          <div className="audit-filter-bar">
            {SEVS.map(s => (
              <button
                key={s}
                className={`audit-filter-btn ${filterSev === s ? 'active' : ''} ${s !== 'ALL' ? SEV_CLASS[s as Severity] : ''}`}
                onClick={() => setFilterSev(s)}
              >
                {s}
                {s !== 'ALL' && (
                  <span className="audit-filter-count">{entries.filter(e => e.severity === s).length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="audit-feed">
          {loading ? (
            [0, 1, 2].map(i => (
              <div key={i} className="audit-skel">
                <div className="audit-skel-sev" />
                <div className="audit-skel-body">
                  <div className="audit-skel-line" />
                  <div className="audit-skel-line short" />
                </div>
              </div>
            ))
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--ff-m)', fontSize: '.68rem', color: 'var(--red)' }}>{error}</div>
          ) : filtered.length > 0 ? (
            filtered.map(e => <AuditRow key={e.id} e={e} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--ff-m)', fontSize: '.68rem', color: 'var(--dim)' }}>
              No {filterSev} severity issues found.
            </div>
          )}
        </div>

        <div className="audit-stats">
          <div className="audit-stat"><div className="audit-stat-n">{loading ? '···' : stats.total}</div><div className="audit-stat-l">Total</div></div>
          <div className="audit-stat"><div className="audit-stat-n" style={{ color: 'var(--red)' }}>{loading ? '···' : stats.critical}</div><div className="audit-stat-l">Critical</div></div>
          <div className="audit-stat"><div className="audit-stat-n" style={{ color: 'var(--orange)' }}>{loading ? '···' : stats.high}</div><div className="audit-stat-l">High</div></div>
          <div className="audit-stat"><div className="audit-stat-n" style={{ color: 'var(--green)' }}>{loading ? '···' : stats.clean}</div><div className="audit-stat-l">Info</div></div>
        </div>
      </div>

      <div style={{ textAlign: 'right', maxWidth: 1200, marginTop: 18 }}>
        <a href="https://v0-smart-contract-auditor-bot.vercel.app/" target="_blank" rel="noopener noreferrer">
          <button className="btn btn-outline">Open Full Dashboard ↗</button>
        </a>
      </div>
    </section>
  );
}
