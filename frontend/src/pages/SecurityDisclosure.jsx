import { Link } from 'react-router-dom';
import { FiShield, FiMail, FiArrowLeft } from 'react-icons/fi';

export default function SecurityDisclosure() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-primary transition-colors mb-10"
        >
          <FiArrowLeft size={14} /> cd ~/
        </Link>

        <div className="text-center mb-12">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// SECURITY.TXT</p>
          <h1 className="section-title flex items-center justify-center gap-3">
            <FiShield className="text-primary" />
            Responsible Disclosure
          </h1>
          <p className="section-subtitle">cat /.well-known/security.txt</p>
        </div>

        {/* security.txt content */}
        <div className="card mb-8">
          <div className="bg-card px-4 py-3 flex items-center gap-2 border-b border-border -mx-6 -mt-6 mb-6 rounded-t-lg">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 font-mono text-xs text-gray-500">/.well-known/security.txt</span>
          </div>
          <pre className="font-mono text-sm text-gray-300 leading-8 whitespace-pre-wrap">
{`Contact: mailto:ghimirenitesh8@gmail.com
Preferred-Languages: en
Policy: https://niteshghimire.dev/security-disclosure
Acknowledgments: https://niteshghimire.dev/hall-of-fame
Encryption: https://niteshghimire.dev/pgp`}
          </pre>
        </div>

        {/* Policy sections */}
        <div className="space-y-6">
          {[
            {
              title: '// Scope',
              content: `I welcome responsible disclosure of security vulnerabilities in any systems I own or operate.
If you've found a bug that affects real users or data, I want to know about it.`,
            },
            {
              title: '// What to report',
              content: `✔ XSS, CSRF, SQLi, RCE, authentication bypass
✔ IDOR, privilege escalation, sensitive data exposure
✔ Misconfigurations with security impact
✘ DoS / DDoS attacks
✘ Social engineering attacks
✘ Physical security issues`,
            },
            {
              title: '// Process',
              content: `1. Email ghimirenitesh8@gmail.com with subject: [SECURITY] Your Finding
2. Include: description, steps to reproduce, impact assessment, your contact info
3. I will respond within 72 hours to acknowledge receipt
4. I will keep you updated on the remediation timeline
5. Public disclosure coordinated after fix is deployed`,
            },
            {
              title: '// Safe Harbour',
              content: `I commit to not pursue legal action against researchers who:
— Act in good faith and follow this policy
— Avoid accessing or modifying user data
— Do not perform DoS or disruptive testing
— Report findings before public disclosure`,
            },
            {
              title: '// Recognition',
              content: `Verified findings will be acknowledged in the Hall of Fame section of this portfolio.
I currently do not offer monetary bounties, but I provide public credit and a letter of recognition on request.`,
            },
          ].map((sec) => (
            <div key={sec.title} className="card">
              <h2 className="font-mono text-xs text-primary mb-4 tracking-widest">{sec.title}</h2>
              <p className="font-mono text-sm text-gray-400 leading-relaxed whitespace-pre-line">{sec.content}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 card text-center border-primary/30">
          <FiMail className="text-primary mx-auto mb-3" size={24} />
          <p className="font-mono text-sm text-gray-400 mb-4">Found a vulnerability? Send a report.</p>
          <a
            href="mailto:ghimirenitesh8@gmail.com?subject=[SECURITY] Vulnerability Report"
            className="btn-primary"
          >
            Send Security Report
          </a>
        </div>
      </div>
    </div>
  );
}
