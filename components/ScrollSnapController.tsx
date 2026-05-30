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
 * 1. Snap między sekcjami (user scrolluje → przeskakuje do najbliższej)
 * 2. Video scrub — currentTime sterowany przez scroll progress
 * 3. RAF loop dla 120Hz/120fps smoothness na ProMotion displays
 *
 * Sekcje wymagają id atrybutów (top, truth, why, mockup, process,
 * subscription, faq, brief). ScrollSnapController czyta ich offsetTop
 * i konwertuje na snap points (0..1 progress range).
 *
 * Mobile: snap zachowany, video scrub też ale z większą tolerancją seek
 * (mniej Force seek na touch scroll bo to laggy).
 */

const SECTION_IDS = [
  'top',
  'truth',
  'why',
  'mockup',
  'process',
  'subscription',
  'faq',
  'brief',
]

export default function ScrollSnapController() {
  useEffect(() => {
    // Czekaj aż wszystkie sekcje się załadują + ich heights ustabilizują
    const setup = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reducedMotion) return // szanujemy a11y — żadnego snapowania

      const sections = SECTION_IDS.map((id) =>
        document.getElementById(id),
      ).filter(Boolean) as HTMLElement[]

      if (sections.length === 0) return

      // Snap points = offsetTop sekcji / maxScroll (0..1)
      const refreshSnapPoints = () => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight
        if (maxScroll <= 0) return []
        return sections
          .map((s) => s.offsetTop / maxScroll)
          .map((p) => Math.max(0, Math.min(1, p)))
      }

      // === 1. SNAP between sections ===
      const snapPoints = refreshSnapPoints()
      const snapTrigger = ScrollTrigger.create({
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.3, max: 0.7 },
          delay: 0.08,
          ease: 'power2.inOut',
          inertia: false,
        },
      })

      // === 2. Video scrub via RAF loop (120Hz smooth) ===
      const video = (window as any).__redmindBgVideo as
        | HTMLVideoElement
        | undefined

      let raf = 0
      let stopVideoLoop = false

      const scrubVideo = () => {
        if (stopVideoLoop) return
        if (video && video.duration > 0) {
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight
          const progress = Math.max(
            0,
            Math.min(1, window.scrollY / maxScroll),
          )
          const targetTime = progress * video.duration
          // Mniejsza tolerancja na desktop dla precyzji, większa mobile
          const tolerance = isMobile ? 0.05 : 0.015
          if (Math.abs(video.currentTime - targetTime) > tolerance) {
            try {
              video.currentTime = targetTime
            } catch (e) {
              // seek może rzucić jeśli video nie ready
            }
          }
        }
        raf = requestAnimationFrame(scrubVideo)
      }

      // Wait for video to be ready before starting scrub
      const startScrub = () => {
        if (video && video.readyState >= 1) {
          scrubVideo()
        } else if (video) {
          video.addEventListener(
            'loadedmetadata',
            () => {
              if (!stopVideoLoop) scrubVideo()
            },
            { once: true },
          )
        }
      }
      startScrub()

      // Resize handler — recompute snap points
      const onResize = () => {
        const newPoints = refreshSnapPoints()
        // Update snap config
        if (snapTrigger.vars.snap && typeof snapTrigger.vars.snap === 'object') {
          ;(snapTrigger.vars.snap as any).snapTo = newPoints
        }
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', onResize)

      // Cleanup
      return () => {
        stopVideoLoop = true
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        snapTrigger.kill()
      }
    }

    // Setup po dłuższym timeout, żeby sekcje (Image, fonts) były gotowe
    const timer = setTimeout(setup, 800)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return null
}
