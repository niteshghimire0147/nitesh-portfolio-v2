import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { DEFAULT_CONFIG } from '../../context/SiteConfigContext';

const TABS = ['About', 'Skills', 'Experience', 'Certifications', 'Contact', 'News', 'Hall of Fame'];

// ─── helpers ───────────────────────────────────────────────────────────────

function Field({ label, value, onChange, textarea, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block font-mono text-xs text-gray-500 mb-1.5">
        <span className="text-primary">--</span>{label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input resize-none w-full"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input w-full"
        />
      )}
    </div>
  );
}

function SaveBtn({ saving, onClick, label = 'Save Changes' }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="btn-primary gap-2 disabled:opacity-50"
    >
      <FiSave size={14} />
      {saving ? 'saving...' : label}
    </button>
  );
}

// ─── About Tab ─────────────────────────────────────────────────────────────

function AboutTab({ data, setData, onSave, saving }) {
  const set = (k) => (v) => setData(d => ({ ...d, [k]: v }));

  const setBio = (i, v) => setData(d => {
    const bio = [...d.bio];
    bio[i] = v;
    return { ...d, bio };
  });
  const addBio    = () => setData(d => ({ ...d, bio: [...d.bio, ''] }));
  const removeBio = (i) => setData(d => ({ ...d, bio: d.bio.filter((_, j) => j !== i) }));

  const setHL = (i, k, v) => setData(d => {
    const h = d.highlights.map((x, j) => j === i ? { ...x, [k]: v } : x);
    return { ...d, highlights: h };
  });
  const addHL    = () => setData(d => ({ ...d, highlights: [...d.highlights, { emoji: '⭐', title: '', desc: '' }] }));
  const removeHL = (i) => setData(d => ({ ...d, highlights: d.highlights.filter((_, j) => j !== i) }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-mono text-xs text-primary mb-4 tracking-widest">// PROFILE FIELDS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="name"     value={data.name}     onChange={set('name')} />
          <Field label="location" value={data.location} onChange={set('location')} />
          <Field label="education"value={data.education}onChange={set('education')} />
          <Field label="focus"    value={data.focus}    onChange={set('focus')} />
          <Field label="goal"     value={data.goal}     onChange={set('goal')} />
          <Field label="phone"    value={data.phone}    onChange={set('phone')} />
          <Field label="status"   value={data.status}   onChange={set('status')} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs text-primary tracking-widest">// BIO PARAGRAPHS</h3>
          <button onClick={addBio} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
            <FiPlus size={12} /> Add Paragraph
          </button>
        </div>
        <div className="space-y-3">
          {data.bio.map((para, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                rows={3}
                value={para}
                onChange={e => setBio(i, e.target.value)}
                className="input resize-none flex-1"
                placeholder={`Paragraph ${i + 1}`}
              />
              <button onClick={() => removeBio(i)} className="text-red-400/60 hover:text-red-400 p-2 transition-colors flex-shrink-0">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs text-primary tracking-widest">// HIGHLIGHTS</h3>
          <button onClick={addHL} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
            <FiPlus size={12} /> Add Highlight
          </button>
        </div>
        <div className="space-y-3">
          {data.highlights.map((h, i) => (
            <div key={i} className="card flex gap-3 items-start">
              <input value={h.emoji} onChange={e => setHL(i, 'emoji', e.target.value)} className="input w-16 text-center" placeholder="🎓" />
              <input value={h.title} onChange={e => setHL(i, 'title', e.target.value)} className="input flex-1" placeholder="Title" />
              <input value={h.desc}  onChange={e => setHL(i, 'desc',  e.target.value)} className="input flex-1" placeholder="Description" />
              <button onClick={() => removeHL(i)} className="text-red-400/60 hover:text-red-400 p-2 transition-colors">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ─── Skills Tab ────────────────────────────────────────────────────────────

function SkillsTab({ data, setData, onSave, saving }) {
  const [open, setOpen] = useState(null);

  const setCat = (i, k, v) => setData(d => ({
    ...d,
    categories: d.categories.map((c, j) => j === i ? { ...c, [k]: v } : c),
  }));
  const addCat = () => setData(d => ({
    ...d,
    categories: [...d.categories, { label: 'New Category', color: '#00d4ff', items: [] }],
  }));
  const removeCat = (i) => setData(d => ({ ...d, categories: d.categories.filter((_, j) => j !== i) }));

  const setItem = (ci, ii, k, v) => setData(d => ({
    ...d,
    categories: d.categories.map((c, j) =>
      j === ci ? { ...c, items: c.items.map((it, k2) => k2 === ii ? { ...it, [k]: k === 'pct' ? Number(v) : v } : it) } : c
    ),
  }));
  const addItem = (ci) => setData(d => ({
    ...d,
    categories: d.categories.map((c, j) =>
      j === ci ? { ...c, items: [...c.items, { name: '', pct: 50 }] } : c
    ),
  }));
  const removeItem = (ci, ii) => setData(d => ({
    ...d,
    categories: d.categories.map((c, j) =>
      j === ci ? { ...c, items: c.items.filter((_, k) => k !== ii) } : c
    ),
  }));

  const setBadges = (v) => setData(d => ({
    ...d,
    badges: v.split(',').map(b => b.trim()).filter(Boolean),
  }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs text-primary tracking-widest">// SKILL CATEGORIES</h3>
          <button onClick={addCat} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
            <FiPlus size={12} /> Add Category
          </button>
        </div>
        <div className="space-y-3">
          {data.categories.map((cat, ci) => (
            <div key={ci} className="card">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setOpen(open === ci ? null : ci)} className="text-gray-500 hover:text-primary transition-colors">
                  {open === ci ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </button>
                <input value={cat.label} onChange={e => setCat(ci, 'label', e.target.value)} className="input flex-1" placeholder="Category label" />
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs text-gray-500">color</label>
                  <input type="color" value={cat.color} onChange={e => setCat(ci, 'color', e.target.value)} className="w-8 h-8 rounded border border-border bg-transparent cursor-pointer" />
                </div>
                <button onClick={() => removeCat(ci)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>

              {open === ci && (
                <div className="pl-6 space-y-2 mt-3 border-t border-border pt-3">
                  {cat.items.map((it, ii) => (
                    <div key={ii} className="flex gap-2 items-center">
                      <input value={it.name} onChange={e => setItem(ci, ii, 'name', e.target.value)} className="input flex-1" placeholder="Skill name" />
                      <input type="number" min="0" max="100" value={it.pct} onChange={e => setItem(ci, ii, 'pct', e.target.value)} className="input w-20" placeholder="%" />
                      <span className="font-mono text-xs text-primary w-8">{it.pct}%</span>
                      <button onClick={() => removeItem(ci, ii)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addItem(ci)} className="flex items-center gap-1 font-mono text-xs text-primary/60 hover:text-primary transition-colors mt-2">
                    <FiPlus size={12} /> Add Skill
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-mono text-xs text-primary mb-3 tracking-widest">// BADGES (comma-separated)</h3>
        <textarea
          rows={3}
          value={data.badges.join(', ')}
          onChange={e => setBadges(e.target.value)}
          className="input resize-none w-full"
          placeholder="TryHackMe, Nmap, Burp Suite, ..."
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ─── Experience Tab ────────────────────────────────────────────────────────

function ExperienceTab({ data, setData, onSave, saving }) {
  const [open, setOpen] = useState(null);

  const setExp = (i, k, v) => setData(d => d.map((e, j) => j === i ? { ...e, [k]: v } : e));
  const addExp = () => setData(d => [...d, { role: '', company: '', duration: '', location: '', type: '', color: '#00d4ff', tasks: [] }]);
  const removeExp = (i) => setData(d => d.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs text-primary tracking-widest">// EXPERIENCE ENTRIES</h3>
        <button onClick={addExp} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
          <FiPlus size={12} /> Add Entry
        </button>
      </div>

      {data.map((exp, i) => (
        <div key={i} className="card">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setOpen(open === i ? null : i)} className="text-gray-500 hover:text-primary transition-colors">
              {open === i ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
            <span className="font-mono text-sm text-white flex-1">{exp.role || 'Untitled'}</span>
            <span className="font-mono text-xs text-gray-500">{exp.company}</span>
            <button onClick={() => removeExp(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
              <FiTrash2 size={14} />
            </button>
          </div>

          {open === i && (
            <div className="space-y-3 border-t border-border pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="role"     value={exp.role}     onChange={v => setExp(i, 'role',     v)} />
                <Field label="company"  value={exp.company}  onChange={v => setExp(i, 'company',  v)} />
                <Field label="duration" value={exp.duration} onChange={v => setExp(i, 'duration', v)} />
                <Field label="location" value={exp.location} onChange={v => setExp(i, 'location', v)} />
                <Field label="type"     value={exp.type}     onChange={v => setExp(i, 'type',     v)} placeholder="Internship / Education / Competition" />
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">--</span>color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={exp.color || '#00d4ff'} onChange={e => setExp(i, 'color', e.target.value)} className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer" />
                    <span className="font-mono text-xs text-gray-500">{exp.color}</span>
                  </div>
                </div>
              </div>
              <Field
                label="tasks (one per line)"
                value={(exp.tasks || []).join('\n')}
                onChange={v => setExp(i, 'tasks', v.split('\n').filter(Boolean))}
                textarea
                placeholder="Task 1&#10;Task 2&#10;Task 3"
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ─── Certifications Tab ────────────────────────────────────────────────────

function CertificationsTab({ data, setData, onSave, saving }) {
  const [open, setOpen] = useState(null);

  const setCert = (i, k, v) => setData(d => ({
    ...d,
    items: d.items.map((c, j) => j === i ? { ...c, [k]: v } : c),
  }));
  const addCert = () => setData(d => ({
    ...d,
    items: [...d.items, { title: '', issuer: '', color: '#00d4ff', icon: '🏆', desc: '', link: '' }],
  }));
  const removeCert = (i) => setData(d => ({ ...d, items: d.items.filter((_, j) => j !== i) }));
  const setAch = (k, v) => setData(d => ({ ...d, achievement: { ...d.achievement, [k]: v } }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-xs text-primary tracking-widest">// CERTIFICATIONS</h3>
          <button onClick={addCert} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
            <FiPlus size={12} /> Add Cert
          </button>
        </div>
        <div className="space-y-3">
          {data.items.map((cert, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => setOpen(open === i ? null : i)} className="text-gray-500 hover:text-primary transition-colors">
                  {open === i ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </button>
                <span className="font-mono text-sm text-white flex-1">{cert.title || 'Untitled'}</span>
                <span className="font-mono text-xs text-gray-500">{cert.issuer}</span>
                <button onClick={() => removeCert(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>

              {open === i && (
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="title"  value={cert.title}  onChange={v => setCert(i, 'title',  v)} />
                    <Field label="issuer" value={cert.issuer} onChange={v => setCert(i, 'issuer', v)} />
                    <Field label="icon"   value={cert.icon}   onChange={v => setCert(i, 'icon',   v)} placeholder="🏆" />
                    <Field label="link"   value={cert.link}   onChange={v => setCert(i, 'link',   v)} placeholder="https://..." type="url" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">--</span>color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={cert.color || '#00d4ff'} onChange={e => setCert(i, 'color', e.target.value)} className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer" />
                      <span className="font-mono text-xs text-gray-500">{cert.color}</span>
                    </div>
                  </div>
                  <Field label="description" value={cert.desc} onChange={v => setCert(i, 'desc', v)} textarea />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-mono text-xs text-primary mb-4 tracking-widest">// ACHIEVEMENT BANNER</h3>
        <div className="card space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="emoji" value={data.achievement?.emoji || ''} onChange={v => setAch('emoji', v)} placeholder="🥈" />
            <div className="col-span-2">
              <Field label="title" value={data.achievement?.title || ''} onChange={v => setAch('title', v)} />
            </div>
          </div>
          <Field label="description" value={data.achievement?.desc || ''} onChange={v => setAch('desc', v)} textarea />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ─── Contact Tab ───────────────────────────────────────────────────────────

function ContactTab({ data, setData, onSave, saving }) {
  const set = (k) => (v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6">
      <h3 className="font-mono text-xs text-primary mb-4 tracking-widest">// CONTACT INFO</h3>
      <div className="card space-y-4">
        <Field label="email"    value={data.email}    onChange={set('email')}    type="email" />
        <Field label="phone"    value={data.phone}    onChange={set('phone')} />
        <Field label="location" value={data.location} onChange={set('location')} />
        <Field label="github"     value={data.github}     onChange={set('github')}     type="url" />
        <Field label="linkedin"   value={data.linkedin}   onChange={set('linkedin')}   type="url" />
        <Field label="hackthebox" value={data.hackthebox || ''} onChange={set('hackthebox')} type="url" placeholder="https://profile.hackthebox.com/profile/..." />
      </div>
      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ─── News Tab ──────────────────────────────────────────────────────────────

function NewsTab({ data, setData, onSave, saving }) {
  const [open, setOpen] = useState(null);

  const setItem = (i, k, v) => setData(d => d.map((n, j) => j === i ? { ...n, [k]: v } : n));
  const addItem = () => setData(d => [...d, { title: '', description: '', source: '', url: '', publishedAt: new Date().toISOString() }]);
  const removeItem = (i) => setData(d => d.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <div className="card border-primary/20 bg-primary/5 mb-6">
        <p className="font-mono text-xs text-gray-400 leading-relaxed">
          <span className="text-primary">// INFO:</span> If you add custom news articles here, they will replace the live NewsAPI feed on your portfolio.
          Leave empty to use the live cybersecurity news feed.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs text-primary tracking-widest">// CUSTOM NEWS ARTICLES ({data.length})</h3>
        <button onClick={addItem} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
          <FiPlus size={12} /> Add Article
        </button>
      </div>

      {data.length === 0 && (
        <p className="font-mono text-xs text-gray-600 text-center py-8">
          No custom articles — live NewsAPI feed is active.
        </p>
      )}

      {data.map((item, i) => (
        <div key={i} className="card">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setOpen(open === i ? null : i)} className="text-gray-500 hover:text-primary transition-colors">
              {open === i ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
            <span className="font-mono text-sm text-white flex-1 truncate">{item.title || 'Untitled'}</span>
            <span className="font-mono text-xs text-gray-500">{item.source}</span>
            <button onClick={() => removeItem(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
              <FiTrash2 size={14} />
            </button>
          </div>

          {open === i && (
            <div className="space-y-3 border-t border-border pt-3">
              <Field label="title"       value={item.title}       onChange={v => setItem(i, 'title',       v)} />
              <Field label="source name" value={item.source}      onChange={v => setItem(i, 'source',      v)} placeholder="Dark Reading, CISA, ..." />
              <Field label="url"         value={item.url}         onChange={v => setItem(i, 'url',         v)} type="url" />
              <Field label="description" value={item.description} onChange={v => setItem(i, 'description', v)} textarea />
              <Field label="date"        value={item.publishedAt?.slice(0, 10)} onChange={v => setItem(i, 'publishedAt', v)} type="date" />
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} label={`Save News (${data.length} article${data.length !== 1 ? 's' : ''})`} />
      </div>
    </div>
  );
}

// ─── Hall of Fame Tab ──────────────────────────────────────────────────────

const SEVERITY_OPTS = ['Critical', 'High', 'Medium', 'Low', 'Info'];
const STATUS_OPTS   = ['Resolved', 'Pending', 'Fixed', 'Acknowledged', 'N/A'];

function HallOfFameTab({ data, setData, onSave, saving }) {
  const [section, setSection] = useState('cves');

  // ── CVEs ──
  const setCVE    = (i, k, v) => setData(d => ({ ...d, cves: d.cves.map((c, j) => j === i ? { ...c, [k]: v } : c) }));
  const addCVE    = () => setData(d => ({ ...d, cves: [...d.cves, { id: '', severity: 'High', cvss: '', title: '', vendor: '', desc: '', link: '' }] }));
  const removeCVE = (i) => setData(d => ({ ...d, cves: d.cves.filter((_, j) => j !== i) }));

  // ── Bug Bounty ──
  const setBB    = (i, k, v) => setData(d => ({ ...d, bugBounty: d.bugBounty.map((b, j) => j === i ? { ...b, [k]: v } : b) }));
  const addBB    = () => setData(d => ({ ...d, bugBounty: [...d.bugBounty, { program: '', company: '', title: '', severity: 'High', reward: '', date: '', status: 'Resolved' }] }));
  const removeBB = (i) => setData(d => ({ ...d, bugBounty: d.bugBounty.filter((_, j) => j !== i) }));

  // ── Disclosures ──
  const setDisc    = (i, k, v) => setData(d => ({ ...d, disclosures: d.disclosures.map((x, j) => j === i ? { ...x, [k]: v } : x) }));
  const addDisc    = () => setData(d => ({ ...d, disclosures: [...d.disclosures, { title: '', vendor: '', date: '', status: 'Fixed', desc: '' }] }));
  const removeDisc = (i) => setData(d => ({ ...d, disclosures: d.disclosures.filter((_, j) => j !== i) }));

  const SubTab = ({ id, label, count }) => (
    <button
      onClick={() => setSection(id)}
      className={`px-3 py-1.5 font-mono text-xs rounded border transition-all ${
        section === id
          ? 'border-primary/60 bg-primary/10 text-primary'
          : 'border-border/40 text-gray-600 hover:text-gray-400'
      }`}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        <SubTab id="cves"        label="CVEs"         count={data.cves.length} />
        <SubTab id="bugBounty"   label="Bug Bounty"   count={data.bugBounty.length} />
        <SubTab id="disclosures" label="Disclosures"  count={data.disclosures.length} />
      </div>

      {/* CVEs */}
      {section === 'cves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs text-primary tracking-widest">// CVE DISCOVERIES</h3>
            <button onClick={addCVE} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
              <FiPlus size={12} /> Add CVE
            </button>
          </div>
          {data.cves.length === 0 && (
            <p className="font-mono text-xs text-gray-600 text-center py-8">No CVEs added yet.</p>
          )}
          {data.cves.map((cve, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-primary">{cve.id || 'CVE-????-?????'}</span>
                <button onClick={() => removeCVE(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="CVE ID"   value={cve.id}       onChange={v => setCVE(i, 'id',     v)} placeholder="CVE-2024-12345" />
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">--</span>severity</label>
                  <select value={cve.severity} onChange={e => setCVE(i, 'severity', e.target.value)} className="input w-full">
                    {SEVERITY_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Field label="CVSS Score" value={cve.cvss}   onChange={v => setCVE(i, 'cvss',   v)} placeholder="8.1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title"  value={cve.title}  onChange={v => setCVE(i, 'title',  v)} placeholder="Remote Code Execution in..." />
                <Field label="Vendor" value={cve.vendor} onChange={v => setCVE(i, 'vendor', v)} placeholder="Apache, Microsoft, ..." />
              </div>
              <Field label="NVD / Advisory Link" value={cve.link} onChange={v => setCVE(i, 'link', v)} placeholder="https://nvd.nist.gov/..." type="url" />
              <Field label="Description" value={cve.desc} onChange={v => setCVE(i, 'desc', v)} textarea placeholder="Brief description of the vulnerability..." />
            </div>
          ))}
        </div>
      )}

      {/* Bug Bounty */}
      {section === 'bugBounty' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs text-primary tracking-widest">// BUG BOUNTY FINDINGS</h3>
            <button onClick={addBB} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
              <FiPlus size={12} /> Add Finding
            </button>
          </div>
          {data.bugBounty.length === 0 && (
            <p className="font-mono text-xs text-gray-600 text-center py-8">No bug bounty findings added yet.</p>
          )}
          {data.bugBounty.map((bb, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white">{bb.title || 'Untitled Finding'}</span>
                <button onClick={() => removeBB(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title"   value={bb.title}   onChange={v => setBB(i, 'title',   v)} placeholder="Stored XSS in profile page" />
                <Field label="Company" value={bb.company} onChange={v => setBB(i, 'company', v)} placeholder="Target company" />
                <Field label="Program" value={bb.program} onChange={v => setBB(i, 'program', v)} placeholder="HackerOne / Bugcrowd / Private" />
                <Field label="Reward"  value={bb.reward}  onChange={v => setBB(i, 'reward',  v)} placeholder="$500 / Hall of Fame" />
                <Field label="Date"    value={bb.date}    onChange={v => setBB(i, 'date',    v)} placeholder="2024-06" />
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">--</span>severity</label>
                  <select value={bb.severity} onChange={e => setBB(i, 'severity', e.target.value)} className="input w-full">
                    {SEVERITY_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">--</span>status</label>
                  <select value={bb.status} onChange={e => setBB(i, 'status', e.target.value)} className="input w-full">
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclosures */}
      {section === 'disclosures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs text-primary tracking-widest">// RESPONSIBLE DISCLOSURES</h3>
            <button onClick={addDisc} className="flex items-center gap-1 font-mono text-xs text-primary hover:text-white border border-primary/30 px-3 py-1.5 rounded transition-all">
              <FiPlus size={12} /> Add Disclosure
            </button>
          </div>
          {data.disclosures.length === 0 && (
            <p className="font-mono text-xs text-gray-600 text-center py-8">No disclosures added yet.</p>
          )}
          {data.disclosures.map((disc, i) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white">{disc.title || 'Untitled Disclosure'}</span>
                <button onClick={() => removeDisc(i)} className="text-red-400/60 hover:text-red-400 p-1 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Vendor" value={disc.vendor} onChange={v => setDisc(i, 'vendor', v)} placeholder="Affected vendor" />
                <Field label="Date"   value={disc.date}   onChange={v => setDisc(i, 'date',   v)} placeholder="2024-03" />
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">--</span>status</label>
                  <select value={disc.status} onChange={e => setDisc(i, 'status', e.target.value)} className="input w-full">
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Title"       value={disc.title} onChange={v => setDisc(i, 'title', v)} placeholder="Vulnerability title" />
              <Field label="Description" value={disc.desc}  onChange={v => setDisc(i, 'desc',  v)} textarea placeholder="Brief description..." />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AdminSiteConfig() {
  const [tab,    setTab]    = useState('About');
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/site-config').then(r => {
      const d = r.data;
      // merge with defaults so forms are never empty
      setConfig({
        about: { ...DEFAULT_CONFIG.about, ...d.about },
        skills: {
          categories: d.skills?.categories?.length ? d.skills.categories : DEFAULT_CONFIG.skills.categories,
          badges:     d.skills?.badges?.length     ? d.skills.badges     : DEFAULT_CONFIG.skills.badges,
        },
        experience:   d.experience?.length    ? d.experience    : DEFAULT_CONFIG.experience,
        certifications: {
          items:       d.certifications?.items?.length ? d.certifications.items : DEFAULT_CONFIG.certifications.items,
          achievement: { ...DEFAULT_CONFIG.certifications.achievement, ...d.certifications?.achievement },
        },
        contact:    { ...DEFAULT_CONFIG.contact,    ...d.contact },
        customNews: d.customNews || [],
        hallOfFame: {
          cves:        d.hallOfFame?.cves        || [],
          bugBounty:   d.hallOfFame?.bugBounty   || [],
          disclosures: d.hallOfFame?.disclosures || [],
        },
      });
    }).catch(() => setConfig({
      about:          { ...DEFAULT_CONFIG.about },
      skills:         { categories: [...DEFAULT_CONFIG.skills.categories], badges: [...DEFAULT_CONFIG.skills.badges] },
      experience:     [...DEFAULT_CONFIG.experience],
      certifications: { items: [...DEFAULT_CONFIG.certifications.items], achievement: { ...DEFAULT_CONFIG.certifications.achievement } },
      contact:        { ...DEFAULT_CONFIG.contact },
      customNews:     [],
      hallOfFame:     { cves: [], bugBounty: [], disclosures: [] },
    }));
  }, []);

  const save = async (section, data) => {
    setSaving(true);
    try {
      await api.put('/site-config', { [section]: data });
      toast.success(`${section} saved!`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <AdminLayout title="Site Config">
        <p className="font-mono text-xs text-gray-500">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Config">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-mono text-xs rounded border transition-all ${
              tab === t
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-gray-500 hover:border-primary/30 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'About'          && (
        <AboutTab
          data={config.about}
          setData={v => setConfig(c => ({ ...c, about: typeof v === 'function' ? v(c.about) : v }))}
          onSave={() => save('about', config.about)}
          saving={saving}
        />
      )}
      {tab === 'Skills'         && (
        <SkillsTab
          data={config.skills}
          setData={v => setConfig(c => ({ ...c, skills: typeof v === 'function' ? v(c.skills) : v }))}
          onSave={() => save('skills', config.skills)}
          saving={saving}
        />
      )}
      {tab === 'Experience'     && (
        <ExperienceTab
          data={config.experience}
          setData={v => setConfig(c => ({ ...c, experience: typeof v === 'function' ? v(c.experience) : v }))}
          onSave={() => save('experience', config.experience)}
          saving={saving}
        />
      )}
      {tab === 'Certifications' && (
        <CertificationsTab
          data={config.certifications}
          setData={v => setConfig(c => ({ ...c, certifications: typeof v === 'function' ? v(c.certifications) : v }))}
          onSave={() => save('certifications', config.certifications)}
          saving={saving}
        />
      )}
      {tab === 'Contact'        && (
        <ContactTab
          data={config.contact}
          setData={v => setConfig(c => ({ ...c, contact: typeof v === 'function' ? v(c.contact) : v }))}
          onSave={() => save('contact', config.contact)}
          saving={saving}
        />
      )}
      {tab === 'News'           && (
        <NewsTab
          data={config.customNews}
          setData={v => setConfig(c => ({ ...c, customNews: typeof v === 'function' ? v(c.customNews) : v }))}
          onSave={() => save('customNews', config.customNews)}
          saving={saving}
        />
      )}
      {tab === 'Hall of Fame'  && (
        <HallOfFameTab
          data={config.hallOfFame}
          setData={v => setConfig(c => ({ ...c, hallOfFame: typeof v === 'function' ? v(c.hallOfFame) : v }))}
          onSave={() => save('hallOfFame', config.hallOfFame)}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
