'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * CINEMA REEL — 65s scroll-bound continuous reel z 9 ujęć (frame-continuity).
 *
 * 9 video × ~7s każde = 65s total. Sklejone tak że end-frame N = start-frame N+1.
 * To samo doświadczenie którego klient dostanie na swojej stronie.
 *
 * Composition:
 *  - h-[450vh] pinned section (4.5 viewport heights)
 *  - <video> + 6 stage'ów contentu które wjeżdżają z różnych stron w korelacji
 *    z aktualnym frame video
 *  - Każdy stage trwa ~10s reel'u, ma swój timing i kierunek wejścia
 *  - Niesymetryczny układ: tekst z lewej dolnej, potem z prawej górnej, potem
 *    floating photo, potem central, potem znowu z boku, finally CTA
 *  - Mobile: native autoplay loop, bez scroll-bind, tylko 1 overlay z CTA
 */

const STAGES = [
  {
    // 0-12s — ekspozycja
    range: [0, 0.18],
    position: 'left-bottom',
    eyebrow: '· UJĘCIE 01',
    title: 'Każde piksel',
    subtitle: 'ręcznie wycyzelowany.',
    body: null,
  },
  {
    // 12-24s — proces
    range: [0.18, 0.36],
    position: 'right-top',
    eyebrow: '· UJĘCIE 02-03',
    title: 'Bez cięcia.',
    subtitle: 'Bez kompromisów.',
    body: 'Każda klatka twojej strony tak samo — frame perfect continuity.',
  },
  {
    // 24-36s — emocja / portrait
    range: [0.36, 0.55],
    position: 'center-floating',
    eyebrow: '· UJĘCIE 04-05',
    title: null,
    subtitle: null,
    body: null,
    showPortrait: true,
  },
  {
    // 36-48s — craft
    range: [0.55, 0.72],
    position: 'left-top-skewed',
    eyebrow: '· UJĘCIE 06-07',
    title: 'Twoja firma —',
    subtitle: 'Twoja architektura.',
    body: 'Nie szablon. Nie page-builder. Tylko własny kod Next.js.',
  },
  {
    // 48-58s — brand mark
    range: [0.72, 0.9],
    position: 'right-bottom-skewed',
    eyebrow: '· UJĘCIE 08',
    title: 'Logo, które',
    subtitle: 'pamiętasz.',
    body: null,
  },
  {
    // 58-65s — CTA
    range: [0.9, 1.0],
    position: 'center-cta',
    eyebrow: '· KONIEC REEL',
    title: 'Chcesz taki',
    subtitle: 'film dla siebie?',
    body: null,
    showCta: true,
  },
]

