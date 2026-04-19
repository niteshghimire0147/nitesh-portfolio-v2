import { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function SkillsSection() {
  const { config } = useSiteConfig();
  const { categories = [], badges = [] } = config.skills;
  const [active, setActive] = useState(0);
  const cat = categories[active] || categories[0];

  if (!cat) return null;

  return (
    <section id="skills" className="py-24 px-6 relative z-10 bg-darker/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 02. SKILLS</p>
          <h2 className="section-title">Technical Skills</h2>
          <p className="section-subtitle">ls -la /skills/ --verbose</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((c, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-5 py-2 font-mono text-xs rounded border transition-all duration-200 ${
                active === i
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-gray-500 hover:border-primary/40 hover:text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Bars */}
        <div className="card max-w-xl mx-auto mb-12">
          <h3 className="font-mono text-xs text-primary mb-6 tracking-wider">{cat.label?.toUpperCase()}</h3>
          <div className="space-y-5">
            {(cat.items || []).map((sk) => (
              <div key={sk.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-sm text-gray-300">{sk.name}</span>
                  <span className="font-mono text-xs text-primary">{sk.pct}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${sk.pct}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                      boxShadow: `0 0 8px ${cat.color}55`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge cloud */}
        {badges.length > 0 && (
          <div className="text-center">
            <p className="font-mono text-xs text-gray-600 mb-5">// TOOLS & TECHNOLOGIES</p>
            <div className="flex flex-wrap justify-center gap-2">
              {badges.map((b) => (
                <span key={b} className="tag hover:bg-primary/10 transition-colors cursor-default">{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
