'use client'

import { skills } from '../../lib/content'

/**
 * Infinite marquee of skills/tools. Pure CSS animation — runs even in reduced motion
 * (we slow it dramatically) but is otherwise GPU-cheap and never stutters.
 */
export default function SkillsStrip() {
  const allItems = skills.flatMap((g) => g.items)
  const row1 = allItems
  const row2 = [...allItems].reverse()

  return (
    <section className="relative bg-[#0a0908] py-16 md:py-20 overflow-hidden border-y border-white/5">
      <div className="mb-8 flex items-baseline justify-between px-5 md:mb-10 md:px-10 lg:px-14 font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:text-[11px] md:tracking-[0.32em]">
        <span>N° 003 — Stack</span>
        <span className="hidden md:inline">— tools I use daily</span>
      </div>

      <Marquee items={row1} duration={50} speedClass="marquee-track-fast" />
      <div className="h-3" />
      <Marquee items={row2} duration={70} reverse speedClass="marquee-track-slow" />

      <div className="mt-12 grid gap-y-6 px-5 md:mt-14 md:px-10 lg:px-14 md:grid-cols-5 md:gap-x-6">
        {skills.map((group) => (
          <div key={group.name}>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574]">
              {group.name}
            </p>
            <p className="mt-2 font-mono text-[13px] leading-relaxed text-white/55 md:text-xs">
              {group.items.join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Marquee({
  items,
  duration,
  reverse = false,
  speedClass = '',
}: {
  items: string[]
  duration: number
  reverse?: boolean
  speedClass?: string
}) {
  const content = (
    <div className="flex items-center gap-8 px-4 whitespace-nowrap md:gap-12 md:px-6">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-8 md:gap-12">
          {/* min 2rem żeby czytelne na małych telefonach (32px) — clamp do 5rem */}
          <span className="font-display text-[clamp(2rem,6vw,5rem)] font-light italic text-white/85">
            {it}
          </span>
          <span className="text-[#d4a574]">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="relative w-full overflow-hidden" aria-hidden>
      <div
        className={`flex w-max ${speedClass}`}
        style={{
          animation: `marquee ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
        }}
      >
        {content}
        {content}
      </div>
    </div>
  )
}
