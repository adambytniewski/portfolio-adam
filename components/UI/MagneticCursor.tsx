'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Custom cursor follower with magnetic attraction to [data-magnetic] elements.
 * Two layers: dot (instant) + ring (eased). Hides on touch devices.
 */
export default function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const xTo = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const rxTo = gsap.quickTo(ring, 'x', { duration: 0.6, ease: 'expo.out' })
    const ryTo = gsap.quickTo(ring, 'y', { duration: 0.6, ease: 'expo.out' })

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      rxTo(e.clientX)
      ryTo(e.clientY)
    }
    window.addEventListener('mousemove', onMove)

    // Hover state: scale ring on magnetic targets
    const targets = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>('[data-magnetic], a, button'),
      )

    const onEnter = () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.9, duration: 0.4, ease: 'expo.out' })
      gsap.to(dot, { scale: 0.6, duration: 0.4, ease: 'expo.out' })
    }
    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 0.5, duration: 0.4, ease: 'expo.out' })
      gsap.to(dot, { scale: 1, duration: 0.4, ease: 'expo.out' })
    }

    const bind = () => {
      targets().forEach((t) => {
        t.addEventListener('mouseenter', onEnter)
        t.addEventListener('mouseleave', onLeave)
      })
    }
    bind()

    // Re-bind when DOM updates (filter changes etc.)
    const mo = new MutationObserver(() => {
      // simple debounce: cancel and rebind after a tick
      window.requestAnimationFrame(bind)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      targets().forEach((t) => {
        t.removeEventListener('mouseenter', onEnter)
        t.removeEventListener('mouseleave', onLeave)
      })
      mo.disconnect()
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4a574]/70 opacity-50 mix-blend-difference md:block"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4a574] mix-blend-difference md:block"
      />
    </>
  )
}
