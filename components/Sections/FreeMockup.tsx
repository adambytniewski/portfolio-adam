'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * FREE MOCKUP — zero-friction value-first offer.
 *
 * "Zerkasz, decydujesz. Bez umowy, bez kosztu."
 * Najmocniejszy konwersyjny element strony — pokazuje że nie ma ryzyka.
 *
 * Layout:
 *  - Gigantyczny "DARMOWY" headline z gold accent
 *  - 4 promise bullets (każdy z numerem + emoji-style ikoną circle)
 *  - Big amber CTA "Wyślij brief" → #brief
 *  - Subtle "48h" timer/badge floating
 */

export default function FreeMockup() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.mockup-head', {
        y: isMobile ? 16 : 28,
        duration: 1.0,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })

      gsap.from('.mockup-headline span', {
        yPercent: isMobile ? 50 : 110,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.mockup-headline',
          start: isMobile ? 'top 95%' : 'top 75%',
        },
      })

      gsap.from('.mockup-promise', {
        x: isMobile ? -20 : -60,
        opacity: 0.3,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.mockup-promises',
          start: isMobile ? 'top 90%' : 'top 75%',
        },
      })

      gsap.from('.mockup-cta', {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.mockup-cta',
          start: 'top 90%',
        },
      })

      // Floating "48h" badge — gentle pulse
      gsap.to('.mockup-badge', {
        scale: 1.06,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      id="mockup"
      className="relative overflow-hidden bg-[#0a0908] py-24 md:py-44"
    >
      {/* Triple-layer ambient glow — najmocniejszy w sekcji konwersyjnej */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[700px] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,165,116,0.4) 0%, rgba(212,165,116,0.1) 40%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-10 lg:px-14">
        <div className="mockup-head flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:text-[11px] md:tracking-[0.32em]">
          <span>{agency.freeMockup.eyebrow}</span>
          <span className="mockup-badge inline-flex items-center gap-2 rounded-full border border-[#d4a574]/40 bg-[#d4a574]/[0.06] px-3 py-1.5 text-[#d4a574]">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-[#d4a574]" />
            48h timer
          </span>
        </div>

        {/* === GIGANTYCZNY HEADLINE === */}
        <h2 className="mockup-headline mt-10 font-display text-[clamp(2.8rem,11vw,7.5rem)] font-light leading-[0.98] tracking-tight text-white md:mt-14">
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="inline-block">{agency.freeMockup.headline}</span>
          </span>
          <span className="block overflow-hidden pb-[0.04em] italic text-[#d4a574]">
            <span className="inline-block">
              {agency.freeMockup.headlineAccent}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="inline-block">{agency.freeMockup.headlineTail}</span>
          </span>
        </h2>

        <p className="mockup-head mt-8 max-w-2xl font-mono text-[14px] leading-relaxed text-white/70 md:mt-10 md:text-[15px]">
          {agency.freeMockup.body}
        </p>

        {/* === PROMISE BULLETS — 4 line zero-friction === */}
        <ul className="mockup-promises mt-12 space-y-5 border-t border-white/10 pt-10 md:mt-16 md:space-y-7 md:pt-14">
          {agency.freeMockup.promise.map((p, i) => (
            <li
              key={i}
              className="mockup-promise flex items-start gap-5 md:gap-7"
            >
              {/* Circle number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a574]/40 bg-[#d4a574]/[0.05] font-mono text-[12px] text-[#d4a574] md:h-12 md:w-12 md:text-[13px]">
                0{i + 1}
              </div>
              <p className="pt-2 font-display text-lg font-light leading-snug text-white md:pt-2.5 md:text-2xl">
                {p}
              </p>
            </li>
          ))}
        </ul>

        {/* === BIG CTA === */}
        <div className="mockup-cta mt-16 flex flex-col items-start gap-5 md:mt-24 md:flex-row md:items-center md:gap-8">
          <a
            href="#brief"
            data-magnetic
            className="group inline-flex items-center justify-center gap-4 rounded-full bg-[#d4a574] px-7 py-5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#0a0908] transition-all hover:bg-white md:px-10 md:py-6 md:text-[13px]"
          >
            Wyślij brief — startujemy
            <span className="inline-block text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
            ⦿ Brief 2 min · Mockup w 48h · 0 zł
          </p>
        </div>
      </div>
    </section>
  )
}
