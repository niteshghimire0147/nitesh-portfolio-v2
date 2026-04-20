import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

export const DEFAULT_CONFIG = {
  about: {
    name: 'Nitesh Ghimire', location: 'Bhaktapur, Nepal', education: 'B.Sc IT @ APU',
    focus: 'Penetration Testing', goal: 'Purple Team Operations',
    phone: '+977 97xxxxxx', status: 'open_to_opportunities',
    bio: [
      "I'm a motivated IT student at Asia Pacific University with a deep passion for cybersecurity, particularly penetration testing and Purple Team operations.",
      "Through my internship at Cube Technology and continuous self-learning on platforms like TryHackMe, I've built hands-on experience identifying and exploiting vulnerabilities in real-world environments.",
      "My goal is to bridge offensive and defensive security — understanding how attackers think to build stronger defenses.",
    ],
    highlights: [
      { emoji: '🎓', title: 'Student',    desc: 'APU — B.Sc IT' },
      { emoji: '🏢', title: 'Intern',     desc: 'Cube Technology' },
      { emoji: '🥈', title: 'CTF Player', desc: 'HackXLbef Winner' },
    ],
  },
  skills: {
    categories: [
      { label: '🔐 Cybersecurity', color: '#00d4ff', items: [
        { name: 'Penetration Testing',     pct: 70 },
        { name: 'Web App Security / VAPT', pct: 75 },
        { name: 'SQL Injection / SQLMap',  pct: 80 },
        { name: 'Linux / System Admin',    pct: 70 },
        { name: 'Network Security',        pct: 65 },
      ]},
      { label: '💻 Development', color: '#0066ff', items: [
        { name: 'Python / Django', pct: 72 },
        { name: 'SQL / Database',  pct: 78 },
        { name: 'JavaScript',      pct: 55 },
        { name: 'Git',             pct: 65 },
      ]},
      { label: '🛠 Tools', color: '#00ff88', items: [
        { name: 'TryHackMe',                pct: 80 },
        { name: 'Cisco Packet Tracer',      pct: 75 },
        { name: 'VirtualBox / Rocky Linux', pct: 70 },
        { name: 'Kali / Ubuntu',            pct: 75 },
      ]},
    ],
    badges: [
      'TryHackMe','SQLMap','Nmap','Burp Suite','Metasploit','Wireshark',
      'OWASP','Cisco PT','VirtualBox','Git','Python','Django','SQL',
      'Linux','Red Hat','Kali Linux','VAPT',
    ],
  },
  experience: [
    {
      role: 'Security Audit & VAPT Intern', company: 'Cube Technology',
      duration: '3 Months', location: 'Nepal', type: 'Internship', color: '#00d4ff',
      tasks: [
        'Conducted vulnerability assessments on web applications',
        'Assisted in penetration testing using industry-standard tools',
        'Identified and documented security flaws with remediation steps',
        'Gained hands-on experience in real-world cybersecurity environments',
      ],
    },
    {
      role: 'CTF Competitor', company: 'TryHackMe / HackXLbef',
      duration: 'Ongoing', location: 'Online / Nepal', type: 'Competition', color: '#0066ff',
      tasks: [
        'Completed Pre Security & Penetration Testing paths on TryHackMe',
        'Achieved 1st Runner-Up at HackXLbef Hackathon',
        'Practiced real-world attack scenarios in safe lab environments',
        'Developed skills in web exploitation, SQL injection & enumeration',
      ],
    },
    {
      role: 'IT Student', company: 'Asia Pacific University (APU)',
      duration: '2022 — Present', location: 'Remote / Malaysia', type: 'Education', color: '#00ff88',
      tasks: [
        'Bachelor in Information Technology (Ongoing)',
        'Coursework: Networking, Database Systems, Python Programming',
        'Digital Thinking & Innovation, System Software & Computing',
        'Projects: AI in Logistics, Hotel Booking System, Network Design',
      ],
    },
  ],
  certifications: {
    items: [
      { title: 'Certified Red Team Analyst (CRTA)',      issuer: 'CyberWarFare Labs', color: '#ff4444', icon: '🎯', desc: 'Advanced red team operations: adversary simulation, persistence, and lateral movement techniques.', link: '' },
      { title: 'Red Hat System Administration I (RH124)', issuer: 'Red Hat',           color: '#cc0000', icon: '🎩', desc: 'Enterprise Linux system administration: users, permissions, storage, networking, and services.', link: '' },
      { title: 'TryHackMe — Pre Security Path',          issuer: 'TryHackMe',         color: '#00d4ff', icon: '🔓', desc: 'Foundational cybersecurity: networking, web fundamentals, and Linux basics via hands-on labs.', link: 'https://tryhackme.com' },
      { title: 'WebRTA CWL Certification',                issuer: 'CyberWarFare Labs', color: '#0066ff', icon: '🌐', desc: 'Web application red team analyst: OWASP Top 10 and advanced web exploitation techniques.', link: '' },
    ],
    achievement: {
      emoji: '🥈',
      title: '1st Runner-Up — HackXLbef Hackathon',
      desc:  'Competed in HackXLbef CTF and secured 1st Runner-Up among multiple teams.',
    },
  },
  contact: {
    email:      'ghimirenitesh8@gmail.com',
    phone:      '+977 97xxxxxxx',
    location:   'Bhaktapur, Sallaghari, Nepal',
    github:     'https://github.com/niteshghimire0147',
    linkedin:   'https://www.linkedin.com/in/nitesh-ghimire-694104382/',
    hackthebox: 'https://profile.hackthebox.com/profile/019d6386-7801-7191-8629-88d729367f74',
  },
  customNews: [],
  hallOfFame: {
    cves: [],
    bugBounty: [],
    disclosures: [],
  },
  arsenal: [
    {
      emoji: '🌐', label: 'Web Testing', color: '#00d4ff',
      tools: [
        { name: 'Burp Suite',    desc: 'Web proxy & scanner',      level: 'Expert' },
        { name: 'SQLMap',        desc: 'SQL injection automation',  level: 'Expert' },
        { name: 'Nikto',         desc: 'Web server scanner',        level: 'Advanced' },
        { name: 'OWASP ZAP',     desc: 'Active web app scanner',    level: 'Intermediate' },
      ],
    },
    {
      emoji: '🔍', label: 'Recon & OSINT', color: '#0066ff',
      tools: [
        { name: 'Nmap',          desc: 'Network discovery & scan',  level: 'Expert' },
        { name: 'theHarvester',  desc: 'Email & subdomain recon',   level: 'Advanced' },
        { name: 'Shodan',        desc: 'Internet-exposed device DB',level: 'Advanced' },
        { name: 'Amass',         desc: 'Subdomain enumeration',     level: 'Intermediate' },
      ],
    },
    {
      emoji: '💥', label: 'Exploitation', color: '#ff4444',
      tools: [
        { name: 'Metasploit',    desc: 'Exploit framework',         level: 'Advanced' },
        { name: 'Hydra',         desc: 'Brute force tool',          level: 'Expert' },
        { name: 'John the Ripper',desc: 'Password cracker',         level: 'Advanced' },
        { name: 'Hashcat',       desc: 'GPU password cracking',     level: 'Intermediate' },
      ],
    },
    {
      emoji: '🛡️', label: 'Defense & Analysis', color: '#00ff88',
      tools: [
        { name: 'Wireshark',     desc: 'Network traffic analysis',  level: 'Advanced' },
        { name: 'Volatility',    desc: 'Memory forensics',          level: 'Intermediate' },
        { name: 'Snort',         desc: 'IDS / IPS',                 level: 'Intermediate' },
        { name: 'CyberChef',     desc: 'Data decoding & analysis',  level: 'Expert' },
      ],
    },
    {
      emoji: '🐧', label: 'Platforms & OS', color: '#ffd700',
      tools: [
        { name: 'Kali Linux',    desc: 'Pentesting distro',         level: 'Expert' },
        { name: 'TryHackMe',     desc: 'Lab practice platform',     level: 'Expert' },
        { name: 'VirtualBox',    desc: 'VM management',             level: 'Advanced' },
        { name: 'Rocky Linux',   desc: 'Enterprise Linux',          level: 'Intermediate' },
      ],
    },
  ],
};

