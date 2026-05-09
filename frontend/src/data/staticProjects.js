// Hardcoded projects that always show on the portfolio.
// These appear in both the frontend ProjectsSection and the CMS admin panel.
// To fully manage a static project from the CMS, edit/feature/hide it in the admin —
// it will be auto-imported to the database on first interaction.

export const STATIC_PROJECTS = [
  { title: 'Gumbili Studio',        description: 'Image-to-cartoon converter app using Python image processing to stylise real photos into cartoon-style output.', techStack: ['Python', 'OpenCV', 'Flask'],              category: 'Development',   githubUrl: 'https://github.com/niteshghimire0147', featured: true  },
  { title: 'Portfolio Website',      description: 'This portfolio — MERN stack + Vite + Tailwind CSS with a full CMS to manage blog posts, CTF writeups and projects.', techStack: ['React', 'Node.js', 'MongoDB', 'Vite'], category: 'Development',   githubUrl: 'https://github.com/niteshghimire0147', featured: true  },
  { title: 'SQL Injection Lab',      description: 'Hands-on pentesting practice using SQLMap and manual techniques on deliberately vulnerable web apps in safe lab environments.', techStack: ['SQLMap', 'Kali Linux', 'Burp Suite'], category: 'Cybersecurity', featured: true  },
  { title: 'TryHackMe PT Labs',      description: 'Completed Penetration Testing path — enumeration, exploitation, post-exploitation across diverse machines.', techStack: ['Nmap', 'Metasploit', 'Python', 'Linux'],   category: 'Cybersecurity', featured: false },
  { title: 'Hotel Booking System',   description: 'Full database design & implementation — ERD, normalisation, and complex SQL queries for a hotel management system.', techStack: ['SQL', 'ERD', 'MySQL'],                  category: 'Academic',     featured: false },
  { title: 'Network Design — Cisco', description: 'LAN/WAN design and simulation covering routing protocols, VLANs and network security policies in Cisco Packet Tracer.', techStack: ['Cisco PT', 'OSPF', 'VLANs'],          category: 'Academic',     featured: false },
  { title: 'AI in Logistics',        description: 'Group research project exploring AI applications in supply chain management with practical implementation proposals.', techStack: ['Python', 'AI/ML', 'Research'],          category: 'Academic',     featured: false },
  { title: 'Krishi Guru App',        description: 'System improvement proposal for an agricultural advisory app focused on UX upgrades and feature additions for Nepali farmers.', techStack: ['System Design', 'UI/UX'],           category: 'Academic',     featured: false },
];
