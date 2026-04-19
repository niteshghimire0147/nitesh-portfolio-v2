import { useSiteConfig } from '../../context/SiteConfigContext';

export default function CertificationsSection() {
  const { config } = useSiteConfig();
  const { items = [], achievement } = config.certifications;

  return (
    <section id="certifications" className="py-24 px-6 relative z-10 bg-darker/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 05. CERTIFICATIONS</p>
          <h2 className="section-title">Certifications</h2>
          <p className="section-subtitle">cat ~/certs/*.json | jq '.[]'</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {items.map((c, i) => (
            <div
              key={i}
              className="card group relative overflow-hidden hover:border-primary/40 transition-all duration-300"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
                style={{ background: c.color, boxShadow: `0 0 10px ${c.color}55` }}
              />
              <div className="pl-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl flex-shrink-0">{c.icon}</span>
                  <div>
                    {c.link ? (
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug hover:underline"
                      >
                        {c.title}
                      </a>
                    ) : (
                      <h3 className="font-display text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug">
                        {c.title}
                      </h3>
                    )}
                    <p className="font-mono text-xs mt-0.5" style={{ color: c.color }}>
                      {c.issuer}
                    </p>
                  </div>
                </div>
                <p className="font-body text-sm text-gray-400 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {achievement?.title && (
          <div className="card border-yellow-500/30 bg-yellow-500/5 text-center py-8">
            <div className="text-4xl mb-3">{achievement.emoji}</div>
            <h3 className="font-display text-lg font-bold text-yellow-400 mb-2">
              {achievement.title}
            </h3>
            <p className="font-mono text-sm text-gray-400">{achievement.desc}</p>
          </div>
        )}
      </div>
    </section>
  );
}