export default function CinemaReel() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [duration, setDuration] = useState(65)
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeStage, setActiveStage] = useState(0)
  const progressRef = useRef(0)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  // Load video metadata
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onMeta = () => {
      setDuration(v.duration)
      setReady(true)
    }
    v.addEventListener('loadedmetadata', onMeta)
    if (v.readyState >= 1) onMeta()
    return () => v.removeEventListener('loadedmetadata', onMeta)
  }, [])

  // Desktop: scroll-bind playback + stage tracking
  useEffect(() => {
    if (!ready || isMobile) return
    const v = videoRef.current
    const section = sectionRef.current
    if (!v || !section) return

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 3.5}`,
        pin: pinRef.current,
        scrub: 0.4,
        onUpdate: (self) => {
          progressRef.current = self.progress
          const t = self.progress * duration
          if (Math.abs(v.currentTime - t) > 0.04) v.currentTime = t

          // Find active stage by progress
          const idx = STAGES.findIndex(
            (s) => self.progress >= s.range[0] && self.progress <= s.range[1],
          )
          if (idx !== -1) setActiveStage(idx)
        },
      })

      return () => st.kill()
    }, sectionRef)
    return () => ctx.revert()
  }, [ready, isMobile, duration])

  // Mobile: native autoplay loop
  useEffect(() => {
    if (!isMobile || !ready) return
    const v = videoRef.current
    if (!v) return
    v.loop = true
    v.muted = true
    v.play().catch(() => {})
  }, [isMobile, ready])

  return (
    <section
      ref={sectionRef}
      id="reel"
      className="relative w-full bg-[#0a0908]"
      style={{ height: isMobile ? '100svh' : '450vh' }}
      aria-label="Cinematic reel"
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
      >
        {/* === VIDEO === */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          preload="auto"
          poster="/videos/cinema-reel-poster.jpg"
        >
          <source
            src="/videos/cinema-reel.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          <source src="/videos/cinema-reel-480.mp4" type="video/mp4" />
        </video>

        {/* === Cinematic vignette + readability gradient === */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(10,9,8,0.5) 100%), linear-gradient(180deg, rgba(10,9,8,0.4) 0%, transparent 20%, transparent 70%, rgba(10,9,8,0.85) 100%)',
          }}
        />

        {/* === Eyebrow info (always visible top) === */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-baseline justify-between px-5 pt-24 md:px-12 md:pt-32 lg:px-16">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/70 md:text-[11px] md:tracking-[0.32em]">
            ⦿ Reel · {Math.round(duration)}s · 9 ujęć
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.32em] text-[#d4a574] md:inline">
            jeden ciąg · zero cięć
          </span>
        </div>

        {/* === Stage progress dots (desktop only) === */}
        {!isMobile && (
          <div className="absolute right-12 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex lg:right-16">
            {STAGES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                  i === activeStage
                    ? 'scale-150 bg-[#d4a574]'
                    : i < activeStage
                      ? 'bg-white/40'
                      : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        )}

        {/* === STAGE OVERLAYS === */}
        {!isMobile &&
          STAGES.map((stage, i) => (
            <StageOverlay
              key={i}
              stage={stage}
              isActive={i === activeStage}
            />
          ))}

        {/* === MOBILE single overlay === */}
        {isMobile && (
          <div className="absolute bottom-12 left-5 right-5 z-20 max-w-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
              · Reel · 65s · jeden ciąg
            </p>
            <h3 className="mt-3 font-display text-[clamp(2rem,8vw,3.5rem)] font-light leading-[1.0] tracking-tight text-white">
              Bez cięcia.{' '}
              <span className="italic text-[#d4a574]">Bez kompromisów</span>.
            </h3>
            <p className="mt-4 font-mono text-[13px] leading-relaxed text-white/75">
              Każdy element Twojej strony tak samo — frame perfect continuity,
              cinematic grading, zero ograniczeń szablonu.
            </p>
            <a
              href="#brief"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d4a574] px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0a0908]"
            >
              Chcę taką stronę
              <span>→</span>
            </a>
          </div>
        )}

        {/* === Loading state === */}
        {!ready && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0908]">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
              Ładuję reel...
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────
// STAGE OVERLAY — kreatywne pozycjonowanie + niesymetryczne wejścia
// ────────────────────────────────────────────────────────────────────────

function StageOverlay({
  stage,
  isActive,
}: {
  stage: (typeof STAGES)[0]
  isActive: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isActive) {
      // Wejście — direction zależy od position
      const fromMap: Record<string, gsap.TweenVars> = {
        'left-bottom': { x: -120, y: 30, opacity: 0 },
        'right-top': { x: 120, y: -30, opacity: 0 },
        'center-floating': { y: 60, opacity: 0, scale: 1.1 },
        'left-top-skewed': { x: -80, y: -40, opacity: 0, rotate: -2 },
        'right-bottom-skewed': { x: 80, y: 40, opacity: 0, rotate: 2 },
        'center-cta': { y: 40, opacity: 0, scale: 0.95 },
      }
      const from = fromMap[stage.position] || { opacity: 0 }
      gsap.fromTo(el, from, {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.9,
        ease: 'expo.out',
      })
    } else {
      const toMap: Record<string, gsap.TweenVars> = {
        'left-bottom': { x: -60, opacity: 0 },
        'right-top': { x: 60, opacity: 0 },
        'center-floating': { y: -30, opacity: 0 },
        'left-top-skewed': { x: -40, opacity: 0 },
        'right-bottom-skewed': { x: 40, opacity: 0 },
        'center-cta': { y: 20, opacity: 0 },
      }
      const to = toMap[stage.position] || { opacity: 0 }
      gsap.to(el, { ...to, duration: 0.5, ease: 'power2.in' })
    }
  }, [isActive, stage.position])

  // Position classes
  const positionClass: Record<string, string> = {
    'left-bottom': 'left-12 bottom-1/4 max-w-md lg:left-16',
    'right-top': 'right-12 top-1/3 max-w-md text-right lg:right-16',
    'center-floating': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'left-top-skewed':
      'left-8 top-1/4 max-w-md lg:left-12 lg:top-[22%] -rotate-[1deg]',
    'right-bottom-skewed':
      'right-8 bottom-1/3 max-w-md text-right lg:right-12 rotate-[1deg]',
    'center-cta':
      'left-1/2 bottom-24 -translate-x-1/2 text-center max-w-xl',
  }

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute z-20 ${positionClass[stage.position] || ''}`}
      style={{ opacity: 0 }}
      aria-hidden={!isActive}
    >
      {/* Portrait — pojawia się tylko w center-floating stage */}
      {stage.showPortrait && (
        <div className="pointer-events-auto relative">
          <div className="relative h-72 w-56 overflow-hidden rounded-2xl border border-[#d4a574]/30 shadow-[0_30px_80px_-20px_rgba(212,165,116,0.4)] md:h-96 md:w-72">
            <Image
              src="/images/portrait-warm.jpg"
              alt="Adam Bytniewski — Redmind founder"
              fill
              sizes="(max-width: 768px) 224px, 288px"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent"
            />
            <div className="absolute bottom-3 left-3 right-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80">
              · Adam B. · Founder
            </div>
          </div>
        </div>
      )}

      {/* Text stage */}
      {stage.title && (
        <>
          {stage.eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574] md:text-[11px]">
              {stage.eyebrow}
            </p>
          )}
          <h3 className="mt-3 font-display text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1.0] tracking-tight text-white">
            {stage.title}{' '}
            <span className="italic text-[#d4a574]">{stage.subtitle}</span>
          </h3>
          {stage.body && (
            <p className="mt-5 max-w-md font-mono text-[13px] leading-relaxed text-white/75 md:text-sm">
              {stage.body}
            </p>
          )}
          {stage.showCta && (
            <a
              href="#brief"
              className="pointer-events-auto mt-7 inline-flex items-center gap-3 rounded-full bg-[#d4a574] px-7 py-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[#0a0908] transition-all hover:bg-white"
            >
              Wyślij brief
              <span>→</span>
            </a>
          )}
        </>
      )}
    </div>
  )
}
