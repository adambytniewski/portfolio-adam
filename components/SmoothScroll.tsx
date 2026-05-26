'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * SmoothScroll — Lenis + ScrollTrigger integration.
 *
 * Without this exact pattern, scrub animations stutter and break
 * because Lenis and ScrollTrigger run on different RAFs.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // WAŻNE: Na touch device (telefony, tablety) Lenis często powoduje jank,
    // bo konkuruje z natywnym inertial scroll iOS/Android. Natywny scroll na mobile
    // jest już płynny i hardware-accelerated. Lenis jest stworzony dla desktop
    // mouse wheel.
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isTouch || isMobile || reducedMotion) {
      // Mobile/touch — używamy natywnego scrolla, dajemy ScrollTriggerowi
      // pracować bezpośrednio bez proxy Lenisa.
      return
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
