'use client'

import { useEffect, useRef } from 'react'

/**
 * Top-of-page scroll progress bar. Subtle, single-pixel, accent color.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const h =
        document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? window.scrollY / h : 0
      el.style.transform = `scaleX(${p})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px bg-white/5">
      <div
        ref={ref}
        className="h-full origin-left scale-x-0 bg-[#d4a574]"
      />
    </div>
  )
}
