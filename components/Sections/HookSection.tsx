'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * HOOK SECTION — "Brzydka prawda" honest pattern interrupt.
 *
 * Disarming honest tone z killer stat (7/10 klientów do trzeciego wyniku).
 * Wzorowane na cold email outreach pattern Adama — pierwsze "uderzenie"
 * po cinema reel które emocjonalnie wciąga klienta.
 *
 * Layout:
 *  - 3 killer stats w grid (gigantyczne numbery, drobne labels)
 *  - Headline pod nimi (3-linijkowy z italic accent)
 *  - Body paragraph
 *  - GSAP entry: stats wjeżdżają z dołu jeden po drugim, headline word-by-word
 */

export default function HookSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.hook-eyebrow', {
        y: isMobile ? 12 : 20,
        duration: 0.7,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })
      gsap.from('.hook-stat', {
        y: isMobile ? 40 : 80,
        duration: isMobile ? 0.8 : 1.1,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.hook-stats',
          start: isMobile ? 'top 95%' : 'top 85%',
        },
      })
      gsap.from('.hook-headline span', {
        yPercent: isMobile ? 50 : 110,
        duration: 1.0,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.hook-headline',
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })
      gsap.from('.hook-body', {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.hook-body',
          start: 'top 85%',
        },
      })

      // Idle pulsing on stat numbers — subtle
      gsap.utils.toArray<HTMLElement>('.hook-stat-num').forEach((el, i) => {
        gsap.to(el, {
          opacity: 0.85,
          duration: 2 + i * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      id="truth"
      className="relative overflow-hidden bg-[#0a0908] py-24 md:py-44"
    >
      {/* Dramatic ambient glow — red/amber undertone (urgency, not warning) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-[600px] w-[600px] rounded-full opacity-25 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(168,99,45,0.5) 0%, rgba(212,165,116,0.2) 40%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-10 lg:px-14">
        <p className="hook-eyebrow font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574] md:text-[11px]">
          {agency.hook.eyebrow}
        </p>

        {/* === KILLER STATS GRID === */}
        <div className="hook-stats mt-10 grid grid-cols-1 gap-y-10 md:mt-16 md:grid-cols-3 md:gap-x-10 md:gap-y-0">
          {agency.hook.stats.map((stat, i) => (
            <div
              key={i}
              className="hook-stat relative"
            >
              {/* Subtle index */}
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/30">
                · 0{i + 1}
              </span>
              <p className="hook-stat-num mt-4 font-display text-[clamp(4rem,15vw,10rem)] font-light leading-[0.9] tracking-tighter text-white md:mt-6">
                {stat.n}
              </p>
              <p className="mt-4 max-w-[14ch] font-mono text-[12px] leading-relaxed text-white/55 md:mt-6 md:text-[13px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* === MAIN HEADLINE === */}
        <h2 className="hook-headline mt-20 font-display text-[clamp(2.4rem,9vw,6rem)] font-light leading-[1.02] tracking-tight text-white md:mt-32">
          <span className="block overflow-hidden pb-[0.05em]">
            <span className="inline-block">{agency.hook.headline}</span>
          </span>
          <span className="block overflow-hidden pb-[0.05em] italic text-[#d4a574]">
            <span className="inline-block">{agency.hook.headlineAccent}</span>
          </span>
          <span className="block overflow-hidden pb-[0.05em]">
            <span className="inline-block">{agency.hook.headlineTail}</span>
          </span>
        </h2>

        <p className="hook-body mt-8 max-w-2xl font-mono text-[14px] leading-relaxed text-white/70 md:mt-10 md:text-[15px]">
          {agency.hook.body}
        </p>

        {/* CTA — skips ahead do FREE mockup section */}
        <a
          href="#mockup"
          className="hook-body mt-10 inline-flex items-center gap-3 rounded-full border border-[#d4a574]/60 bg-[#d4a574]/[0.06] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#d4a574] transition-all hover:bg-[#d4a574] hover:text-[#0a0908] md:mt-14 md:px-7 md:py-4 md:text-[12px]"
        >
          Sprawdź darmowy mockup
          <span>↓</span>
        </a>
      </div>
    </section>
  )
}
