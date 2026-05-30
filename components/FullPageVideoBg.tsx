'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * FULL PAGE VIDEO BACKGROUND
 *
 * Cinematic video reel jako stałe tło CAŁEJ strony.
 *  - position: fixed, z-index: 0 (za content)
 *  - autoplay, loop, muted, playsInline (iOS friendly)
 *  - object-cover żeby pokryć każdy viewport (mobile vertical, desktop wide)
 *  - Dark gradient overlay dla readability content
 *  - prefers-reduced-motion: poster zamiast video (no animation)
 *  - Mobile: 480p source, desktop: 720p source
 *
 * Sekcje strony siedzą NAD tym tłem z transparent/semi-transparent bg.
 * Każda sekcja ma własny backdrop overlay (np. bg-[#0a0908]/60) dla readability.
 *
 * 60fps motion-interpolated dla absolutnej płynności.
 */

export default function FullPageVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Respect prefers-reduced-motion — only poster, no video
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) setEnabled(false)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const v = videoRef.current
    if (!v) return

    const onCanPlay = () => {
      setLoaded(true)
      v.play().catch(() => {
        // Autoplay blocked — show poster fallback
        setEnabled(false)
      })
    }
    v.addEventListener('canplay', onCanPlay)
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [enabled])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden"
    >
      {/* Poster image — always visible as fallback before video loads */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/videos/redmind-bg-poster.jpg)',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      />

      {/* Video — fades in once ready */}
      {enabled && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          poster="/videos/redmind-bg-poster.jpg"
        >
          <source
            src="/videos/redmind-bg-60fps.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          <source
            src="/videos/redmind-bg-60fps-mobile.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* === Multi-layer dark overlay for content readability === */}
      {/* Solid base — keeps text-content nad-video legible */}
      <div className="absolute inset-0 bg-[#0a0908]/72" />
      {/* Subtle vignette — focuses attention center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(10,9,8,0.4) 100%)',
        }}
      />
      {/* Slight grain texture overlay (via CSS gradient) */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)',
        }}
      />
    </div>
  )
}
