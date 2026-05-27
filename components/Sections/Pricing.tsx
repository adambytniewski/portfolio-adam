'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * PRICING — 3 paczki z konkretnymi cenami i feature list.
 *
 * Layout:
 *  - 3 cinematic cards w grid (mobile stack, desktop 3-col)
 *  - Middle ("Pro") highlighted z accent border + lift + "Najczęstszy wybór" tag
 *  - Każda card: tier name, tag, cena od/do, features list, CTA button → #brief
 *  - GSAP entry: cards wjeżdżają z dołu z 3D rotateX (perspective)
 *  - Hover: subtle scale + glow accent
 */

const formatPrice = (p: number) =>
  p.toLocaleString('pl-PL').replace(/,/g, ' ') + ' zł'

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.pricing-head', {
        y: isMobile ? 16 : 24,
        duration: isMobile ? 0.7 : 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })
      gsap.from('.pricing-card', {
        y: isMobile ? 30 : 80,
        rotateX: isMobile ? 0 : -15,
        transformPerspective: 1200,
        transformOrigin: '50% 100%',
        duration: isMobile ? 0.7 : 1.1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.pricing-grid',
          start: isMobile ? 'top 95%' : 'top 85%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative overflow-hidden bg-[#0a0908] py-24 md:py-44"
    >
      {/* Background ambient glow — center bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[500px] opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center bottom, rgba(212,165,116,0.35) 0%, rgba(212,165,116,0) 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <div className="pricing-head mb-6 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:mb-10 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 004 — Cennik</span>
          <span className="hidden text-[#d4a574] md:inline">
            Przejrzysty. Bez surprise-billa.
          </span>
        </div>

        <h2 className="pricing-head font-display text-[clamp(2.4rem,9vw,6rem)] font-light leading-[1.02] tracking-tight text-white">
          Trzy paczki —{' '}
          <span className="italic text-[#d4a574]">jasne ceny</span>.
        </h2>

        <p className="pricing-head mt-5 max-w-2xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-7 md:text-sm">
          Wybierz to co pasuje, dostosujemy do branży. Po briefie dostajesz
          dokładną wycenę — nie wartości "od X do Y", ale konkretną liczbę.
        </p>

        <div className="pricing-grid mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
          {agency.pricing.map((pkg) => {
            const isHighlight = pkg.highlight
            return (
              <article
                key={pkg.tier}
                className={`pricing-card group relative flex flex-col overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-all md:p-8 ${
                  isHighlight
                    ? 'border-[#d4a574]/60 bg-[#d4a574]/[0.04] md:scale-[1.03] md:shadow-[0_30px_80px_-20px_rgba(212,165,116,0.3)]'
                    : 'border-white/10 bg-white/[0.015] hover:border-white/25'
                }`}
              >
                {/* Highlight badge */}
                {isHighlight && (
                  <div className="absolute -top-px left-0 right-0 mx-auto w-fit -translate-y-1/2 rounded-full bg-[#d4a574] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0a0908]">
                    ★ {pkg.tag}
                  </div>
                )}

                {/* Tier + tag */}
                <div className="flex items-baseline justify-between">
                  <h3
                    className={`font-display text-3xl font-light leading-tight md:text-4xl ${
                      isHighlight ? 'text-white' : 'text-white/90'
                    }`}
                  >
                    {pkg.tier}
                  </h3>
                  {!isHighlight && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                      {pkg.tag}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#d4a574]">
                    od
                  </p>
                  <p className="mt-1 font-display text-3xl font-light leading-tight text-white md:text-4xl">
                    {formatPrice(pkg.priceFrom)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-white/45">
                    {pkg.priceTo
                      ? `do ${formatPrice(pkg.priceTo)} netto`
                      : '· skala bez ograniczeń'}
                  </p>
                </div>

                {/* Divider */}
                <div className="my-7 h-px w-full bg-white/10" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {pkg.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 font-mono text-[12px] leading-relaxed text-white/70 md:text-[13px]"
                    >
                      <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[#d4a574]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#brief"
                  data-magnetic
                  className={`mt-8 inline-flex items-center justify-between rounded-full border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-all md:mt-10 md:px-6 md:py-3.5 ${
                    isHighlight
                      ? 'border-[#d4a574] bg-[#d4a574] text-[#0a0908] hover:bg-white'
                      : 'border-white/20 text-white/75 hover:border-[#d4a574] hover:text-[#d4a574]'
                  }`}
                >
                  <span>{pkg.cta}</span>
                  <span>→</span>
                </a>
              </article>
            )
          })}
        </div>

        {/* Below pricing — small note */}
        <p className="pricing-head mt-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/35 md:mt-14">
          Wszystkie ceny netto. Faktura VAT albo odwrotne obciążenie dla UE.
        </p>
      </div>
    </section>
  )
}
