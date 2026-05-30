'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * FULL PAGE VIDEO BACKGROUND — scroll-bound playback.
 *
 * Video jest TŁEM CAŁEJ STRONY i jednocześnie GŁÓWNĄ ANIMACJĄ.
 * Sterowany ScrollSnapController (oddzielny komponent) który ustawia
 * video.currentTime = scrollProgress * duration.
 *
 *  - position: fixed, z-index: 0 (za content)
 *  - NO autoplay (sterowany scrollem)
 *  - muted, playsInline (iOS friendly)
 *  - 120fps source dla max scroll smoothness
 *  - object-cover pokrywa każdy viewport
 *  - Dark overlay (65%) + vignette + grain dla content readability
 *  - prefers-reduced-motion: tylko poster, no video
 *  - Mobile: 720p 60fps fallback (mniej procka)
 */

export default function FullPageVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // prefers-reduced-motion → tylko poster
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnabled(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const v = videoRef.current
    if (!v) return

    // Expose globally for ScrollSnapController
    ;(window as any).__redmindBgVideo = v

    const onCanPlay = () => {
      setLoaded(true)
      // First frame visible — pause immediately (scroll bind takes over)
      v.pause()
    }
    v.addEventListener('canplay', onCanPlay)

    return () => {
      v.removeEventListener('canplay', onCanPlay)
      delete (window as any).__redmindBgVideo
    }
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

      {enabled && (
        <video
          ref={videoRef}
          data-redmind-bg="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}
          muted
          playsInline
          preload="auto"
          poster="/videos/redmind-bg-poster.jpg"
        >
          {/* Desktop: 60fps 1080p (44MB) — temp, do zamiany na 120fps po encodzie */}
          <source
            src="/videos/redmind-bg-60fps.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          {/* Mobile: 60fps 720p (9.7MB) */}
          <source
            src="/videos/redmind-bg-60fps-mobile.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* Multi-layer dark overlay for content readability */}
      <div className="absolute inset-0 bg-[#0a0908]/65" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(10,9,8,0.4) 100%)',
        }}
      />
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
