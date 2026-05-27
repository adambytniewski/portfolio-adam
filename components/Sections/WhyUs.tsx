'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * WHY US — section z 6 differentiatorami Redmind Agency vs WordPress/Wix.
 *
 * Layout:
 *  - Bento grid 2x3 na desktop, 1 column na mobile
 *  - Każda karta ma cinematic feel: subtle border glow, hover lift, accent rule
 *  - GSAP entry: stagger reveal z lekkim Y offset
 *  - Premium typography (font-display dla numerów, font-mono dla tagów)
 */

export default function WhyUs() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.why-head', {
        y: isMobile ? 16 : 24,
        duration: isMobile ? 0.7 : 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })
      gsap.from('.why-card', {
        y: isMobile ? 30 : 60,
        duration: isMobile ? 0.7 : 1.0,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.why-grid',
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })

      // Hover tilt on desktop only — light parallax
      if (!isMobile) {
        document.querySelectorAll<HTMLElement>('.why-card').forEach((card) => {
          const onMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect()
            const cx = (e.clientX - rect.left) / rect.width - 0.5
            const cy = (e.clientY - rect.top) / rect.height - 0.5
            gsap.to(card, {
              rotateY: cx * 6,
              rotateX: -cy * 6,
              transformPerspective: 1000,
              duration: 0.6,
              ease: 'power2.out',
            })
          }
          const onLeave = () => {
            gsap.to(card, {
              rotateY: 0,
              rotateX: 0,
              duration: 0.9,
              ease: 'expo.out',
            })
          }
          card.addEventListener('mousemove', onMove)
          card.addEventListener('mouseleave', onLeave)
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="why"
      className="relative overflow-hidden bg-[#0a0908] py-24 md:py-44"
    >
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(212,165,116,0.4) 0%, rgba(212,165,116,0) 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <div className="why-head mb-6 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:mb-10 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 002 — Możliwości</span>
          <span className="hidden text-[#d4a574] md:inline">
            Czego nie da WordPress
          </span>
        </div>

        <h2 className="why-head font-display text-[clamp(2.4rem,9vw,6rem)] font-light leading-[1.02] tracking-tight text-white">
          Dlaczego{' '}
          <span className="italic text-[#d4a574]">Redmind</span>,
          <br />
          a nie szablon.
        </h2>

        <p className="why-head mt-5 max-w-2xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-7 md:text-sm">
          Sześć rzeczy które dostajesz tylko jak płacisz za ręczny code, a
          których nigdy nie dostaniesz z page-buildera. Wystarczy żeby Twój
          klient zostawał 3× dłużej.
        </p>

        <div className="why-grid mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {agency.whyUs.map((item) => (
            <article
              key={item.n}
              className="why-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] p-6 backdrop-blur-sm transition-colors hover:border-[#d4a574]/40 md:p-7"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Number — subtle giant background */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-4 font-display text-[7rem] font-light italic leading-none text-[#d4a574]/[0.07] md:text-[8rem]"
              >
                {item.n}
              </span>

              {/* Tiny tag */}
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
                {item.n} · feature
              </p>

              {/* Title */}
              <h3 className="mt-4 font-display text-xl font-light leading-snug text-white md:text-2xl">
                {item.title}
              </h3>

              {/* Desc */}
              <p className="mt-3 font-mono text-[12px] leading-relaxed text-white/60 md:text-[13px]">
                {item.desc}
              </p>

              {/* Bottom accent rule */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#d4a574] via-[#d4a574]/60 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
