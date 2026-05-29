import CinematicHeroV2 from '../components/Hero/CinematicHeroV2'
import CinemaReel from '../components/Sections/CinemaReel'
import WhyUs from '../components/Sections/WhyUs'
import Process from '../components/Sections/Process'
import Showpiece from '../components/Sections/Showpiece'
import Faq from '../components/Sections/Faq'
import BriefForm from '../components/Sections/BriefForm'
import FinalCta from '../components/Sections/FinalCta'
import Footer from '../components/Sections/Footer'
import ScrollProgress from '../components/UI/ScrollProgress'
import SectionInterstitial from '../components/UI/SectionInterstitial'
import Nav from '../components/Nav'
import { profile } from '../lib/content'

/**
 * REDMIND AGENCY — landing page flow (v3).
 *
 *  Hero (cinematic 3D portal + R-logo emergence)
 *    ↓ direct (no interstitial — cinema reel jest "obietnicą" zaraz po hero)
 *  Cinema Reel (65s pinned scroll-bound, 9-video continuous + multi-stage overlays)
 *    ↓ subtle horizon line
 *  Why Us (6 differentiatorów + portrait photo floating off-axis)
 *    ↓ double horizon line
 *  Process (5 kroków + hands+keyboard photo, research-first messaging)
 *    ↓ double horizon line
 *  Showpiece (R3F particles 3D scene)
 *    ↓ subtle horizon line
 *  FAQ (9 typowych pytań — bez cennika, "Każdy projekt ma indywidualną wycenę")
 *    ↓ subtle horizon line
 *  Brief Form (4-step: Branża → Potrzeba → Timeline → Kontakt)
 *    ↓
 *  Final CTA ("Zaczniemy?")
 *  Footer (Redmind. wordmark + kontakt + social)
 *
 * USUNIĘTE: Pricing — cena indywidualna, ustalana mailem.
 */
export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav name={profile.name} />
      <CinematicHeroV2 />
      <CinemaReel />
      <SectionInterstitial variant="line" />
      <WhyUs />
      <SectionInterstitial variant="double" />
      <Process />
      <SectionInterstitial variant="double" />
      <Showpiece />
      <SectionInterstitial variant="line" />
      <Faq />
      <SectionInterstitial variant="line" />
      <BriefForm />
      <FinalCta />
      <Footer />
    </main>
  )
}
