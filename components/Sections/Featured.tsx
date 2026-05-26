'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { work, CATEGORY_LABEL, formatDatePL } from '../../lib/content'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Featured Project — IRIS BLOOM TRANSITION.
 *
 * The dark Work section flows into a cream/light Featured section.
 * Instead of a hard color-cut, we use an APERTURE that opens from a
 * single point — like a camera lens iris. The light grows from a hot
 * spot at the top-center and engulfs the screen as the user scrolls in.
 *
 * Pinned section: while the iris opens, the page stays put. Once the
 * iris fills the viewport, scrolling continues and reveals the full
 * Featured content underneath.
 */
export default function Featured() {
  const ref = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const irisRef = useRef<HTMLDivElement>(null)
  const flareRef = useRef<HTMLDivElement>(null)
  const item = work.find((w) => w.featured) ?? work[0]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // === IRIS BLOOM TRANSITION ===
      // Na mobile (touch scroll = inertial, niedokładny) clip-path scrub
      // wygląda nerwowo — pokazujemy zawartość od razu, bez iris animation.
      const isMobile = window.matchMedia('(max-width: 767px)').matches

      const iris = irisRef.current
      const flare = flareRef.current

      if (isMobile) {
        // Mobile: iris od razu otwarte, flare ukryty
        if (iris) gsap.set(iris, { clipPath: 'circle(160% at 50% 30%)' })
        if (flare) gsap.set(flare, { opacity: 0 })
      } else {
        // Desktop: pełen iris bloom scrub
        if (iris) gsap.set(iris, { clipPath: 'circle(0% at 50% 30%)' })
        if (flare) gsap.set(flare, { opacity: 0, scale: 0.3 })

        const irisTl = gsap.timeline({
          defaults: { duration: 1, ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'top top',
            scrub: 0.9,
          },
        })

        irisTl.fromTo(
          flare,
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.35, ease: 'power1.out' },
          0,
        )
        irisTl.fromTo(
          iris,
          { clipPath: 'circle(0% at 50% 30%)' },
          { clipPath: 'circle(160% at 50% 30%)', duration: 0.7 },
          0.25,
        )
        irisTl.to(
          flare,
          { opacity: 0, ease: 'power1.in', duration: 0.2 },
          0.8,
        )
      }

      // === Inner content animations (after iris opens) ===
      gsap.to('.featured-image', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to('.featured-headline', {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.featured-headline',
          start: 'top 80%',
          end: 'top 25%',
          scrub: 1,
        },
      })

      gsap.from('.featured-stat', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.featured-stats',
          start: 'top 80%',
        },
      })

      gsap.from('.featured-line', {
        yPercent: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.featured-copy',
          start: 'top 75%',
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Pre-iris flare — a hot pinpoint of light that anticipates the bloom.
          Lives in the dark space ABOVE the Featured section. */}
      <div
        ref={flareRef}
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: '50%',
          top: '0',
          transform: 'translate(-50%, -100%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(255,217,160,0.85) 0%, rgba(212,165,116,0.4) 30%, rgba(212,165,116,0) 70%)',
          mixBlendMode: 'screen',
          filter: 'blur(8px)',
        }}
      />

      {/* The iris-clipped Featured section */}
      <section
        ref={wrapRef}
        id="featured"
        className="relative bg-[#f5f1ea] py-24 md:py-48 overflow-hidden text-stone-900"
      >
        <div
          ref={irisRef}
          className="relative"
          style={{ clipPath: 'circle(0% at 50% 30%)' }}
        >
          <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
            <div className="mb-8 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-stone-500 md:mb-10 md:text-[11px] md:tracking-[0.32em]">
              <span>N° 005 — Featured</span>
              <span className="hidden md:inline">
                {CATEGORY_LABEL[item.category]} · {formatDatePL(item.date)}
              </span>
            </div>

            <h2
              className="featured-headline font-display text-[clamp(2.6rem,10vw,7rem)] font-light leading-[0.95] tracking-tight"
              style={{ clipPath: 'inset(0 100% 0 0)' }}
            >
              {item.title.split(' ')[0]}{' '}
              <span className="italic text-[#a8632d]">
                {item.title.split(' ').slice(1).join(' ') || '·'}
              </span>
            </h2>
            <p className="mt-3 font-mono text-[13px] uppercase tracking-[0.18em] text-stone-500 md:mt-4 md:text-sm md:tracking-[0.2em]">
              {item.subtitle}
            </p>

            <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-16">
              {/* Image */}
              <div className="md:col-span-7">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-stone-300">
                  <div
                    className="featured-image absolute -inset-y-12 inset-x-0 bg-cover bg-center"
                    style={{
                      backgroundImage: item.cover
                        ? `url(${item.cover})`
                        : 'linear-gradient(135deg, #2a1f1a, #d4a574)',
                    }}
                  />
                  <div className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/85">
                    <span className="block">Fig. 01</span>
                    <span>{item.id}</span>
                  </div>
                </div>
              </div>

              {/* Copy + stats */}
              <div className="featured-copy md:col-span-5 flex flex-col justify-center space-y-5 font-mono text-[15px] leading-relaxed text-stone-700">
                <p className="overflow-hidden">
                  <span className="featured-line inline-block">
                    {item.description}
                  </span>
                </p>
                <p className="overflow-hidden">
                  <span className="featured-line inline-block text-stone-900">
                    Stack: {item.stack.join(' · ')}
                  </span>
                </p>

                <div className="featured-stats mt-4 grid grid-cols-2 gap-6 border-t border-stone-300 pt-8">
                  <div className="featured-stat">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                      Status
                    </p>
                    <p className="mt-1 font-display text-3xl font-light italic">
                      Active
                    </p>
                  </div>
                  <div className="featured-stat">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                      Started
                    </p>
                    <p className="mt-1 font-display text-3xl font-light">
                      {new Date(item.date).getFullYear()}
                    </p>
                  </div>
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    data-magnetic
                    className="featured-line mt-6 inline-block w-fit border-b border-stone-900 pb-1 font-mono text-sm uppercase tracking-[0.18em] text-stone-900 hover:border-[#a8632d] hover:text-[#a8632d] transition-colors"
                  >
                    Zobacz projekt →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
