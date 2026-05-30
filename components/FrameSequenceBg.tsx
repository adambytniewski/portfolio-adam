'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * FRAME SEQUENCE BACKGROUND — Apple-style scroll-driven image sequence.
 *
 * Zamiast video.currentTime scrubbing (które ZACINA bo każdy seek wymaga
 * decode od keyframe), renderujemy sekwencję obrazów JPG na <canvas>.
 * Zero decode lag = absolutnie płynny scroll, nawet 240fps feel.
 *
 * Mechanika:
 *  - 906 klatek (20fps z 45s reel) jako f_0001.jpg ... f_0906.jpg
 *  - Preload manager: concurrency 8, pierwsza klatka priorytet
 *  - Canvas full-screen fixed, object-cover draw
 *  - ScrollSnapController woła window.__redmindSetFrame(progress 0..1)
 *  - drawFrame szuka najbliższej ZAŁADOWANEJ klatki jeśli target nie gotowy
 *  - Mobile: 854px frames (19MB), desktop: 1440px (47MB)
 *
 * Premium scroll-video proven pattern (Apple AirPods, Stripe, Igloo Inc).
 */

const TOTAL_FRAMES = 906
const PAD = 4

export default function FrameSequenceBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const [firstReady, setFirstReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const dir = mobile ? '/frames-mobile' : '/frames'
    const frames: HTMLImageElement[] = new Array(TOTAL_FRAMES)
    framesRef.current = frames
    let loaded = 0
    let disposed = false

    const drawFrame = (frameIdx: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      let idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIdx)))

      // Find nearest loaded frame (backward, then forward)
      let img = frames[idx]
      if (!img || !img.complete || img.naturalWidth === 0) {
        let found: HTMLImageElement | null = null
        for (let j = idx; j >= 0; j--) {
          const f = frames[j]
          if (f && f.complete && f.naturalWidth > 0) {
            found = f
            break
          }
        }
        if (!found) {
          for (let j = idx + 1; j < TOTAL_FRAMES; j++) {
            const f = frames[j]
            if (f && f.complete && f.naturalWidth > 0) {
              found = f
              break
            }
          }
        }
        img = found as HTMLImageElement
      }
      if (!img || !img.complete || img.naturalWidth === 0) return

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }

      // object-cover
      const cw = canvas.width
      const ch = canvas.height
      const imgRatio = img.naturalWidth / img.naturalHeight
      const canvasRatio = cw / ch
      let dw: number, dh: number, dx: number, dy: number
      if (imgRatio > canvasRatio) {
        dh = ch
        dw = dh * imgRatio
        dx = (cw - dw) / 2
        dy = 0
      } else {
        dw = cw
        dh = dw / imgRatio
        dx = 0
        dy = (ch - dh) / 2
      }
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    // Expose globally for ScrollSnapController
    ;(window as any).__redmindSetFrame = (progress: number) => {
      drawFrame(progress * (TOTAL_FRAMES - 1))
    }
    ;(window as any).__redmindFrameCount = TOTAL_FRAMES

    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        if (disposed) return resolve()
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          loaded++
          if (i === 0 && !disposed) {
            setFirstReady(true)
            drawFrame(0)
          }
          if (loaded % 30 === 0) setLoadProgress(loaded / TOTAL_FRAMES)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = `${dir}/f_${String(i + 1).padStart(PAD, '0')}.jpg`
        frames[i] = img
      })

    // Priority load: frame 0 first, then sequential with concurrency 8
    const run = async () => {
      await loadFrame(0)
      const CONCURRENCY = 8
      let idx = 1
      const worker = async () => {
        while (idx < TOTAL_FRAMES && !disposed) {
          const my = idx++
          await loadFrame(my)
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
      setLoadProgress(1)
    }
    run()

    // Redraw on resize
    const onResize = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const p = maxScroll > 0 ? window.scrollY / maxScroll : 0
      drawFrame(p * (TOTAL_FRAMES - 1))
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      window.removeEventListener('resize', onResize)
      delete (window as any).__redmindSetFrame
      delete (window as any).__redmindFrameCount
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden"
    >
      {/* Poster before first frame */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/videos/redmind-bg-poster.jpg)',
          opacity: firstReady ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: firstReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Multi-layer dark overlay — readability. Tłumiony podczas snap
          przez .is-snapping na <html> (patrz globals.css). */}
      <div className="redmind-overlay absolute inset-0 bg-[#0a0908]/65 transition-[background-color] duration-500" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(10,9,8,0.4) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Subtle load indicator (bottom right) — znika po pełnym preload */}
      {loadProgress < 1 && firstReady && (
        <div className="absolute bottom-5 right-5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
          buforowanie {Math.round(loadProgress * 100)}%
        </div>
      )}
    </div>
  )
}
