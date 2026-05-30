import CinematicHeroV2 from '../components/Hero/CinematicHeroV2'
import WhyUs from '../components/Sections/WhyUs'
import Process from '../components/Sections/Process'
import CollaborationScope from '../components/Sections/CollaborationScope'
import Faq from '../components/Sections/Faq'
import BriefForm from '../components/Sections/BriefForm'
import FinalCta from '../components/Sections/FinalCta'
import Footer from '../components/Sections/Footer'
import ScrollProgress from '../components/UI/ScrollProgress'
import SectionInterstitial from '../components/UI/SectionInterstitial'
import Nav from '../components/Nav'
import { profile } from '../lib/content'

/**
 * REDMIND AGENCY — landing page flow (v6 — professional restraint).
 *
 * Professional, restrained, inviting copy. Maksymalizacja konwersji przez
 * zaufanie zamiast pressure. Bez cen, bez "darmowych mockupów", bez urgency.
 *
 *  Hero — video bg, headline "Strony które klient pamięta", CTA "Porozmawiajmy"
 *    ↓
 *  Why Us — 6 differentiatorów (Lighthouse 100, kod jest Twój, etc)
 *    ↓
 *  Process — 5 kroków od briefu do grow
 *    ↓
 *  Collaboration Scope — co obejmuje współpraca (6 includes, bez wzmianki ceny)
 *    ↓
 *  FAQ — 8 pytań professional
 *    ↓
 *  Brief Form — 4-step lead capture (low friction)
 *    ↓
 *  Final CTA + Footer
 */
export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav name={profile.name} />
      <CinematicHeroV2 />
      <WhyUs />
      <SectionInterstitial variant="line" />
      <Process />
      <SectionInterstitial variant="line" />
      <CollaborationScope />
      <SectionInterstitial variant="line" />
      <Faq />
      <SectionInterstitial variant="line" />
      <BriefForm />
      <FinalCta />
      <Footer />
    </main>
  )
}