function merge(api, def) {
  return {
    about: { ...def.about, ...api.about },
    skills: {
      categories: api.skills?.categories?.length ? api.skills.categories : def.skills.categories,
      badges:     api.skills?.badges?.length     ? api.skills.badges     : def.skills.badges,
    },
    experience:   api.experience?.length    ? api.experience    : def.experience,
    certifications: {
      items:       api.certifications?.items?.length ? api.certifications.items : def.certifications.items,
      achievement: { ...def.certifications.achievement, ...api.certifications?.achievement },
    },
    contact:    { ...def.contact, ...api.contact },
    customNews: Array.isArray(api.customNews) ? api.customNews : [],
    hallOfFame: {
      cves:        api.hallOfFame?.cves?.length        ? api.hallOfFame.cves        : def.hallOfFame.cves,
      bugBounty:   api.hallOfFame?.bugBounty?.length   ? api.hallOfFame.bugBounty   : def.hallOfFame.bugBounty,
      disclosures: api.hallOfFame?.disclosures?.length ? api.hallOfFame.disclosures : def.hallOfFame.disclosures,
    },
    arsenal: api.arsenal?.length ? api.arsenal : def.arsenal,
  };
}

const SiteConfigContext = createContext({ config: DEFAULT_CONFIG, loading: true });

export function SiteConfigProvider({ children }) {
  const [config,  setConfig]  = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/site-config')
      .then(r => setConfig(merge(r.data, DEFAULT_CONFIG)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);
