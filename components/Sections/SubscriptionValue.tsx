'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * SUBSCRIPTION VALUE — co dostajesz w subskrypcji miesięcznej.
 *
 * "Wszystko w jednym. Bez surprise-bila."
 * Pokazuje 6 includes: domena, hosting, SSL, updaty, monitoring, support.
 * BEZ CENY — cena indywidualna, ustalana po mockupie.
 *
 * Layout: 2x3 bento grid, każdy include z subtle ikona+title+desc.
 * GSAP entry: cards wjeżdżają w stagger, hover lift na desktop.
 */

// Subtle SVG icons — minimal cinematic style
function ServiceIcon({ kind }: { kind: string }) {
  const className = 'h-7 w-7 text-[#d4a574] md:h-8 md:w-8'
  switch (kind) {
    case 'domena':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      )
    case 'hosting':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <circle cx="7" cy="7" r="0.8" fill="currentColor" />
          <circle cx="7" cy="17" r="0.8" fill="currentColor" />
        </svg>
      )
    case 'ssl':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M8 11V7a4 4 0 018 0v4" />
        </svg>
      )
    case 'updates':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 12a9 9 0 019-9 9 9 0 016.36 2.64L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 01-9 9 9 9 0 01-6.36-2.64L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      )
    case 'monitoring':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 12h4l3-7 4 14 3-7h4" />
        </svg>
      )
    case 'support':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      )
    default:
      return null
  }
}

export default function SubscriptionValue() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.sub-head', {
        y: isMobile ? 16 : 24,
        duration: 0.9,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })
      gsap.from('.sub-card', {
        y: isMobile ? 24 : 50,
        duration: isMobile ? 0.7 : 0.9,
        stagger: 0.06,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.sub-grid',
          start: isMobile ? 'top 95%' : 'top 85%',
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      id="subscription"
      className="relative overflow-hidden bg-transparent py-24 md:py-44"
    >
      <div className="relative mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <div className="sub-head flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:text-[11px] md:tracking-[0.32em]">
          <span>{agency.subscription.eyebrow}</span>
          <span className="hidden text-[#d4a574] md:inline">
            6 rzeczy w jednej kwocie
          </span>
        </div>

        <h2 className="sub-head mt-6 font-display text-[clamp(2.4rem,9vw,6rem)] font-light leading-[1.02] tracking-tight text-white md:mt-10">
          {agency.subscription.headline}{' '}
          <span className="italic text-[#d4a574]">
            {agency.subscription.headlineAccent}
          </span>
        </h2>

        <p className="sub-head mt-5 max-w-2xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-7 md:text-sm">
          {agency.subscription.body}
        </p>

        {/* === 2x3 BENTO GRID === */}
        <div className="sub-grid mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {agency.subscription.includes.map((item, i) => (
            <article
              key={i}
              className="sub-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] p-6 backdrop-blur-sm transition-colors hover:border-[#d4a574]/40 md:p-7"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#d4a574]/30 bg-[#d4a574]/[0.06]">
                <ServiceIcon kind={item.icon} />
              </div>

              {/* Tag */}
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                · 0{i + 1} / 06
              </p>

              {/* Title */}
              <h3 className="mt-2 font-display text-xl font-light leading-snug text-white md:text-2xl">
                {item.label}
              </h3>

              {/* Desc */}
              <p className="mt-3 font-mono text-[12px] leading-relaxed text-white/55 md:text-[13px]">
                {item.desc}
              </p>

              {/* Hover accent rule */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#d4a574] via-[#d4a574]/60 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>

        {/* Bottom note — pricing disclaimer */}
        <div className="sub-head mt-12 rounded-2xl border border-white/10 bg-white/[0.015] p-6 md:mt-16 md:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:gap-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
                ★ Cena dopasowana indywidualnie
              </p>
              <p className="mt-3 max-w-xl font-mono text-[13px] leading-relaxed text-white/65 md:text-sm">
                Konkretna kwota zależy od zakresu Twojej strony, branży i
                liczby integracji. Po DARMOWYM mockupie dostajesz dokładną liczbę
                miesięczną — bez surprise-billa.
              </p>
            </div>
            <a
              href="#mockup"
              data-magnetic
              className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[#d4a574]/60 bg-[#d4a574]/[0.08] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#d4a574] transition-all hover:bg-[#d4a574] hover:text-[#0a0908]"
            >
              Zacznij od mockupu
              <span>↑</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
