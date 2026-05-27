import CinematicHeroV2 from '../components/Hero/CinematicHeroV2'
import Manifesto from '../components/Sections/Manifesto'
import SkillsStrip from '../components/Sections/SkillsStrip'
import SelectedWork from '../components/Sections/SelectedWork'
import Featured from '../components/Sections/Featured'
import NowFeed from '../components/Sections/NowFeed'
import BriefForm from '../components/Sections/BriefForm'
import Contact from '../components/Sections/Contact'
import ScrollProgress from '../components/UI/ScrollProgress'
import SectionInterstitial from '../components/UI/SectionInterstitial'
import Nav from '../components/Nav'
import { profile } from '../lib/content'

/**
 * Section flow with cinematic transitions:
 *
 *  Hero (PIN + punch-through)
 *    ↓ camera punches through screen → black flash
 *  Manifesto (emergence — horizon line bursts open)
 *    ↓ subtle warm interstitial line
 *  Skills strip
 *    ↓ subtle warm interstitial line
 *  Selected Work (3D rotation entry on cards)
 *    ↓ ★ Featured iris bloom — light apertures from a hot pinpoint
 *  Featured (cream, light)
 *    ↓ ★ Dark blade — diagonal sweep from bottom-right covers light
 *  Now Feed (alternating L/R row entries)
 *    ↓ subtle warm interstitial line
 *  Contact (text reveal)
 */
export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav name={profile.name} />
      <CinematicHeroV2 />
      <Manifesto />
      <SectionInterstitial variant="line" />
      <SkillsStrip />
      <SectionInterstitial variant="double" />
      <SelectedWork />
      {/* Featured + NowFeed have their own dramatic transitions built-in */}
      <Featured />
      <NowFeed />
      <SectionInterstitial variant="line" />
      <BriefForm />
      <SectionInterstitial variant="line" />
      <Contact />
    </main>
  )
}
