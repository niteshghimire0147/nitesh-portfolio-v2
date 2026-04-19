import { useSiteConfig } from '../../context/SiteConfigContext';

export default function AboutSection() {
  const { config } = useSiteConfig();
  const a = config.about;

  const profileRows = [
    ['name',      `"${a.name}"`],
    ['location',  `"${a.location}"`],
    ['education', `"${a.education}"`],
    ['focus',     `"${a.focus}"`],
    ['goal',      `"${a.goal}"`],
    ['phone',     `"${a.phone}"`],
    ['status',    `"${a.status}"`],
  ];

  return (
    <section id="about" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 01. ABOUT</p>
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">cat /etc/nitesh/profile.txt</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Terminal card */}
          <div className="glow-border rounded-lg overflow-hidden">
            <div className="bg-card px-4 py-3 flex items-center gap-2 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 font-mono text-xs text-gray-500">~/profile.js</span>
            </div>
            <div className="bg-dark p-6 font-mono text-sm space-y-1 leading-7">
              <div><span className="text-blue-400">const </span><span className="text-white">nitesh</span><span className="text-gray-400"> = {'{'}</span></div>
              {profileRows.map(([k, v]) => (
                <div key={k} className="pl-4">
                  <span className="text-green-300">{k}</span>
                  <span className="text-gray-400">: </span>
                  <span className="text-yellow-300">{v}</span>
                  <span className="text-gray-400">,</span>
                </div>
              ))}
              <div><span className="text-gray-400">{'}'}</span></div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-5">
            {(a.bio || []).map((para, i) => (
              <p key={i} className="font-body text-lg text-gray-400 leading-relaxed">
                {para}
              </p>
            ))}

            {(a.highlights || []).length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4">
                {a.highlights.map((item) => (
                  <div key={item.title} className="card flex flex-col items-center text-center gap-2 py-5">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-display text-xs font-bold text-primary">{item.title}</span>
                    <span className="font-mono text-xs text-gray-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
