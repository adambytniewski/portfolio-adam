import CinematicHeroV2 from '../components/Hero/CinematicHeroV2'
import WhyUs from '../components/Sections/WhyUs'
import Process from '../components/Sections/Process'
import Showpiece from '../components/Sections/Showpiece'
import Pricing from '../components/Sections/Pricing'
import Faq from '../components/Sections/Faq'
import BriefForm from '../components/Sections/BriefForm'
import FinalCta from '../components/Sections/FinalCta'
import Footer from '../components/Sections/Footer'
import ScrollProgress from '../components/UI/ScrollProgress'
import SectionInterstitial from '../components/UI/SectionInterstitial'
import Nav from '../components/Nav'
import { profile } from '../lib/content'

/**
 * REDMIND AGENCY — landing page flow.
 *
 *  Hero (cinematic 3D portal — premium morphing crystal, scroll-bound morph)
 *    ↓ subtle horizon line
 *  Why Us (6 differentiatorów vs WordPress/Wix)
 *    ↓ subtle horizon line
 *  Process (5 kroków od briefa do launch — vertical timeline)
 *    ↓ subtle horizon line
 *  Pricing (3 paczki Start/Pro/Premium z konkretnymi cenami)
 *    ↓ subtle horizon line
 *  FAQ (8 typowych pytań klienta MŚP)
 *    ↓ subtle horizon line
 *  Brief Form (4-step lead qualifier)
 *    ↓ subtle horizon line
 *  Final CTA ("Zaczniemy?")
 *  Footer (minimal: wordmark + kontakt + social)
 */
export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav name={profile.name} />
      <CinematicHeroV2 />
      <SectionInterstitial variant="line" />
      <WhyUs />
      <SectionInterstitial variant="double" />
      <Process />
      <SectionInterstitial variant="double" />
      <Showpiece />
      <SectionInterstitial variant="line" />
      <Pricing />
      <SectionInterstitial variant="line" />
      <Faq />
      <SectionInterstitial variant="line" />
      <BriefForm />
      <FinalCta />
      <Footer />
    </main>
  )
}
