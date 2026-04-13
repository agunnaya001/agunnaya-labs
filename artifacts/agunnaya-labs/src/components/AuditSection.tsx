import { useState, useEffect, useMemo, memo } from 'react';
import { AUDIT_REPO } from '../config';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type FilterSev = 'ALL' | Severity;

interface AuditEntry {
  id: number; severity: Severity; detector: string; repo: string; desc: string; time: string; pr: string;
}

const SEV_CLASS: Record<Severity, string> = {
  CRITICAL: 'sev-critical', HIGH: 'sev-high', MEDIUM: 'sev-medium', LOW: 'sev-low', INFO: 'sev-info',
};

const MOCK_ENTRIES: AuditEntry[] = [
  { id:1, severity:'CRITICAL', detector:'Reentrancy Detected', repo:AUDIT_REPO, desc:'External call before state update in withdraw(). Classic reentrancy pattern — attacker can drain funds before balance is zeroed.', time:'2m ago', pr:'PR #142' },
  { id:2, severity:'HIGH', detector:'tx.origin Misuse', repo:AUDIT_REPO, desc:'Authorization using tx.origin instead of msg.sender. Vulnerable to phishing attacks through malicious intermediary contracts.', time:'8m ago', pr:'PR #141' },
  { id:3, severity:'MEDIUM', detector:'Unchecked Return Value', repo:AUDIT_REPO, desc:'Low-level call() return value not checked. Failed transfers silently succeed, leading to incorrect state.', time:'15m ago', pr:'PR #140' },
  { id:4, severity:'LOW', detector:'Selfdestruct Usage', repo:AUDIT_REPO, desc:'Contract uses selfdestruct(). Post-EIP-6049 deprecated — may behave unexpectedly in future hard forks.', time:'1h ago', pr:'PR #139' },
  { id:5, severity:'INFO', detector:'Hardcoded Address', repo:AUDIT_REPO, desc:'Hardcoded address found in constructor. Consider using immutable or config param for better upgradeability.', time:'2h ago', pr:'PR #138' },
  { id:6, severity:'CRITICAL', detector:'Honeypot Pattern', repo:AUDIT_REPO, desc:'Transfer restrictions detected that prevent selling. Classic honeypot mechanic — buyers cannot exit their position.', time:'3h ago', pr:'PR #137' },
  { id:7, severity:'HIGH', detector:'Integer Overflow', repo:AUDIT_REPO, desc:'Unchecked arithmetic in fee calculation. Potential overflow on uint8 accumulation without SafeMath.', time:'4h ago', pr:'PR #136' },
];

const AuditRow = memo(function AuditRow({ e }: { e: AuditEntry }) {
  return (
    <div className="audit-entry">
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
  );
});

export default function AuditSection() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSev, setFilterSev] = useState<FilterSev>('ALL');

  useEffect(() => {
    const t = setTimeout(() => { setEntries(MOCK_ENTRIES); setLoading(false); }, 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() =>
    filterSev === 'ALL' ? entries : entries.filter(e => e.severity === filterSev),
    [entries, filterSev]
  );

  const stats = useMemo(() => ({
    total: entries.length,
    critical: entries.filter(e => e.severity === 'CRITICAL').length,
    high: entries.filter(e => e.severity === 'HIGH').length,
    clean: 3,
  }), [entries]);

  const SEVS: FilterSev[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

  return (
    <section id="audits" className="z">
      <div className="sec-label reveal">Live Vulnerability Feed</div>
      <div className="sec-title reveal">AUDIT<br />ACTIVITY</div>

      <div className="audit-terminal reveal">
        <div className="audit-bar">
          <div className="term-dot td-r" /><div className="term-dot td-y" /><div className="term-dot td-g" />
          <span className="term-title">smart-contract-auditor-bot · live scan results</span>
          <div className="term-live"><div className="gas-dot" />LIVE</div>
        </div>

        {/* Severity filter tabs */}
        {!loading && (
          <div className="audit-filter-bar">
            {SEVS.map(s => (
              <button
                key={s}
                className={`audit-filter-btn ${filterSev === s ? 'active' : ''} ${s !== 'ALL' ? SEV_CLASS[s as Severity] : ''}`}
                onClick={() => setFilterSev(s)}
              >
                {s}
                {s !== 'ALL' && (
                  <span className="audit-filter-count">
                    {entries.filter(e => e.severity === s).length}
                  </span>
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
          ) : filtered.length > 0 ? (
            filtered.map(e => <AuditRow key={e.id} e={e} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--ff-m)', fontSize: '.68rem', color: 'var(--dim)' }}>
              No {filterSev} severity issues found.
            </div>
          )}
        </div>

        <div className="audit-stats">
          <div className="audit-stat"><div className="audit-stat-n">{loading ? '···' : stats.total}</div><div className="audit-stat-l">Total Scans</div></div>
          <div className="audit-stat"><div className="audit-stat-n" style={{ color: 'var(--red)' }}>{loading ? '···' : stats.critical}</div><div className="audit-stat-l">Critical</div></div>
          <div className="audit-stat"><div className="audit-stat-n" style={{ color: 'var(--orange)' }}>{loading ? '···' : stats.high}</div><div className="audit-stat-l">High</div></div>
          <div className="audit-stat"><div className="audit-stat-n" style={{ color: 'var(--green)' }}>{loading ? '···' : stats.clean}</div><div className="audit-stat-l">Clean Passes</div></div>
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
