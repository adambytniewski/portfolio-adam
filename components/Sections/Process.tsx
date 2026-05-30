'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * PROCESS — Act V: 5 kroków od briefa do "Grow"
 *
 * Layout:
 *  - Vertical timeline z połączeniem między krokami (animowana linia)
 *  - Każdy krok: roman numeral + tytuł + subtitle + opis + duration badge
 *  - GSAP scrub: linia rośnie wraz ze scrollem
 *  - Premium feel: kazdy step ma 3D-rotated number jako tło
 */

export default function Process() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.process-head', {
        y: isMobile ? 16 : 24,
        duration: isMobile ? 0.7 : 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })

      // Connecting line grow on scroll
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: 'top center',
            ease: 'none',
            scrollTrigger: {
              trigger: '.process-list',
              start: 'top 80%',
              end: 'bottom 70%',
              scrub: 0.8,
            },
          },
        )
      }

      // Each step reveal
      gsap.from('.process-step', {
        x: isMobile ? -20 : -50,
        duration: isMobile ? 0.7 : 1.0,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.process-list',
          start: isMobile ? 'top 90%' : 'top 75%',
        },
      })

      // Numbers — subtle float on idle (desktop only)
      if (!isMobile) {
        document
          .querySelectorAll<HTMLElement>('.process-num')
          .forEach((el, i) => {
            gsap.to(el, {
              y: '+=5',
              duration: 3 + i * 0.3,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            })
          })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative overflow-hidden bg-transparent py-24 md:py-44"
    >
      {/* Diagonal ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(212,165,116,0.6) 0%, rgba(212,165,116,0) 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-10 lg:px-14">
        <div className="process-head mb-6 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:mb-10 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 003 — Proces</span>
          <span className="hidden text-[#d4a574] md:inline">
            Od briefa do launch
          </span>
        </div>

        <h2 className="process-head font-display text-[clamp(2.4rem,9vw,6rem)] font-light leading-[1.02] tracking-tight text-white">
          Pięć aktów —{' '}
          <span className="italic text-[#d4a574]">jeden film</span>.
        </h2>

        <p className="process-head mt-5 max-w-2xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-7 md:text-sm">
          Każdy etap zaplanowany. Każdy krok research-first — audytujemy Twoją
          branżę, konkurencję, klientów zanim napiszemy linijkę kodu. Bez
          "to się okaże po drodze".
        </p>

        {/* === Hands+keyboard photo — floating sideways === */}
        <div className="process-head mt-12 hidden md:block">
          <div className="relative -mr-10 ml-auto h-56 max-w-3xl overflow-hidden rounded-2xl border border-white/10 md:h-72 lg:h-80">
            <Image
              src="/images/hands-keyboard.jpg"
              alt="Ręce na klawiaturze — ręczny code"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[#0a0908] via-[#0a0908]/40 to-transparent"
            />
            <div className="absolute bottom-5 left-5 max-w-xs">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
                — Każda linia ręcznie
              </p>
              <p className="mt-2 font-display text-lg font-light italic text-white md:text-xl">
                "Code który nikt inny nie ma."
              </p>
            </div>
          </div>
        </div>

        <div className="process-list relative mt-14 md:mt-20">
          {/* Vertical connecting line — animuje się ScrollTriggerem */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-7 top-4 bottom-4 w-px md:left-12"
          >
            <div
              ref={lineRef}
              className="h-full w-full bg-gradient-to-b from-[#d4a574] via-[#d4a574]/40 to-transparent"
              style={{ transformOrigin: 'top center' }}
            />
          </div>

          <ol className="space-y-12 md:space-y-16">
            {agency.process.map((step) => (
              <li key={step.n} className="process-step relative pl-16 md:pl-24">
                {/* Number circle */}
                <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4a574]/40 bg-[#0a0908] md:h-24 md:w-24">
                  <span className="process-num font-display text-2xl font-light italic text-[#d4a574] md:text-4xl">
                    {step.n}
                  </span>
                </div>

                {/* Content */}
                <div className="pt-1 md:pt-3">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-2xl font-light leading-tight text-white md:text-4xl">
                      {step.title}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#d4a574]">
                      {step.subtitle}
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-4 md:text-sm">
                    {step.desc}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:text-[11px]">
                    <span className="block h-1 w-1 rounded-full bg-[#d4a574]" />
                    {step.duration}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Final note */}
        <p className="process-head mt-16 max-w-xl font-display text-lg font-light italic leading-relaxed text-white/55 md:mt-24 md:text-xl">
          "Mając plan, można go optymalizować. Bez planu nie ma czego optymalizować."
        </p>
      </div>
    </section>
  )
}
