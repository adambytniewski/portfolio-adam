'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { now, formatDatePL } from '../../lib/content'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Now feed — DARK BLADE TRANSITION.
 *
 * After the cream/light Featured section, we need to slam back into dark.
 * Solution: a diagonally-skewed dark BLADE sweeps across the screen from
 * the bottom-right, instantly covering the light section. The Now content
 * is revealed underneath the blade as it lands.
 *
 * Alternating row entries — odd rows slide from left, even from right —
 * creates a typewriter-like rhythm as the user scrolls through the feed.
 */
export default function NowFeed() {
  const ref = useRef<HTMLDivElement>(null)
  const bladeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // === DARK BLADE SWEEP ===
      // The blade lives ABOVE the section in normal flow. As we scroll
      // toward Now, the blade's clip-path skews from bottom-right corner
      // covering 0% → 100% of viewport diagonally.
      const blade = bladeRef.current
      if (blade) {
        gsap.set(blade, {
          clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
        })
        gsap.to(blade, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'top 40%',
            scrub: 0.6,
          },
        })
      }

      // Alternating-direction row entries
      const rows = gsap.utils.toArray<HTMLElement>('.now-row')
      rows.forEach((row, i) => {
        const fromX = i % 2 === 0 ? -120 : 120
        gsap.from(row, {
          x: fromX,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 88%',
          },
        })
      })

      gsap.from('.now-head-line', {
        yPercent: 100,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 70%',
        },
      })

      // Pulsing live dot
      gsap.to('.live-dot', {
        opacity: 0.3,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const latest = now[0]

  return (
    <div ref={ref} className="relative">
      {/* DARK BLADE — sweeps across viewport from bottom-right
          covering the light Featured section as user scrolls in */}
      <div
        ref={bladeRef}
        aria-hidden
        className="absolute inset-x-0 -top-40 z-10 h-80 md:h-96"
        style={{
          background:
            'linear-gradient(180deg, #f5f1ea 0%, #2a1f1a 35%, #0a0908 100%)',
        }}
      />

      <section
        id="now"
        className="relative bg-[#0a0908] py-32 md:py-44 overflow-hidden"
      >
        {/* Subtle warm horizon glow at top — vestige of Featured light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            background:
              'linear-gradient(180deg, rgba(212,165,116,0.18) 0%, rgba(212,165,116,0) 100%)',
          }}
        />

        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-14">
          <div className="mb-10 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.32em] text-white/40">
            <span>N° 006 — Now</span>
            <span className="flex items-center gap-2 text-[#d4a574]">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[#d4a574]" />
              Aktualizowane na żywo
            </span>
          </div>

          <h2 className="font-display text-[clamp(2.2rem,7vw,6rem)] font-light leading-[0.95] tracking-tight text-white">
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="now-head-line inline-block">Aktualne</span>
            </span>
            <span className="block overflow-hidden italic text-[#d4a574] pb-[0.12em]">
              <span className="now-head-line inline-block">realizacje.</span>
            </span>
          </h2>

          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/55">
            Dziennik prac aktualizowany regularnie — najnowsze projekty,
            wdrożenia i odkrycia ze stacku AI, narzędzi i frameworków, których
            używam na co dzień.
          </p>

          {latest && (
            <div className="now-row mt-16 grid gap-6 rounded-md border border-[#d4a574]/30 bg-[#d4a574]/5 p-8 md:grid-cols-12">
              <div className="md:col-span-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574]">
                  ★ Najnowsze · {latest.tag}
                </p>
                <p className="mt-2 font-mono text-xs text-white/55">
                  {formatDatePL(latest.date)}
                </p>
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-2xl font-light leading-tight text-white md:text-3xl">
                  {latest.title}
                </h3>
                <p className="mt-3 font-mono text-sm leading-relaxed text-white/65">
                  {latest.body}
                </p>
              </div>
            </div>
          )}

          <ul className="now-list mt-6 divide-y divide-white/10 border-t border-white/10">
            {now.slice(1).map((it, i) => (
              <li
                key={i}
                className="now-row group grid gap-4 py-7 transition-colors md:grid-cols-12 md:gap-6 hover:bg-white/[0.02]"
              >
                <div className="md:col-span-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {formatDatePL(it.date)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 group-hover:border-[#d4a574]/50 group-hover:text-[#d4a574] transition-colors">
                    {it.tag}
                  </span>
                </div>
                <div className="md:col-span-8">
                  <h4 className="font-display text-xl font-light leading-tight text-white md:text-2xl">
                    {it.title}
                  </h4>
                  <p className="mt-2 font-mono text-[13px] leading-relaxed text-white/55">
                    {it.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
            → Sekcja aktualizowana regularnie z każdym kolejnym projektem.
          </p>
        </div>
      </section>
    </div>
  )
}
