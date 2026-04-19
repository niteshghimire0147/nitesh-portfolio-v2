import { useState, useEffect } from 'react';
import { FiGithub, FiLinkedin, FiChevronDown, FiDownload } from 'react-icons/fi';

const ROLES = [
  'Penetration Tester',
  'Security Researcher',
  'Purple Team Operator',
  'VAPT Specialist',
  'CTF Player',
];

export default function HeroSection() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const role = ROLES[roleIdx];
    let t;
    if (!deleting && charIdx < role.length) {
      t = setTimeout(() => { setText(role.slice(0, charIdx + 1)); setCharIdx((c) => c + 1); }, 80);
    } else if (!deleting && charIdx === role.length) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => { setText(role.slice(0, charIdx - 1)); setCharIdx((c) => c - 1); }, 45);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setRoleIdx((i) => (i + 1) % ROLES.length);
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, roleIdx]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Binary decoration */}
      <div className="absolute top-24 right-8 opacity-[0.06] font-mono text-xs text-primary leading-6 select-none hidden xl:block" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i}>{Array.from({ length: 10 }, () => (Math.random() > 0.5 ? '1' : '0')).join(' ')}</div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">

        {/* Terminal bar */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-border rounded font-mono text-xs text-gray-500 bg-card">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 text-gray-600">nitesh@kali:~$</span>
          <span className="text-primary">whoami</span>
        </div>

        {/* Name */}
        <h1 className="font-display font-black tracking-wider leading-none mb-1">
          <span className="block text-5xl md:text-7xl text-primary animate-glow">NITESH</span>
          <span className="block text-5xl md:text-7xl text-white mt-1">GHIMIRE</span>
        </h1>

        {/* Typewriter */}
        <div className="font-mono text-xl md:text-2xl text-gray-400 mt-7 mb-5 h-9 flex items-center justify-center gap-2">
          <span className="text-primary">›</span>
          <span>{text}</span>
          <span className="inline-block w-0.5 h-5 bg-primary animate-blink" />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 font-mono text-xs text-gray-500">
          <span>📍 Bhaktapur, Nepal</span>
          <span className="hidden sm:inline text-border">|</span>
          <span><span className="text-green-400">●</span> Open to opportunities</span>
          <span className="hidden sm:inline text-border">|</span>
          <span>🎓 APU — B.Sc IT (Ongoing)</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a href="#contact" className="btn-primary gap-2">
            ./contact.sh
          </a>
          <a
            href="/NITESH_GHIMIRE-Resume.pdf"
            download="NITESH_GHIMIRE-Resume.pdf"
            className="btn-ghost gap-2"
          >
            <FiDownload size={15} /> Resume
          </a>
          <a
            href="https://github.com/niteshghimire0147"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost gap-2"
          >
            <FiGithub size={15} /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/nitesh-ghimire-694104382/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost gap-2"
          >
            <FiLinkedin size={15} /> LinkedIn
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-14">
          {[
            { value: '1+', label: 'Yr Experience' },
            { value: '4+', label: 'Certifications' },
            { value: '🥈', label: 'HackXLbef CTF' },
          ].map((s) => (
            <div key={s.label} className="card text-center py-5">
              <div className="font-display text-2xl font-bold text-primary mb-1">{s.value}</div>
              <div className="font-mono text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* HTB / THM badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <a
            href="https://tryhackme.com/p/niteshghimire"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border font-mono text-xs transition-all hover:scale-105"
            style={{ borderColor: '#00d4ff33', background: '#0d152688', color: '#8892a4' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#00d4ff88'; e.currentTarget.style.color = '#00d4ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#00d4ff33'; e.currentTarget.style.color = '#8892a4'; }}
          >
            <img
              src="https://tryhackme-badges.s3.amazonaws.com/niteshghimire.png"
              alt="TryHackMe"
              style={{ height: '20px', borderRadius: '2px' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <span>TryHackMe Profile</span>
          </a>
          <a
            href="https://app.hackthebox.com/profile/niteshghimire"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border font-mono text-xs transition-all hover:scale-105"
            style={{ borderColor: '#9fef0033', background: '#0d152688', color: '#8892a4' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9fef0088'; e.currentTarget.style.color = '#9fef00'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#9fef0033'; e.currentTarget.style.color = '#8892a4'; }}
          >
            <span style={{ color: '#9fef00', fontSize: '16px' }}>⬡</span>
            <span>HackTheBox Profile</span>
          </a>
        </div>

        {/* Scroll hint */}
        <a href="#about" className="inline-flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors">
          <span className="font-mono text-xs">scroll --down</span>
          <FiChevronDown size={18} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}
