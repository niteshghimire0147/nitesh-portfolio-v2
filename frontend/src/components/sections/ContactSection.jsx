import { useState } from 'react';
import { FiMail, FiGithub, FiLinkedin, FiPhone, FiMapPin, FiSend, FiShield } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useSiteConfig } from '../../context/SiteConfigContext';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function ContactSection() {
  const { config } = useSiteConfig();
  const c = config.contact;

  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success("Message sent! I'll get back to you soon.");
      setForm(EMPTY);
    } catch {
      toast.error('Failed to send. Please email me directly.');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: FiMail,   label: 'Email',    value: c.email,    href: `mailto:${c.email}` },
    { icon: FiPhone,  label: 'Phone',    value: c.phone,    href: `tel:${c.phone}` },
    { icon: FiMapPin, label: 'Location', value: c.location, href: null },
  ];

  const socialLinks = [
    { icon: FiGithub,   href: c.github },
    { icon: FiLinkedin, href: c.linkedin },
    { icon: FiShield,   href: c.hackthebox },
    { icon: FiMail,     href: `mailto:${c.email}` },
  ].filter(s => s.href);

  return (
    <section id="contact" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 08. CONTACT</p>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">nc -lvnp 4444  # waiting for connection...</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-5">Let's Connect</h3>
            <p className="font-body text-lg text-gray-400 leading-relaxed mb-8">
              Whether you have an opportunity, a security question, or just want to say hi —
              my inbox is always open. I respond within 24 hours.
            </p>

            <div className="space-y-4 mb-8">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors rounded flex-shrink-0">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-gray-600 mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="font-mono text-sm text-gray-300 hover:text-primary transition-colors">
                        {value}
                      </a>
                    ) : (
                      <span className="font-mono text-sm text-gray-300">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-11 h-11 border border-border flex items-center justify-center text-gray-500
                             hover:text-primary hover:border-primary/50 rounded transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card space-y-4">
            <p className="font-mono text-xs text-gray-600 mb-2">
              <span className="text-primary">$</span> ./send_message.sh --to nitesh
            </p>

            {[
              { key: 'name',    label: 'name',    type: 'text',  placeholder: 'Your Name' },
              { key: 'email',   label: 'email',   type: 'email', placeholder: 'your@email.com' },
              { key: 'subject', label: 'subject', type: 'text',  placeholder: 'Subject / Opportunity' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block font-mono text-xs text-gray-500 mb-1.5">
                  <span className="text-primary">--</span>{f.label}
                </label>
                <input
                  required
                  type={f.type}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  placeholder={f.placeholder}
                  className="input"
                />
              </div>
            ))}

            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">--</span>message
              </label>
              <textarea
                required rows={5}
                value={form.message}
                onChange={set('message')}
                placeholder="Your message..."
                className="input resize-none"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full gap-2 disabled:opacity-50">
              <FiSend size={15} />
              {loading ? 'sending...' : 'send_message()'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
