'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Cinematic preloader. Counts to 100, then iris-out reveal of the page.
 * The first impression — sets the tone for the whole site.
 */
export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Block scroll while loading
    document.documentElement.style.overflow = 'hidden'

    const counter = counterRef.current
    const line = lineRef.current
    const root = ref.current
    if (!counter || !line || !root) return

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = ''
        setDone(true)
      },
    })

    const obj = { val: 0 }
    tl.to(obj, {
      val: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        counter.textContent = String(Math.round(obj.val)).padStart(3, '0')
      },
    })
      .to(line, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to('.preload-fade', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.05,
      })
      .to(root, {
        yPercent: -100,
        duration: 1,
        ease: 'expo.inOut',
      })

    return () => {
      tl.kill()
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (done) return null

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-[#0a0908] p-6 md:p-10"
    >
      <div className="preload-fade flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.32em] text-white/55">
        <span className="text-white">
          ADAM B<span className="text-[#d4a574]">.</span>
        </span>
        <span>Loading scene</span>
      </div>

      <div className="preload-fade flex items-end justify-between">
        <div className="font-display text-[clamp(5rem,18vw,18rem)] font-thin italic leading-none text-white">
          <span ref={counterRef}>000</span>
          <span className="text-[#d4a574]">/</span>
          <span className="text-white/40">100</span>
        </div>
        <div className="hidden text-right font-mono text-[11px] uppercase tracking-[0.22em] text-white/40 md:block">
          <span className="block">Cinematic</span>
          <span className="block">interfaces</span>
          <span className="block">est. 2026</span>
        </div>
      </div>

      <div className="preload-fade space-y-3">
        <div className="relative h-px w-full bg-white/10">
          <div
            ref={lineRef}
            className="absolute inset-y-0 left-0 h-full w-full origin-left scale-x-0 bg-[#d4a574]"
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-white/45">
          <span>Three · GSAP · Lenis</span>
          <span>Portfolio · 2026</span>
        </div>
      </div>
    </div>
  )
}
