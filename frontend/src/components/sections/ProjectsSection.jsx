import { useState, useEffect } from 'react';
import { FiGithub, FiExternalLink, FiCode, FiShield, FiBook } from 'react-icons/fi';
import api from '../../utils/api';

const STATIC = [
  { title: 'Gumbili Studio',         description: 'Image-to-cartoon converter app using Python image processing to stylise real photos into cartoon-style output.', techStack: ['Python','OpenCV','Flask'], category: 'Development',   githubUrl: 'https://github.com/niteshghimire0147', featured: true  },
  { title: 'Portfolio Website',       description: 'This portfolio — MERN stack + Vite + Tailwind CSS with a full CMS to manage blog posts, CTF writeups and projects.', techStack: ['React','Node.js','MongoDB','Vite'], category: 'Development',   githubUrl: 'https://github.com/niteshghimire0147', featured: true  },
  { title: 'SQL Injection Lab',       description: 'Hands-on pentesting practice using SQLMap and manual techniques on deliberately vulnerable web apps in safe lab environments.', techStack: ['SQLMap','Kali Linux','Burp Suite'], category: 'Cybersecurity', featured: true  },
  { title: 'TryHackMe PT Labs',       description: 'Completed Penetration Testing path — enumeration, exploitation, post-exploitation across diverse machines.', techStack: ['Nmap','Metasploit','Python','Linux'], category: 'Cybersecurity', featured: false },
  { title: 'Hotel Booking System',    description: 'Full database design & implementation — ERD, normalisation, and complex SQL queries for a hotel management system.', techStack: ['SQL','ERD','MySQL'], category: 'Academic',     featured: false },
  { title: 'Network Design — Cisco',  description: 'LAN/WAN design and simulation covering routing protocols, VLANs and network security policies in Cisco Packet Tracer.', techStack: ['Cisco PT','OSPF','VLANs'], category: 'Academic',     featured: false },
  { title: 'AI in Logistics',         description: 'Group research project exploring AI applications in supply chain management with practical implementation proposals.', techStack: ['Python','AI/ML','Research'], category: 'Academic',     featured: false },
  { title: 'Krishi Guru App',         description: 'System improvement proposal for an agricultural advisory app focused on UX upgrades and feature additions for Nepali farmers.', techStack: ['System Design','UI/UX'], category: 'Academic',     featured: false },
];

const CATS = ['All','Cybersecurity','Development','Academic'];
const ICON = { Cybersecurity: FiShield, Development: FiCode, Academic: FiBook };

export default function ProjectsSection() {
  const [projects, setProjects] = useState(STATIC);
  const [filter,   setFilter]   = useState('All');

  useEffect(() => {
    api.get('/projects').then((r) => {
      if (Array.isArray(r.data) && r.data.length) setProjects([...r.data, ...STATIC]);
    }).catch(() => {});
  }, []);

  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="py-24 px-6 relative z-10 bg-darker/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 04. PROJECTS</p>
          <h2 className="section-title">Projects</h2>
          <p className="section-subtitle">ls ~/projects/ -la --sort=date</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-5 py-2 font-mono text-xs rounded border transition-all duration-200 ${
                filter === c
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-gray-500 hover:border-primary/40 hover:text-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((p, i) => {
            const Icon = ICON[p.category] || FiCode;
            return (
              <div
                key={p._id || p.title + i}
                className="card flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="text-primary" size={16} />
                    {p.featured && (
                      <span className="font-mono text-xs text-yellow-400 border border-yellow-400/30 bg-yellow-400/5 px-2 py-0.5 rounded">
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary transition-colors">
                        <FiGithub size={15} />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary transition-colors">
                        <FiExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-sm font-bold text-white mb-2 hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="font-body text-sm text-gray-400 leading-relaxed flex-1 mb-4">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
                  {(p.techStack || []).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://github.com/niteshghimire0147"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary gap-2"
          >
            <FiGithub size={15} /> View All on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
