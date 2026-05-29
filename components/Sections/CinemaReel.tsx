'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * CINEMA REEL — pinned scroll-bound video sequence.
 *
 * Composition:
 *  - Cinema reel z 73 sklejonych klipów (frame-continuity) jako jeden 90s mp4
 *  - Pinned section h-[300vh] — user scrolluje, video się przewija synchronicznie
 *  - <video> element bez audio, preloaded, muted, playsInline
 *  - Każdy keyframe co 1s (24 frames @ 24fps) → smooth seek bez stutter
 *  - Mobile: 480p (5MB) zamiast 720p (12MB) — przez <source media>
 *  - Mobile fallback: prosty autoplay loop (bez scroll-bind, prefersbatch)
 *  - Overlay text wsuwa się z dwóch stron w trakcie reel
 *
 * Plik mp4:
 *  - /videos/redmind-reel.mp4 — 720p, 12MB, 90s, 24fps, keyframe co 1s
 *  - /videos/redmind-reel-480.mp4 — 480p, 5MB (mobile)
 *  - /videos/redmind-poster.jpg — pierwsza klatka (poster przed load)
 */

export default function CinemaReel() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const overlayLeftRef = useRef<HTMLDivElement>(null)
  const overlayRightRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(90)
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onMeta = () => {
      setDuration(video.duration)
      setReady(true)
    }
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()

    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [])

  useEffect(() => {
    if (!ready || isMobile) return // mobile używa native loop, nie scroll-bind

    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    // Scroll-bind: scroll progress → video.currentTime
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.5}`,
        pin: pinRef.current,
        scrub: 0.5,
        onUpdate: (self) => {
          const t = self.progress * duration
          // Avoid seeking too aggressively — only update if delta > 0.1s
          if (Math.abs(video.currentTime - t) > 0.05) {
            video.currentTime = t
          }
        },
      })

      // Overlay text wsuwane w trakcie reel
      gsap.fromTo(
        overlayLeftRef.current,
        { x: '-100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top top+=10%',
            end: 'top top-=20%',
            scrub: 0.6,
          },
        },
      )
      gsap.fromTo(
        overlayRightRef.current,
        { x: '100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top top-=50%',
            end: 'top top-=100%',
            scrub: 0.6,
          },
        },
      )

      return () => {
        st.kill()
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [ready, isMobile, duration])

  // Mobile: native autoplay loop
  useEffect(() => {
    if (!isMobile || !ready) return
    const video = videoRef.current
    if (!video) return
    video.loop = true
    video.muted = true
    video.play().catch(() => {})
  }, [isMobile, ready])

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0a0908]"
      style={{ height: isMobile ? '100svh' : '350vh' }}
      aria-label="Reel cinematic"
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
      >
        {/* Video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          preload="auto"
          poster="/videos/redmind-poster.jpg"
        >
          <source
            src="/videos/redmind-reel.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          <source
            src="/videos/redmind-reel-480.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark bottom gradient for legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0.15) 25%, rgba(10,9,8,0.15) 70%, rgba(10,9,8,0.9) 100%)',
          }}
        />

        {/* Top eyebrow */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-baseline justify-between px-5 pt-24 md:px-12 md:pt-32 lg:px-16">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/70 md:text-[11px] md:tracking-[0.32em]">
            ⦿ Reel · {Math.round(duration)}s
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.32em] text-[#d4a574] md:inline">
            73 ujęcia · jeden ciąg
          </span>
        </div>

        {/* Overlay text — wsuwany */}
        <div
          ref={overlayLeftRef}
          className="absolute bottom-1/3 left-0 z-10 px-5 md:bottom-1/2 md:left-12 md:max-w-md lg:left-16"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574] md:text-[11px] md:tracking-[0.32em]">
            — Co my umiemy
          </p>
          <h3 className="mt-3 font-display text-[clamp(2rem,7vw,4.5rem)] font-light leading-[1.0] tracking-tight text-white">
            Jedna scena.{' '}
            <span className="italic text-[#d4a574]">Bez cięcia</span>.
          </h3>
        </div>

        <div
          ref={overlayRightRef}
          className="absolute bottom-12 right-0 z-10 max-w-sm px-5 text-right md:bottom-24 md:right-12 md:max-w-md lg:right-16"
        >
          <p className="font-mono text-[12px] leading-relaxed text-white/80 md:text-[13px]">
            Każde ujęcie morfuje się płynnie w następne. Ten sam pipeline którego
            używamy do Twojej strony — frame perfect continuity, cinematic
            grading, zero kompromisów.
          </p>
          <a
            href="#brief"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d4a574] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0a0908] transition-all hover:bg-white"
          >
            Chcę taką stronę
            <span>→</span>
          </a>
        </div>

        {/* Scroll progress bar — only desktop, shows reel position */}
        {!isMobile && (
          <div className="absolute bottom-8 left-1/2 z-10 h-px w-32 -translate-x-1/2 bg-white/15">
            <div
              className="cinema-progress h-full w-0 bg-[#d4a574]"
              style={{ transformOrigin: 'left center' }}
            />
          </div>
        )}

        {/* Loading state */}
        {!ready && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0908]">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
              Ładuję reel...
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
