'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ShaderBackground from './ShaderBackground'
import { profile } from '../../lib/content'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Calm cinematic Hero — gold-brown shader waves + 3-layer parallax.
 *
 * No pin, no punch-through, no zoom. Just a clean atmospheric hero that
 * scrolls past with subtle depth-staggered parallax (bg slowest, fg fastest)
 * so the moment is editorial-grade without being draggy.
 */
export default function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const midRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      // === HERO ENTRY ANIMATION (one-time, on load) ===
      // Te animacje są load-time (nie scroll), więc działają na mobile.
      // Tylko skracamy delay żeby content szybciej był widoczny.
      gsap.from('.hero-line', {
        yPercent: 110,
        duration: isMobile ? 1.0 : 1.4,
        stagger: isMobile ? 0.08 : 0.12,
        ease: 'expo.out',
        delay: isMobile ? 0.1 : 0.4,
      })

      gsap.from('.hero-meta', {
        opacity: 0,
        y: 8,
        duration: isMobile ? 0.7 : 1,
        stagger: 0.06,
        ease: 'power2.out',
        delay: isMobile ? 0.5 : 1.2,
      })

      // Pulsing scroll cue — desktop only (na mobile element jest md:flex, ukryty)
      if (!isMobile) {
        gsap.to('.scroll-cue-bar', {
          scaleY: 1,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          transformOrigin: 'top center',
        })
      }

      // === 3-LAYER PARALLAX — desktop only ===
      // Na mobile parallax jest jankowy (natywny scroll vs RAF transform),
      // wyłączamy. Layers zostają statyczne, hero wygląda spokojnie.
      if (isMobile) return

      gsap.to('.hero-bg-decoration', {
        yPercent: -28,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.to(midRef.current, {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      gsap.to(fgRef.current, {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Live clock (Warsaw)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Warsaw',
    })
    const tick = () => {
      if (clockRef.current) clockRef.current.textContent = fmt.format(new Date())
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-[100svh] w-full overflow-hidden bg-[#0a0908]"
    >
      <ShaderBackground />

      {/* MID layer — gigantic decorative type, parallax-shifted slower than fg.
          overflow-hidden zapobiega ucinaniu viewportu na wąskim ekranie. */}
      <div
        ref={midRef}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
      >
        <span className="font-display text-[28vw] font-thin italic leading-none text-white/[0.045] select-none whitespace-nowrap">
          adam.
        </span>
      </div>

      {/* FG layer — content. Padding-top większe (pt-24) żeby zostawić miejsce
          na sticky Nav, który teraz jest globalny w app/page.tsx */}
      <div
        ref={fgRef}
        className="relative z-30 flex h-full flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28 lg:px-14"
      >
        {/* Spacer (Nav jest teraz globalny, więc nie ma tu wewnętrznej nawigacji) */}
        <div aria-hidden />

        {/* Hero block */}
        <div className="max-w-6xl">
          <p className="hero-meta mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574] md:mb-6 md:text-[11px] md:tracking-[0.32em]">
            — Portfolio · Est. 2026 · {profile.location}
          </p>
          <h1 className="font-display text-[clamp(2.8rem,11vw,12rem)] font-light leading-[0.95] tracking-tight text-white">
            {profile.tagline_lines.map((line, i) => (
              <span
                key={i}
                className={`block overflow-hidden pb-[0.12em] ${
                  i === 1 ? 'italic text-[#d4a574]' : ''
                }`}
              >
                <span className="hero-line inline-block">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero-meta mt-6 max-w-xl font-mono text-[13px] leading-relaxed text-white/60 md:mt-8 md:text-sm">
            {profile.intro}
          </p>
        </div>

        {/* Footer row — uproszczone na mobile, pełne na desktop */}
        <div className="grid grid-cols-2 items-end gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 md:grid-cols-4 md:gap-6 md:text-[11px] md:tracking-[0.2em]">
          <div className="hero-meta">
            <span className="block text-white/30">N° 001 / 2026</span>
            <span>Portfolio</span>
          </div>
          <div className="hero-meta">
            <span className="block text-white/30">Warsaw</span>
            <span ref={clockRef}>--:--:--</span>
          </div>
          <div className="hero-meta hidden md:block">
            <span className="block text-white/30">Stack</span>
            <span>Three · GSAP · Lenis</span>
          </div>
          {/* Scroll cue — ukryte na mobile (mało użyteczne, ciasno) */}
          <div className="hero-meta hidden items-end justify-end gap-3 md:flex">
            <span className="text-right">
              <span className="block text-white/30">Scroll</span>
              <span>↓ Selected work</span>
            </span>
            <div className="relative h-12 w-px bg-white/15">
              <div className="scroll-cue-bar absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-[#d4a574]" />
            </div>
          </div>
        </div>
      </div>

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-40 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />

      {/* Hidden parallax anchor */}
      <div className="hero-bg-decoration absolute inset-0 z-10" />
    </section>
  )
}
