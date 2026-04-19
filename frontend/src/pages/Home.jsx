import { SiteConfigProvider } from '../context/SiteConfigContext';
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

export default function Home() {
  return (
    <SiteConfigProvider>
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
    </SiteConfigProvider>
  );
}
