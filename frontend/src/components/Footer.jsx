import { FiGithub, FiLinkedin, FiMail, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-darker border-t border-border pt-14 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiShield className="text-primary" size={18} />
              <span className="font-display text-sm text-primary tracking-widest">NITESH GHIMIRE</span>
            </div>
            <p className="font-mono text-xs text-gray-500 leading-relaxed">
              Cybersecurity professional specializing in penetration testing &amp; Purple Team
              operations. Based in Bhaktapur, Nepal.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-xs text-primary mb-4 tracking-widest">// QUICK_LINKS</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['/#about',          'about'],
                ['/#skills',         'skills'],
                ['/#projects',       'projects'],
                ['/#hall-of-fame',   'hall of fame'],
                ['/blog',            'blog'],
                ['/ctf',             'ctf'],
                ['/#contact',        'contact'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="font-mono text-xs text-gray-500 hover:text-primary transition-colors"
                >
                  <span className="text-primary/40 mr-1">›</span> {label}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-mono text-xs text-primary mb-4 tracking-widest">// CONNECT</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/niteshghimire0147"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-primary transition-colors"
              >
                <FiGithub size={13} /> github.com/niteshghimire0147
              </a>
              <a
                href="https://www.linkedin.com/in/nitesh-ghimire-694104382/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-primary transition-colors"
              >
                <FiLinkedin size={13} /> linkedin/in/nitesh-ghimire
              </a>
              <a
                href="mailto:ghimirenitesh8@gmail.com"
                className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-primary transition-colors"
              >
                <FiMail size={13} /> ghimirenitesh8@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Security links */}
        <div className="border-t border-border pt-6 mb-4 flex flex-wrap justify-center gap-6">
          <a
            href="/security-disclosure"
            className="flex items-center gap-1.5 font-mono text-xs text-gray-600 hover:text-primary transition-colors"
          >
            <FiAlertTriangle size={11} /> Responsible Disclosure
          </a>
        </div>

        <div className="flex items-center justify-center">
          <p className="font-mono text-xs text-gray-700">
            <span className="text-primary/50">$</span> echo &quot;© {year} Nitesh Ghimire&quot;
          </p>
        </div>
      </div>
    </footer>
  );
}
