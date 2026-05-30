'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * FINAL CTA — last big hook przed footerem.
 *
 * Cinematic feel:
 *  - Gigantyczny napis "Zaczniemy?" pełna szerokość
 *  - Pulsujący accent glow w tle
 *  - Big amber button → #brief
 *  - Sub: "Brief 2 minuty. Wycena 24h. Pierwszy szkic w tygodniu."
 */

export default function FinalCta() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.final-cta-line span', {
        yPercent: isMobile ? 60 : 110,
        duration: isMobile ? 0.9 : 1.3,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: isMobile ? 'top 90%' : 'top 75%',
        },
      })
      gsap.from('.final-cta-meta', {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.06,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: isMobile ? 'top 90%' : 'top 75%',
        },
      })

      // Background glow pulse loop
      gsap.to('.final-cta-glow', {
        scale: 1.15,
        opacity: 0.6,
        duration: 4,
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
      className="relative overflow-hidden bg-[#0a0908] py-32 md:py-56"
    >
      {/* Pulsujący accent glow */}
      <div
        aria-hidden
        className="final-cta-glow pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(212,165,116,0.5) 0%, rgba(168,99,45,0.2) 40%, rgba(212,165,116,0) 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center md:px-10 lg:px-14">
        <p className="final-cta-meta font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574] md:text-[11px] md:tracking-[0.32em]">
          — Gotowy?
        </p>

        <h2 className="final-cta-line mt-6 font-display text-[clamp(3rem,15vw,11rem)] font-light leading-[1.0] tracking-tight text-white md:mt-8">
          <span className="block overflow-hidden pb-[0.05em]">
            <span className="inline-block">Zaczniemy?</span>
          </span>
        </h2>

        <p className="final-cta-meta mt-8 max-w-xl mx-auto font-mono text-[13px] leading-relaxed text-white/70 md:mt-10 md:text-sm">
          Brief — 2 minuty. Darmowy mockup — w 48 godzin. Bez umowy, bez kosztu.
          Zerkasz, decydujesz. Nic Cię to nie kosztuje, więc czemu nie?
        </p>

        <div className="final-cta-meta mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center md:mt-14">
          <a
            href="#brief"
            data-magnetic
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#d4a574] px-7 py-5 font-mono text-[12px] uppercase tracking-[0.22em] text-[#0a0908] transition-all hover:bg-white md:px-10 md:py-6 md:text-[13px]"
          >
            Darmowy mockup w 48h
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="mailto:redmind.mailbox@gmail.com"
            data-magnetic
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-7 py-5 font-mono text-[12px] uppercase tracking-[0.22em] text-white/75 transition-all hover:border-[#d4a574] hover:text-[#d4a574] md:px-10 md:py-6 md:text-[13px]"
          >
            Lub napisz bezpośrednio
            <span>↗</span>
          </a>
        </div>

        {/* Reassurance microcopy */}
        <p className="final-cta-meta mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35 md:mt-14">
          Bez sales-pitchy. Bez ankiet. Tylko konkret.
        </p>
      </div>
    </section>
  )
}
