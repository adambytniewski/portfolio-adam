import CinematicHeroV2 from '../components/Hero/CinematicHeroV2'
import HookSection from '../components/Sections/HookSection'
import WhyUs from '../components/Sections/WhyUs'
import FreeMockup from '../components/Sections/FreeMockup'
import Process from '../components/Sections/Process'
import SubscriptionValue from '../components/Sections/SubscriptionValue'
import Faq from '../components/Sections/Faq'
import BriefForm from '../components/Sections/BriefForm'
import FinalCta from '../components/Sections/FinalCta'
import Footer from '../components/Sections/Footer'
import ScrollProgress from '../components/UI/ScrollProgress'
import SectionInterstitial from '../components/UI/SectionInterstitial'
import Nav from '../components/Nav'
import { profile } from '../lib/content'

/**
 * REDMIND AGENCY — landing page flow (v5 — clean video-bg).
 *
 * Cale tlo strony to user's 45s 60fps reel (FullPageVideoBg w layout.tsx).
 * USUNIETE: Hero 3D crystal Canvas + Showpiece R3F particles (per user feedback,
 * "wygladaja tragicznie" w kontrascie z premium video).
 *
 *  Hero — video bg widoczne od razu, tylko HTML content (h1, sub, CTA)
 *    ↓
 *  Hook Section "Brzydka prawda" — killer stats (7/10, 48h, 0 zł)
 *    ↓
 *  Why Us — 6 differentiatorów + portrait photo
 *    ↓
 *  Free Mockup — zero-friction offer (DARMOWY w 48h)
 *    ↓
 *  Process — 5 kroków + hands+keyboard photo
 *    ↓
 *  Subscription Value — 6 includes (bez ceny)
 *    ↓
 *  FAQ — pytania klienta
 *    ↓
 *  Brief Form — 4-step lead qualifier
 *    ↓
 *  Final CTA + Footer
 */
export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav name={profile.name} />
      <CinematicHeroV2 />
      <HookSection />
      <SectionInterstitial variant="line" />
      <WhyUs />
      <SectionInterstitial variant="double" />
      <FreeMockup />
      <SectionInterstitial variant="line" />
      <Process />
      <SectionInterstitial variant="line" />
      <SubscriptionValue />
      <SectionInterstitial variant="line" />
      <Faq />
      <SectionInterstitial variant="line" />
      <BriefForm />
      <FinalCta />
      <Footer />
    </main>
  )
}
