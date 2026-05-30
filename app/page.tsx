import CinematicHeroV2 from '../components/Hero/CinematicHeroV2'
import HookSection from '../components/Sections/HookSection'
import WhyUs from '../components/Sections/WhyUs'
import FreeMockup from '../components/Sections/FreeMockup'
import Process from '../components/Sections/Process'
import Showpiece from '../components/Sections/Showpiece'
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
 * REDMIND AGENCY — landing page flow (v4 — "Brzydka prawda" pattern).
 *
 *  Inspirowane cold email outreach Adama z LeadHuntera:
 *  killer stat → disarming honesty → free value first → konwersja.
 *
 *  Hero (cinematic 3D portal — premium morphing crystal)
 *    ↓
 *  Cinema Reel (65s pinned scroll-bound, 9-video continuous + multi-stage overlays)
 *    ↓
 *  Hook Section "Brzydka prawda" — killer stats (7/10, 48h, 0 zł)
 *    ↓ interstitial line
 *  Why Us — 6 differentiatorów + portrait photo floating
 *    ↓ interstitial double
 *  Free Mockup — zero-friction offer (DARMOWY w 48h, bez umowy)
 *    ↓ interstitial line
 *  Process — 5 kroków + hands+keyboard photo
 *    ↓ interstitial double
 *  Showpiece (R3F particles 3D scene)
 *    ↓ interstitial line
 *  Subscription Value — co dostajesz w subskrypcji (bez ceny!)
 *    ↓ interstitial line
 *  FAQ — 11 pytań ze szczegółami subskrypcji i mockupu
 *    ↓ interstitial line
 *  Brief Form (4-step: Branża → Potrzeba → Timeline → Kontakt)
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
      <SectionInterstitial variant="double" />
      <Showpiece />
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
