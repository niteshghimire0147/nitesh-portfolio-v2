import { useSiteConfig } from '../../context/SiteConfigContext';
import { FiExternalLink, FiShield, FiAward, FiAlertTriangle } from 'react-icons/fi';

const SEVERITY_STYLES = {
  Critical: { bg: '#ff000022', border: '#ff0000', text: '#ff4444' },
  High:     { bg: '#ff6b0022', border: '#ff6b00', text: '#ff8c00' },
  Medium:   { bg: '#ffd70022', border: '#ffd700', text: '#ffd700' },
  Low:      { bg: '#00ff8822', border: '#00ff88', text: '#00ff88' },
  Info:     { bg: '#00d4ff22', border: '#00d4ff', text: '#00d4ff' },
};

function SeverityBadge({ severity }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.Info;
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 rounded font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {severity}
    </span>
  );
}

function CVECard({ item }) {
  const s = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.Info;
  return (
    <div
      className="card hover:scale-[1.01] transition-transform duration-200"
      style={{ borderColor: `${s.border}44` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-sm font-bold"
            style={{ color: s.text }}
          >
            {item.id}
          </span>
          <SeverityBadge severity={item.severity} />
          {item.cvss && (
            <span className="font-mono text-xs text-gray-500">CVSS {item.cvss}</span>
          )}
        </div>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-primary transition-colors flex-shrink-0"
          >
            <FiExternalLink size={14} />
          </a>
        )}
      </div>

      <h3 className="font-mono text-sm text-white mb-1">{item.title}</h3>
      {item.vendor && (
        <p className="font-mono text-xs text-gray-500 mb-2">
          <span className="text-primary/60">vendor:</span> {item.vendor}
        </p>
      )}
      {item.desc && (
        <p className="font-body text-sm text-gray-400 leading-relaxed">{item.desc}</p>
      )}
    </div>
  );
}

function BugBountyCard({ item }) {
  const s = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.Info;
  return (
    <div className="card hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="font-mono text-xs text-gray-500">{item.program}</span>
          <h3 className="font-mono text-sm text-white mt-0.5">{item.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <SeverityBadge severity={item.severity} />
          {item.reward && (
            <span className="font-mono text-xs font-bold" style={{ color: '#00ff88' }}>
              {item.reward}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {item.company && (
          <span className="font-mono text-xs text-gray-500">
            <span style={{ color: s.text }}>@</span> {item.company}
          </span>
        )}
        {item.date && (
          <span className="font-mono text-xs text-gray-600">{item.date}</span>
        )}
        {item.status && (
          <span
            className="font-mono text-xs px-2 py-0.5 rounded"
            style={{
              background: item.status === 'Resolved' ? '#00ff8822' : '#ffd70022',
              color:      item.status === 'Resolved' ? '#00ff88'   : '#ffd700',
              border:     `1px solid ${item.status === 'Resolved' ? '#00ff8844' : '#ffd70044'}`,
            }}
          >
            {item.status}
          </span>
        )}
      </div>
    </div>
  );
}

function DisclosureCard({ item }) {
  return (
    <div className="card hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-mono text-sm text-white">{item.title}</h3>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded flex-shrink-0"
          style={{
            background: item.status === 'Fixed' ? '#00ff8822' : '#00d4ff22',
            color:      item.status === 'Fixed' ? '#00ff88'   : '#00d4ff',
            border:     `1px solid ${item.status === 'Fixed' ? '#00ff8844' : '#00d4ff44'}`,
          }}
        >
          {item.status}
        </span>
      </div>
      {item.vendor && (
        <p className="font-mono text-xs text-gray-500 mb-2">
          <span className="text-primary/60">vendor:</span> {item.vendor}
          {item.date && <span className="ml-3 text-gray-600">{item.date}</span>}
        </p>
      )}
      {item.desc && (
        <p className="font-body text-sm text-gray-400 leading-relaxed">{item.desc}</p>
      )}
    </div>
  );
}

export default function HallOfFameSection() {
  const { config } = useSiteConfig();
  const hof = config.hallOfFame || {};

  const cves         = hof.cves         || [];
  const bugBounty    = hof.bugBounty    || [];
  const disclosures  = hof.disclosures  || [];

  const hasContent = cves.length || bugBounty.length || disclosures.length;
  if (!hasContent) return null;

  return (
    <section id="hall-of-fame" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// HALL OF FAME</p>
          <h2 className="section-title">Security Research</h2>
          <p className="section-subtitle">cat /var/log/nitesh/findings.log</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16">
          {[
            { icon: <FiAlertTriangle size={16} />, value: cves.length,        label: 'CVEs Found' },
            { icon: <FiAward size={16} />,         value: bugBounty.length,   label: 'Bug Bounties' },
            { icon: <FiShield size={16} />,        value: disclosures.length, label: 'Disclosures' },
          ].map((s) => (
            <div key={s.label} className="card text-center py-5">
              <div className="flex justify-center mb-2 text-primary">{s.icon}</div>
              <div className="font-display text-2xl font-bold text-primary mb-1">{s.value}</div>
              <div className="font-mono text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CVEs */}
        {cves.length > 0 && (
          <div className="mb-14">
            <h3 className="font-mono text-xs text-primary mb-6 tracking-widest flex items-center gap-2">
              <FiAlertTriangle size={12} />
              // CVE_DISCOVERIES ({cves.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cves.map((item, i) => <CVECard key={i} item={item} />)}
            </div>
          </div>
        )}

        {/* Bug Bounty */}
        {bugBounty.length > 0 && (
          <div className="mb-14">
            <h3 className="font-mono text-xs text-primary mb-6 tracking-widest flex items-center gap-2">
              <FiAward size={12} />
              // BUG_BOUNTY_FINDINGS ({bugBounty.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bugBounty.map((item, i) => <BugBountyCard key={i} item={item} />)}
            </div>
          </div>
        )}

        {/* Responsible Disclosures */}
        {disclosures.length > 0 && (
          <div>
            <h3 className="font-mono text-xs text-primary mb-6 tracking-widest flex items-center gap-2">
              <FiShield size={12} />
              // RESPONSIBLE_DISCLOSURES ({disclosures.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disclosures.map((item, i) => <DisclosureCard key={i} item={item} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
