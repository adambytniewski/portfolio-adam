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
    const ctx = gsap.context(() => {
      // === HERO ENTRY ANIMATION (one-time, on load) ===
      gsap.from('.hero-line', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.12,
        ease: 'expo.out',
        delay: 0.4,
      })

      gsap.from('.hero-meta', {
        opacity: 0,
        y: 8,
        duration: 1,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 1.2,
      })

      // Pulsing scroll cue
      gsap.to('.scroll-cue-bar', {
        scaleY: 1,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'top center',
      })

      // === 3-LAYER PARALLAX (closer = slower) ===
      // Background canvas/decoration drifts most, mid type a bit less,
      // foreground content barely moves. Gives editorial depth on scroll.
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

      {/* MID layer — gigantic decorative type, parallax-shifted slower than fg */}
      <div
        ref={midRef}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      >
        <span className="font-display text-[28vw] font-thin italic leading-none text-white/[0.045] select-none">
          adam.
        </span>
      </div>

      {/* FG layer — content */}
      <div
        ref={fgRef}
        className="relative z-30 flex h-full flex-col justify-between p-6 md:p-10 lg:p-14"
      >
        {/* Top nav */}
        <nav className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
          <a href="#top" className="text-white">
            ADAM B<span className="text-[#d4a574]">.</span>
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#work" className="hover:text-white transition-colors">Work</a>
            <a href="#featured" className="hover:text-white transition-colors">Featured</a>
            <a href="#now" className="hover:text-white transition-colors">Now</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <a
            href={`mailto:${profile.email}`}
            data-magnetic
            className="rounded-full border border-white/20 px-4 py-2 text-white transition-colors hover:border-[#d4a574] hover:text-[#d4a574]"
          >
            {profile.available ? '● Otwarty na zlecenia' : 'Kontakt'}
          </a>
        </nav>

        {/* Hero block */}
        <div className="max-w-6xl">
          <p className="hero-meta mb-6 font-mono text-[11px] uppercase tracking-[0.32em] text-[#d4a574]">
            — Portfolio · Est. 2026 · {profile.location}
          </p>
          <h1 className="font-display text-[clamp(3.2rem,12vw,12rem)] font-light leading-[0.95] tracking-tight text-white">
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
          <p className="hero-meta mt-8 max-w-xl font-mono text-sm leading-relaxed text-white/60">
            {profile.intro}
          </p>
        </div>

        {/* Footer row */}
        <div className="grid grid-cols-2 items-end gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 md:grid-cols-4">
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
          <div className="hero-meta flex items-end justify-end gap-3">
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
