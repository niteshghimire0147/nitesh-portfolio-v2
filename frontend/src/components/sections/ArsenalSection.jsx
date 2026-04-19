import { useSiteConfig } from '../../context/SiteConfigContext';

const LEVEL_COLOR = {
  Expert:       '#00d4ff',
  Advanced:     '#0066ff',
  Intermediate: '#00ff88',
  Beginner:     '#ffd700',
};

export default function ArsenalSection() {
  const { config } = useSiteConfig();
  const categories = config.arsenal || [];
  if (!categories.length) return null;

  return (
    <section id="arsenal" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// TOOLS & ARSENAL</p>
          <h2 className="section-title">My Arsenal</h2>
          <p className="section-subtitle">ls -la ~/tools/ | grep executable</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat, ci) => (
            <div key={ci} className="card flex flex-col gap-4" style={{ borderColor: `${cat.color}33` }}>
              {/* Category header */}
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <span className="text-lg">{cat.emoji}</span>
                <span
                  className="font-mono text-xs font-bold tracking-wider"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </span>
              </div>

              {/* Tools */}
              <div className="space-y-2.5">
                {(cat.tools || []).map((tool, ti) => (
                  <div key={ti} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-white truncate">{tool.name}</div>
                      {tool.desc && (
                        <div className="font-mono text-xs text-gray-600 truncate">{tool.desc}</div>
                      )}
                    </div>
                    {tool.level && (
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded flex-shrink-0"
                        style={{
                          color: LEVEL_COLOR[tool.level] || '#8892a4',
                          background: `${LEVEL_COLOR[tool.level] || '#8892a4'}18`,
                          border: `1px solid ${LEVEL_COLOR[tool.level] || '#8892a4'}33`,
                        }}
                      >
                        {tool.level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
