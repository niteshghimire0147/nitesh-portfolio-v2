import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck, FiKey } from 'react-icons/fi';

const PGP_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

[Add your PGP public key here.
Run: gpg --full-generate-key
Then: gpg --armor --export your@email.com]

-----END PGP PUBLIC KEY BLOCK-----`;

const FINGERPRINT = 'XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX XXXX';

export default function PGPKey() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(PGP_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// ENCRYPTION</p>
          <h1 className="section-title flex items-center justify-center gap-3">
            <FiKey className="text-primary" />
            PGP Public Key
          </h1>
          <p className="section-subtitle">gpg --recv-keys</p>
        </div>

        {/* Key info */}
        <div className="card mb-6 space-y-3">
          {[
            { label: 'Name',        value: 'Nitesh Ghimire' },
            { label: 'Email',       value: 'ghimirenitesh8@gmail.com' },
            { label: 'Key Type',    value: 'RSA 4096 / Ed25519' },
            { label: 'Fingerprint', value: FINGERPRINT },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4 font-mono text-sm">
              <span className="text-primary w-24 flex-shrink-0">{label}:</span>
              <span className="text-gray-300 break-all">{value}</span>
            </div>
          ))}
        </div>

        {/* Key block */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <span className="font-mono text-xs text-primary tracking-widest">// PUBLIC_KEY_BLOCK</span>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded border transition-all"
              style={{
                borderColor: copied ? '#00ff8844' : '#00d4ff33',
                color:       copied ? '#00ff88'   : '#00d4ff',
                background:  copied ? '#00ff8811' : 'transparent',
              }}
            >
              {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
          <pre
            className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-all"
            style={{ background: '#060a14', padding: '1rem', borderRadius: '4px' }}
          >
            {PGP_KEY}
          </pre>
        </div>

        {/* Usage instructions */}
        <div className="card mt-6">
          <h2 className="font-mono text-xs text-primary mb-4 tracking-widest">// HOW TO ENCRYPT</h2>
          <div className="font-mono text-xs text-gray-500 space-y-2 leading-relaxed">
            <p><span className="text-primary">$</span> gpg --import nitesh_public.asc</p>
            <p><span className="text-primary">$</span> gpg --encrypt --recipient ghimirenitesh8@gmail.com message.txt</p>
            <p className="text-gray-700 mt-3">
              # Or use ProtonMail / Signal for end-to-end encrypted communication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
