import { useState, useEffect } from 'react';
import { FiExternalLink, FiClock, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api';
import { useSiteConfig } from '../../context/SiteConfigContext';

const FALLBACK = [
  { title: 'Critical Vulnerability Found in OpenSSL', description: 'Researchers have discovered a critical buffer overflow vulnerability in OpenSSL that could allow remote code execution on affected systems.', source: { name: 'Krebs on Security' }, publishedAt: new Date().toISOString(), url: 'https://krebsonsecurity.com' },
  { title: 'CISA Adds New CVEs to Exploited Vulnerabilities Catalog', description: 'CISA has added new CVEs to its KEV catalog, urging federal agencies and organisations to apply patches immediately.', source: { name: 'CISA' }, publishedAt: new Date().toISOString(), url: 'https://cisa.gov' },
  { title: 'Purple Team Exercises Gaining Ground in Enterprise Security', description: 'Organisations are increasingly adopting purple team exercises that combine red and blue team approaches for better security validation.', source: { name: 'Dark Reading' }, publishedAt: new Date().toISOString(), url: 'https://darkreading.com' },
  { title: 'TryHackMe Releases New Penetration Testing Learning Path', description: 'The popular cybersecurity training platform released an updated penetration testing path covering modern attack techniques.', source: { name: 'TryHackMe Blog' }, publishedAt: new Date().toISOString(), url: 'https://tryhackme.com' },
  { title: 'OWASP Top 10 Updated for 2025', description: 'The latest OWASP Top 10 update includes new categories reflecting emerging threats in web application security.', source: { name: 'OWASP' }, publishedAt: new Date().toISOString(), url: 'https://owasp.org' },
  { title: 'Red Hat Expands Security Certifications Portfolio', description: 'Red Hat announces new security-focused certifications building on the RH124 foundation to address enterprise security demands.', source: { name: 'Red Hat Blog' }, publishedAt: new Date().toISOString(), url: 'https://redhat.com' },
];

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function normalise(item) {
  return {
    title:       item.title,
    description: item.description,
    source:      { name: item.source?.name || item.source || 'CyberSec' },
    publishedAt: item.publishedAt,
    url:         item.url,
  };
}

export default function NewsSection() {
  const { config } = useSiteConfig();
  const customNews = config.customNews || [];

  const [news,    setNews]    = useState(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [usingCustom, setUsingCustom] = useState(false);

  const fetchLive = () => {
    setLoading(true);
    api.get('/news')
      .then((r) => { if (r.data.articles?.length) setNews(r.data.articles.slice(0, 6)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customNews.length > 0) {
      setNews(customNews.map(normalise));
      setUsingCustom(true);
    } else {
      setUsingCustom(false);
      fetchLive();
    }
  }, [customNews.length]);

  return (
    <section id="news" className="py-24 px-6 relative z-10 bg-darker/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 07. CYBER NEWS</p>
          <h2 className="section-title">Security News</h2>
          <p className="section-subtitle">curl -s https://api.cybernews/latest | jq</p>
        </div>

        {!usingCustom && (
          <div className="flex justify-end mb-5">
            <button
              onClick={fetchLive}
              disabled={loading}
              className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-primary
                         border border-border hover:border-primary/40 px-4 py-2 rounded transition-all"
            >
              <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'fetching...' : 'refresh --feed'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-primary/70 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                  {a.source?.name || 'CyberSec'}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
                  <FiClock size={10} /> {timeAgo(a.publishedAt)}
                </span>
              </div>
              <h3 className="font-display text-sm font-bold text-white leading-snug mb-3 flex-1 hover:text-primary transition-colors">
                {a.title}
              </h3>
              <p className="font-body text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                {a.description}
              </p>
              <div className="flex items-center gap-1 font-mono text-xs text-primary/50 hover:text-primary transition-colors pt-3 border-t border-border mt-auto">
                Read more <FiExternalLink size={10} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
