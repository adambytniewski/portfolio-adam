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

      // === FRAME SCRUB via RAF (działa nawet bez snap, np. reduced-motion) ===
      const scrub = () => {
        if (disposed) return
        const setFrame = (window as any).__redmindSetFrame as
          | ((p: number) => void)
          | undefined
        if (setFrame) {
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight
          const progress =
            maxScroll > 0
              ? Math.max(0, Math.min(1, window.scrollY / maxScroll))
              : 0
          setFrame(progress)
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
