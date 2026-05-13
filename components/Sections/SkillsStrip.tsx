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
    <section className="relative bg-[#0a0908] py-20 overflow-hidden border-y border-white/5">
      <div className="mb-10 flex items-baseline justify-between px-6 md:px-10 lg:px-14 font-mono text-[11px] uppercase tracking-[0.32em] text-white/40">
        <span>N° 003 — Stack</span>
        <span className="hidden md:inline">— tools I use daily</span>
      </div>

      <Marquee items={row1} duration={50} />
      <div className="h-3" />
      <Marquee items={row2} duration={70} reverse />

      <div className="mt-14 grid gap-y-6 px-6 md:px-10 lg:px-14 md:grid-cols-5">
        {skills.map((group) => (
          <div key={group.name}>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574]">
              {group.name}
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-white/55">
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
}: {
  items: string[]
  duration: number
  reverse?: boolean
}) {
  const content = (
    <div className="flex items-center gap-12 px-6 whitespace-nowrap">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-12">
          <span className="font-display text-[clamp(2.5rem,5vw,5rem)] font-light italic text-white/85">
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
        className="flex w-max"
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
