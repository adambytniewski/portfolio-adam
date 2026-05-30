'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * SCROLL SNAP CONTROLLER
 *
 * 1. Frame sequence scrub — woła window.__redmindSetFrame(progress) w RAF loop.
 *    Frame sequence (canvas) NIE zacina jak video.currentTime.
 * 2. Snap między sekcjami (GSAP ScrollTrigger.snap).
 * 3. "Video foreground" podczas ruchu — gdy user scrolluje (snap w toku),
 *    html dostaje .is-snapping → CSS rozjaśnia overlay (video na pierwszym
 *    planie) + przyciemnia content. Gdy scroll się zatrzyma → content wraca,
 *    overlay przyciemnia. Efekt: "podczas snap dzieje się video, potem
 *    pojawia się sekcja".
 * 4. Scroll-to-end — ostatni snap point to FinalCta (#cta); Footer pod nim
 *    naturalnie dostępny.
 */

const SECTION_IDS = ['top', 'why', 'process', 'scope', 'faq', 'brief', 'cta']

/**
 * PAUSE FRAMES — composed "rest" klatki dla każdej sekcji (z 906-frame sequence).
 * Zweryfikowane wizualnie jako settled kompozycje (nie mid-morph blur):
 *  - 30  → medytacja, słup światła (Hero)
 *  - 120 → profil biała koszula (Why Us)
 *  - 300 → 3 panele ze szkicami (Process)
 *  - 480 → złoty łuk + "W" pin (Scope)
 *  - 660 → galeria 3 obrazów (FAQ)
 *  - 760 → przejście (Brief)
 *  - 850 → close-up twarz, zielone oczy (Final CTA)
 *
 * Między sekcjami frame interpoluje przez klatki pomiędzy = video "gra"
 * podczas snap, "zatrzymuje się" na composed frame gdy sekcja settled.
 */
const PAUSE_FRAMES = [30, 120, 300, 480, 660, 760, 850]

export default function ScrollSnapController() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let raf = 0
    let disposed = false
    let scrollSettleTimer: ReturnType<typeof setTimeout> | null = null
    let snapTrigger: ScrollTrigger | null = null

    const setup = () => {
      if (disposed) return

      const sections = SECTION_IDS.map((id) =>
        document.getElementById(id),
      ).filter(Boolean) as HTMLElement[]

      // === PIECEWISE FRAME SCRUB via RAF ===
      // Każda sekcja ląduje na swojej pause frame; między sekcjami frame
      // interpoluje liniowo przez klatki pomiędzy = "video gra podczas snap,
      // zatrzymuje się na composed frame gdy sekcja settled".
      const scrub = () => {
        if (disposed) return
        const setFrame = (window as any).__redmindSetFrame as
          | ((frameIdx: number) => void)
          | undefined
        if (setFrame && sections.length > 1) {
          const pts = sections.map((s) => s.offsetTop) // px positions
          const y = window.scrollY
          let frame: number

          if (y <= pts[0]) {
            frame = PAUSE_FRAMES[0]
          } else if (y >= pts[pts.length - 1]) {
            frame = PAUSE_FRAMES[Math.min(pts.length - 1, PAUSE_FRAMES.length - 1)]
          } else {
            frame = PAUSE_FRAMES[0]
            for (let i = 0; i < pts.length - 1; i++) {
              if (y >= pts[i] && y < pts[i + 1]) {
                const span = pts[i + 1] - pts[i]
                const localT = span > 0 ? (y - pts[i]) / span : 0
                const fa = PAUSE_FRAMES[Math.min(i, PAUSE_FRAMES.length - 1)]
                const fb =
                  PAUSE_FRAMES[Math.min(i + 1, PAUSE_FRAMES.length - 1)]
                frame = fa + (fb - fa) * localT
                break
              }
            }
          }
          setFrame(frame)
        }
        raf = requestAnimationFrame(scrub)
      }
      raf = requestAnimationFrame(scrub)

      if (reducedMotion) return // bez snap + bez is-snapping (a11y)

      // === SNAP between sections ===
      if (sections.length > 1) {
        const refreshPoints = () => {
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight
          if (maxScroll <= 0) return [0]
          const pts = sections.map((s) =>
            Math.max(0, Math.min(1, s.offsetTop / maxScroll)),
          )
          // Zawsze dodaj 1.0 (sam dół — Footer) jako ostatni snap, dedupe
          if (pts[pts.length - 1] < 0.98) pts.push(1)
          return Array.from(new Set(pts)).sort((a, b) => a - b)
        }

        snapTrigger = ScrollTrigger.create({
          snap: {
            snapTo: refreshPoints(),
            duration: { min: 0.25, max: 0.6 },
            delay: 0.06,
            ease: 'power2.inOut',
            inertia: false,
          },
        })

        const onResize = () => {
          if (snapTrigger?.vars.snap && typeof snapTrigger.vars.snap === 'object') {
            ;(snapTrigger.vars.snap as any).snapTo = refreshPoints()
          }
          ScrollTrigger.refresh()
        }
        window.addEventListener('resize', onResize)
        ;(setup as any)._cleanupResize = () =>
          window.removeEventListener('resize', onResize)
      }

      // === "Video foreground" podczas scrollu ===
      const root = document.documentElement
      const onScroll = () => {
        root.classList.add('is-snapping')
        if (scrollSettleTimer) clearTimeout(scrollSettleTimer)
        scrollSettleTimer = setTimeout(() => {
          root.classList.remove('is-snapping')
        }, 140)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      ;(setup as any)._cleanupScroll = () =>
        window.removeEventListener('scroll', onScroll)
    }

    // Czekaj aż sekcje + frames się załadują
    const timer = setTimeout(setup, 700)

    return () => {
      disposed = true
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      if (scrollSettleTimer) clearTimeout(scrollSettleTimer)
      document.documentElement.classList.remove('is-snapping')
      snapTrigger?.kill()
      ;(setup as any)._cleanupResize?.()
      ;(setup as any)._cleanupScroll?.()
    }
  }, [])

  return null
}
