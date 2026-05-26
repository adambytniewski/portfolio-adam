'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  Category,
  WorkItem,
  formatDatePL,
  work,
} from '../../lib/content'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Wszystko' },
  ...CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
]

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<Category | 'all'>('all')

  const items = useMemo(
    () => (filter === 'all' ? work : work.filter((w) => w.category === filter)),
    [filter],
  )

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      // === Heading reveal — Y only, opacity safe przez CSS ===
      gsap.from('.work-head', {
        y: isMobile ? 16 : 24,
        duration: isMobile ? 0.6 : 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })

      // === Cards entry ===
      if (isMobile) {
        // Mobile: tylko subtle slide-up. NO opacity:0 (CSS safety net wymusi opacity:1)
        // NO rotateX (3D na mobile janky)
        gsap.from('.work-card', {
          y: 40,
          duration: 0.7,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.work-grid',
            start: 'top 95%',
          },
        })
      } else {
        // Desktop: pełna 3D-perspective entry
        gsap.from('.work-card', {
          opacity: 0,
          y: 90,
          rotateX: -22,
          scale: 0.92,
          transformPerspective: 1200,
          transformOrigin: '50% 100%',
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.work-grid',
            start: 'top 82%',
          },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Re-stagger animation when filter changes
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    // Y only — opacity:1 zawsze (CSS safety)
    gsap.fromTo(
      '.work-card',
      { y: isMobile ? 12 : 24 },
      {
        y: 0,
        duration: isMobile ? 0.4 : 0.6,
        stagger: 0.04,
        ease: 'expo.out',
        overwrite: 'auto',
      },
    )
  }, [filter])

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative bg-[#0a0908] py-24 md:py-44 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <div className="work-head mb-6 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 004 — Selected Work</span>
          <span className="hidden md:inline">{items.length} pozycji</span>
        </div>

        <h2 className="work-head font-display text-[clamp(2.2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-tight text-white">
          Co <span className="italic text-[#d4a574]">zbudowałem</span>
          <br />
          do tej pory.
        </h2>

        {/* Filter bar — na mobile scrollowalny horyzontalnie, żeby nie owijał się brzydko */}
        <div className="work-head mt-10 -mx-5 overflow-x-auto border-t border-white/10 px-5 pt-8 md:mx-0 md:mt-12 md:overflow-visible md:px-0">
          <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
            {FILTERS.map((f) => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  data-magnetic
                  className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-all ${
                    active
                      ? 'border-[#d4a574] bg-[#d4a574] text-[#0a0908]'
                      : 'border-white/15 text-white/65 hover:border-white/45 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="work-grid mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-6 md:gap-6">
          {items.map((item, i) => (
            <WorkCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Asymmetric grid pattern: alternate between large (4 cols) and small (2 cols)
 * to break the 3-column slop. Uses index modulo to drive col-spans.
 */
function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const pattern = index % 5
  const colSpan =
    pattern === 0
      ? 'md:col-span-4'
      : pattern === 1
        ? 'md:col-span-2'
        : pattern === 2
          ? 'md:col-span-3'
          : pattern === 3
            ? 'md:col-span-3'
            : 'md:col-span-2'
  // Aspect ratio: na mobile WSZYSTKIE karty mają taller 4/5 — content (tytuł,
  // subtitle, opis, tagi widoczne domyślnie) musi się zmieścić. Asymetryczny
  // wzorzec 16/10 / 5/4 wraca dopiero od md+ gdzie jest grid wielokolumnowy.
  const aspect =
    pattern === 0
      ? 'aspect-[4/5] md:aspect-[16/10]'
      : pattern === 2
        ? 'aspect-[4/5] md:aspect-[5/4]'
        : 'aspect-[4/5]'

  const ref = useRef<HTMLAnchorElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const img = imgRef.current
    if (!el || !img) return
    // Skip mousemove parallax on touch devices — listener nigdy by się nie odpalił
    // i mutation-observer-y mogłyby niepotrzebnie obciążać
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = (e.clientX - rect.left) / rect.width - 0.5
      const cy = (e.clientY - rect.top) / rect.height - 0.5
      gsap.to(img, {
        x: cx * 14,
        y: cy * 14,
        duration: 0.7,
        ease: 'power2.out',
      })
    }
    const onLeave = () => {
      gsap.to(img, { x: 0, y: 0, duration: 0.9, ease: 'expo.out' })
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <a
      ref={ref}
      href={item.link ?? '#'}
      data-magnetic-area
      className={`work-card group relative block ${colSpan} overflow-hidden rounded-md bg-[#1a1410]`}
    >
      <div className={`relative ${aspect} w-full overflow-hidden`}>
        <div
          ref={imgRef}
          className="absolute -inset-2 bg-cover bg-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          style={{
            backgroundImage: item.cover
              ? `url(${item.cover})`
              : 'linear-gradient(135deg, #2a1f1a, #5c3a1e)',
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent opacity-90"
          aria-hidden
        />

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/75">
          <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1 backdrop-blur">
            {CATEGORY_LABEL[item.category]}
          </span>
          {item.featured && (
            <span className="rounded-full border border-[#d4a574]/60 bg-[#d4a574]/15 px-3 py-1 text-[#d4a574] backdrop-blur">
              ★ Featured
            </span>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {formatDatePL(item.date)}
          </p>
          <h3 className="mt-2 font-display text-2xl font-light leading-tight text-white md:text-3xl">
            {item.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-white/55">
            {item.subtitle}
          </p>

          {/* Tags i opis — na touch device (mobile) widoczne domyślnie,
              na desktop ujawniane przy hoverze (oszczędność miejsca w gridzie) */}
          <div className="mt-3 max-h-32 overflow-hidden opacity-100 transition-all duration-500 md:max-h-0 md:opacity-0 md:group-hover:max-h-32 md:group-hover:opacity-100">
            <p className="font-mono text-[11px] leading-relaxed text-white/60">
              {item.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/65"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow indicator — tylko desktop hover (na mobile cała karta jest tappable) */}
        <span className="absolute right-5 top-1/2 hidden -translate-y-1/2 translate-x-6 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 md:block">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4a574] font-mono text-lg text-[#0a0908]">
            ↗
          </span>
        </span>

        {/* Mobile arrow indicator — zawsze widoczna w lewym dolnym rogu */}
        <span className="absolute right-4 top-4 md:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 font-mono text-xs text-white/85 backdrop-blur">
            ↗
          </span>
        </span>
      </div>
    </a>
  )
}
