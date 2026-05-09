import { useState, useEffect } from 'react';
import { FiGithub, FiExternalLink, FiCode, FiShield, FiBook, FiStar, FiGitBranch } from 'react-icons/fi';
import api from '../../utils/api';
import { STATIC_PROJECTS as STATIC } from '../../data/staticProjects';

const CATS = ['All', 'GitHub', 'Cybersecurity', 'Development', 'Academic'];
const ICON = { Cybersecurity: FiShield, Development: FiCode, Academic: FiBook, GitHub: FiGithub };

function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Sort: ★ featured first → by order → stable
function sortProjects(arr) {
  return [...arr].sort((a, b) => {
    if (b.featured !== a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if ((a.order ?? 99) !== (b.order ?? 99)) return (a.order ?? 99) - (b.order ?? 99);
    return 0;
  });
}

export default function ProjectsSection() {
  const [projects,       setProjects]       = useState(STATIC);
  const [githubProjects, setGithubProjects] = useState([]);
  const [suppressed,     setSuppressed]     = useState(new Set());
  const [filter,         setFilter]         = useState('All');
  const [ghLoading,      setGhLoading]      = useState(true);

  useEffect(() => {
    // 1. Fetch suppressed titles (hidden or deleted in CMS)
    let suppressedSet = new Set();
    api.get('/projects/suppressed')
      .then((r) => {
        if (Array.isArray(r.data)) {
          suppressedSet = new Set(r.data); // already lowercased from backend
          setSuppressed(suppressedSet);
        }
      })
      .catch(() => {})
      .finally(() => {
        // 2. Fetch visible CMS projects, then merge with filtered STATIC
        api.get('/projects').then((r) => {
          if (Array.isArray(r.data)) {
            const dbTitles     = new Set(r.data.map((p) => p.title.toLowerCase().trim()));
            // Only include static projects that are NOT in CMS at all
            // (if they're in CMS, use the CMS version — visible ones are already in r.data)
            const staticToShow = STATIC.filter(
              (s) => !dbTitles.has(s.title.toLowerCase().trim()) &&
                     !suppressedSet.has(s.title.toLowerCase().trim())
            );
            setProjects(sortProjects([...r.data, ...staticToShow]));
          }
        }).catch(() => {});
      });

    // 3. Fetch GitHub repos, filter suppressed ones
    api.get('/github/repos')
      .then((r) => r.data)
      .then((repos) => {
        if (!Array.isArray(repos)) return;
        const mapped = repos
          .filter((r) => !r.fork && r.description)
          .map((r) => ({
            _id:         `gh-${r.id}`,
            title:       toTitleCase(r.name),
            description: r.description || '',
            techStack:   r.language ? [r.language] : [],
            category:    'GitHub',
            githubUrl:   r.html_url,
            liveUrl:     r.homepage || '',
            featured:    r.stargazers_count > 0,
            stars:       r.stargazers_count,
            forks:       r.forks_count,
          }));
        setGithubProjects(mapped);
      })
      .catch(() => {})
      .finally(() => setGhLoading(false));
  }, []);

  // Filter out suppressed GitHub repos at render time (suppressed loads async)
  const visibleGithub = githubProjects.filter(
    (r) => !suppressed.has(r.title.toLowerCase().trim())
  );

  const allProjects = sortProjects([...visibleGithub, ...projects]);
  const shown = filter === 'All'
    ? allProjects
    : filter === 'GitHub'
      ? visibleGithub
      : sortProjects(projects.filter((p) => p.category === filter));

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
              {c === 'GitHub' ? (
                <span className="flex items-center gap-1.5">
                  <FiGithub size={11} /> GitHub
                  {!ghLoading && visibleGithub.length > 0 && (
                    <span className="bg-primary/20 text-primary rounded-full px-1.5 text-[10px]">
                      {visibleGithub.length}
                    </span>
                  )}
                </span>
              ) : c}
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
                    {p.category === 'GitHub' && (
                      <span className="font-mono text-xs text-primary/60 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                        GitHub
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {p.category === 'GitHub' && (
                      <span className="flex items-center gap-1 font-mono text-xs text-gray-500">
                        <FiStar size={11} /> {p.stars}
                        <FiGitBranch size={11} className="ml-1" /> {p.forks}
                      </span>
                    )}
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

        {ghLoading && (
          <p className="text-center font-mono text-xs text-gray-600 mt-6">
            fetching github repos...
          </p>
        )}

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
