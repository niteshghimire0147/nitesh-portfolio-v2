import { useSiteConfig } from '../../context/SiteConfigContext';

export default function ExperienceSection() {
  const { config } = useSiteConfig();
  const experience = config.experience || [];

  return (
    <section id="experience" className="py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 03. EXPERIENCE</p>
          <h2 className="section-title">Experience</h2>
          <p className="section-subtitle">cat /var/log/career.log</p>
        </div>

        <div className="space-y-6">
          {experience.map((exp, i) => (
            <div
              key={i}
              className="card relative pl-5 border-l-2 transition-all duration-300 hover:border-l-primary"
              style={{ borderLeftColor: exp.color }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <span
                    className="inline-block font-mono text-xs px-2 py-0.5 rounded border mb-2"
                    style={{ color: exp.color, borderColor: `${exp.color}44`, background: `${exp.color}11` }}
                  >
                    {exp.type}
                  </span>
                  <h3 className="font-display text-base font-bold text-white">{exp.role}</h3>
                  <p className="font-mono text-xs text-primary mt-0.5">{exp.company}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-gray-500">{exp.duration}</p>
                  <p className="font-mono text-xs text-gray-600">{exp.location}</p>
                </div>
              </div>
              <ul className="space-y-1.5 mt-3">
                {(exp.tasks || []).map((t, j) => (
                  <li key={j} className="flex items-start gap-2 font-mono text-xs text-gray-400">
                    <span style={{ color: exp.color }} className="mt-0.5 flex-shrink-0">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
