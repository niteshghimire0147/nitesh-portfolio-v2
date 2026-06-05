import { SiteConfigProvider, useSiteConfig } from '../context/SiteConfigContext';
import HeroSection           from '../components/sections/HeroSection';
import AboutSection          from '../components/sections/AboutSection';
import SkillsSection         from '../components/sections/SkillsSection';
import ExperienceSection     from '../components/sections/ExperienceSection';
import ProjectsSection       from '../components/sections/ProjectsSection';
import CertificationsSection from '../components/sections/CertificationsSection';
import HallOfFameSection     from '../components/sections/HallOfFameSection';
import ArsenalSection        from '../components/sections/ArsenalSection';
import TestimonialsSection   from '../components/sections/TestimonialsSection';
import NewsSection           from '../components/sections/NewsSection';
import ContactSection        from '../components/sections/ContactSection';
import { useSEO, useGlobalSEO } from '../hooks/useSEO';

// Inner component so it has access to SiteConfigContext
function HomeInner() {
  const { config } = useSiteConfig();

  // Apply admin-panel SEO (verification codes, robots toggle, OG image)
  useGlobalSEO(config.seo || {});

  useSEO({
    title: config.seo?.metaTitle || 'Nitesh Ghimire | Penetration Tester & Security Researcher',
    description: config.seo?.metaDescription || 'Portfolio of Nitesh Ghimire, a Penetration Tester, Security Researcher & Purple Team Operator based in Nepal. Explore CVEs, CTF write-ups, and security research.',
    keywords: config.seo?.keywords || 'Nitesh Ghimire, penetration tester, security researcher, purple team, ethical hacker, Nepal',
    image: config.seo?.ogImage || undefined,
    canonical: (config.seo?.siteUrl || 'https://niteshg.com.np') + '/',
    type: 'website',
  });

  return (
    <main className="relative">
      <div className="cyber-grid fixed inset-0 pointer-events-none opacity-40 z-0" aria-hidden="true" />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <CertificationsSection />
      <ArsenalSection />
      <HallOfFameSection />
      <TestimonialsSection />
      <NewsSection />
      <ContactSection />
    </main>
  );
}

export default function Home() {
  return (
    <SiteConfigProvider>
      <HomeInner />
    </SiteConfigProvider>
  );
}
