'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * SectionInterstitial — a thin warm horizon line that travels across
 * the screen at section boundaries. Subtle but signals "we crossed
 * a boundary" — like film cuts in a director's reel.
 *
 * Variants:
 *   "line"    — single horizon line (default)
 *   "double"  — two parallel lines (for major boundaries)
 *
 * Use sparingly. Recommended only between dark→dark transitions.
 */
export default function SectionInterstitial({
  variant = 'line',
}: {
  variant?: 'line' | 'double'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('.interstitial-line')
      lines.forEach((line, i) => {
        gsap.fromTo(
          line,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            transformOrigin: i % 2 === 0 ? 'left center' : 'right center',
            ease: 'expo.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 95%',
              end: 'top 60%',
              scrub: 0.5,
            },
          },
        )
      })

      gsap.fromTo(
        '.interstitial-glow',
        { opacity: 0, scaleX: 0 },
        {
          opacity: 1,
          scaleX: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 95%',
            end: 'top 50%',
            scrub: 0.5,
          },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative h-0 w-full overflow-visible"
    >
      <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-3">
        {/* Soft glow halo */}
        <div
          className="interstitial-glow absolute -top-20 h-40 w-full max-w-3xl rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(212,165,116,0.22) 0%, rgba(212,165,116,0) 70%)',
            transformOrigin: 'center',
            filter: 'blur(24px)',
          }}
        />
        {/* The horizon line(s) */}
        <div className="relative z-10 flex w-full max-w-6xl flex-col gap-2 px-6">
          <div
            className="interstitial-line h-px w-full bg-gradient-to-r from-transparent via-[#d4a574]/70 to-transparent"
            style={{ transformOrigin: 'left center' }}
          />
          {variant === 'double' && (
            <div
              className="interstitial-line h-px w-1/2 self-end bg-gradient-to-r from-transparent via-[#d4a574]/40 to-transparent"
              style={{ transformOrigin: 'right center' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
