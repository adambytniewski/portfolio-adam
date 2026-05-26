'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Manifesto — EMERGENCE FROM PUNCH-THROUGH.
 *
 * The hero ends with a black flash (we punched through the screen).
 * Manifesto starts with a single glowing horizon line that EXPANDS
 * upward and outward, parting the darkness like a sunrise on the
 * other side of the tunnel. Words then resolve word-by-word as scroll
 * continues.
 */
export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      if (isMobile) {
        // === MOBILE: subtle reveals, opacity zawsze 1 (CSS safety) ===
        // Emergence line — scaleX reveal (bez scrub, normal animation)
        gsap.from('.emergence-line', {
          scaleX: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start: 'top 95%' },
        })
        // Manifesto words — subtle stagger Y (bez blur, CSS safety wymusi filter:none)
        gsap.from('.manifesto-word', {
          y: 12,
          duration: 0.5,
          stagger: 0.03,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 90%' },
        })
        // Meta grid (bullets 01/02/03/04)
        gsap.from('.manifesto-meta', {
          y: 16,
          duration: 0.6,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start: 'top 90%' },
        })
        return
      }

      // === DESKTOP: pełne cinematic scrub reveals ===
      gsap.fromTo(
        '.emergence-line',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 95%',
            end: 'top 60%',
            scrub: 0.5,
          },
        },
      )
      gsap.fromTo(
        '.emergence-glow',
        { opacity: 0, scaleX: 0.2 },
        {
          opacity: 1,
          scaleX: 1.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 95%',
            end: 'top 45%',
            scrub: 0.5,
          },
        },
      )

      const words = gsap.utils.toArray<HTMLElement>('.manifesto-word')
      gsap.fromTo(
        words,
        { opacity: 0.1, filter: 'blur(4px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.05,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 0.6,
          },
        },
      )

      gsap.from('.manifesto-meta', {
        opacity: 0,
        y: 12,
        stagger: 0.06,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 75%',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  const text =
    'Buduję cinematic strony, automatyzacje n8n, second brain, aplikacje, generuję wideo, foto i muzykę — używając AI jako współpracownika, nie zabawki.'
  const words = text.split(' ')

  return (
    <section
      ref={ref}
      id="manifesto"
      className="relative bg-[#0a0908] py-24 md:py-56 overflow-hidden"
    >
      {/* HORIZON EMERGENCE — glowing line bursting open from punch-through */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-20 z-0 flex flex-col items-center"
      >
        {/* The expanding glow halo */}
        <div
          className="emergence-glow absolute -top-10 h-72 w-full max-w-5xl rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(212,165,116,0.35) 0%, rgba(212,165,116,0.08) 40%, transparent 70%)',
            transformOrigin: 'center',
            filter: 'blur(20px)',
          }}
        />
        {/* The thin horizon line */}
        <div
          className="emergence-line h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-[#d4a574] to-transparent"
          style={{ transformOrigin: 'center' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <div className="manifesto-meta mb-10 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:mb-16 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 002 — Manifesto</span>
          <span className="hidden md:inline">— co tu znajdziesz</span>
        </div>

        <p className="font-display text-[clamp(1.75rem,7vw,5rem)] font-light leading-[1.12] tracking-tight text-white md:leading-[1.05]">
          {words.map((w, i) => {
            const italics = ['cinematic', 'second', 'brain', 'AI']
            const accent = ['współpracownika,', 'współpracownika', 'AI']
            const isItalic = italics.some((x) =>
              w.toLowerCase().startsWith(x.toLowerCase()),
            )
            const isAccent = accent.some(
              (x) =>
                w.toLowerCase().replace(',', '') ===
                x.toLowerCase().replace(',', ''),
            )
            return (
              <span key={i}>
                <span
                  className={`manifesto-word inline-block ${
                    isItalic ? 'italic' : ''
                  } ${isAccent ? 'text-[#d4a574]' : ''}`}
                >
                  {w}
                </span>
                {i < words.length - 1 ? ' ' : ''}
              </span>
            )
          })}
        </p>

        <div className="manifesto-meta mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50 md:mt-20 md:grid-cols-4 md:gap-8 md:pt-10 md:text-xs md:tracking-[0.2em]">
          <div>
            <span className="block text-white/30">01</span>
            <span>Cinematic web</span>
          </div>
          <div>
            <span className="block text-white/30">02</span>
            <span>Automatyzacje</span>
          </div>
          <div>
            <span className="block text-white/30">03</span>
            <span>AI media</span>
          </div>
          <div>
            <span className="block text-white/30">04</span>
            <span>Second brain</span>
          </div>
        </div>
      </div>
    </section>
  )
}
