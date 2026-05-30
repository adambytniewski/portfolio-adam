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

    // WAŻNE: Lenis WYŁĄCZONY GLOBALNIE, bo konfliktuje ze ScrollSnapController
    // (snap między sekcjami + video scrub). GSAP ScrollTrigger snap robi swój
    // smooth tween — Lenis lerp dodawałby drugi opóźnienie i jankuje.
    //
    // Native browser scroll + CSS scroll-behavior:smooth + GSAP snap = clean.
    return undefined
  }, [])

  return <>{children}</>
}
