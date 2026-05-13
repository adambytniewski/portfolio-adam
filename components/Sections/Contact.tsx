'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../../lib/content'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Contact = "End of Issue" editorial imprint.
 *
 * Refined to feel like the last page of an archival magazine:
 * - registration marks in the four corners (printer's bleed cues)
 * - Roman-numeral section dividers (§ I / § II / § III / § IV)
 * - editorial date stamp (DD · MM · MMXXVI) + folio number
 * - giant headline with italic accent
 * - direct line: full-width SVG email with click-to-copy + animated underline
 * - 4-col metadata grid: Editor / Status / Channels / Issue
 * - 2-col credits: Crafted with / Worked with the AI (italic editorial quotes)
 * - giant SVG wordmark with slide-up reveal + micro float
 * - End of issue footer with back-to-top link
 */
export default function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Editorial date — "9 · V · MMXXVI" + live time + folio number
  const today = new Date()
  const ROMAN_MONTHS = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
  ]
  const day = String(today.getDate()).padStart(2, '0')
  const monthRoman = ROMAN_MONTHS[today.getMonth()]
  const yearRoman = 'MMXXVI'
  const issueTime = `${String(today.getHours()).padStart(2, '0')}:${String(
    today.getMinutes(),
  ).padStart(2, '0')}`
  const issueNo = String(
    Math.max(
      1,
      Math.floor((+today - +new Date(today.getFullYear(), 0, 1)) / 86400000),
    ),
  ).padStart(4, '0')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-line', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      })

      gsap.from('.contact-meta', {
        opacity: 0,
        y: 16,
        stagger: 0.05,
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      })

      gsap.from('.imprint-row', {
        opacity: 0,
        y: 24,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.imprint-grid', start: 'top 85%' },
      })

      // Wordmark slide-up reveal on scroll into view
      gsap.from('.wordmark-svg', {
        yPercent: 25,
        opacity: 0,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.wordmark', start: 'top 90%' },
      })

      // Wordmark continuous micro-float — subtle breathing motion
      gsap.to('.wordmark-svg', {
        y: -6,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Pulsing status dot
      gsap.to('.status-dot', {
        opacity: 0.35,
        scale: 0.85,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'center',
      })

      // Subtle reveal on the issue stamp
      gsap.from('.issue-stamp > span', {
        opacity: 0,
        y: -6,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      })

      // Section rules animate from left to right
      gsap.from('.section-rule-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 75%',
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const onCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const handleAt = profile.handle?.startsWith('@')
    ? profile.handle
    : `@${profile.handle ?? 'adam.b'}`

  return (
    <section
      ref={ref}
      id="contact"
      className="relative bg-[#0a0908] pt-28 md:pt-40 overflow-hidden text-[#f5f1ea]"
    >
      {/* Registration marks — printer's bleed cues in the four corners */}
      <RegMark className="left-5 top-5 md:left-8 md:top-8" />
      <RegMark className="right-5 top-5 md:right-8 md:top-8" />
      <RegMark className="left-5 bottom-5 md:left-8 md:bottom-8" />
      <RegMark className="right-5 bottom-5 md:right-8 md:bottom-8" />

      <div className="w-full px-6 md:px-12 lg:px-16">
        {/* === Top issue marker === */}
        <div className="contact-meta flex flex-wrap items-start justify-between gap-y-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">
          <div className="space-y-1">
            <div>Contact · Imprint</div>
            <div>Credits · End matter</div>
          </div>
          <div className="issue-stamp text-right tabular-nums leading-relaxed">
            <span className="block text-white/65">
              {day} · {monthRoman} · {yearRoman}
            </span>
            <span className="block text-white/40">
              Folio № {issueNo} · {issueTime}
            </span>
          </div>
        </div>

        <SectionRule numeral="I" label="Action" />

        {/* === Headline === */}
        <h2 className="font-display text-[clamp(3rem,13vw,13rem)] font-light leading-[0.92] tracking-tight text-white">
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="contact-line inline-block">Działajmy</span>
          </span>
          <span className="block overflow-hidden italic text-[#d4a574] pb-[0.18em]">
            <span className="contact-line inline-block">razem.</span>
          </span>
        </h2>

        <SectionRule numeral="II" label="Direct line" />

        {/* === Email block === */}
        <div className="-mt-2">
          <p className="contact-meta font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">
            // To begin
          </p>

          {/* Email — natural HTML proportions (no SVG stretching).
              Single line via whitespace-nowrap, fluid size via clamp(). */}
          <button
            type="button"
            onClick={onCopyEmail}
            data-magnetic
            aria-label={`Skopiuj email ${profile.email}`}
            className="contact-meta group relative mt-5 inline-block max-w-full text-left transition-colors focus:outline-none"
          >
            <span
              className="block whitespace-nowrap font-grotesk font-normal lowercase tracking-[-0.022em] text-white transition-colors duration-500 group-hover:text-[#d4a574]"
              style={{ fontSize: 'clamp(1.15rem, 4.4vw, 3.6rem)' }}
            >
              {profile.email}
            </span>

            {/* Hover underline — slides in left-to-right */}
            <span
              className="pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-[#d4a574] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              aria-hidden
            />
          </button>

          <p className="contact-meta mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
            <span
              className={`transition-colors ${copied ? 'text-[#d4a574]' : ''}`}
            >
              {copied ? '✓ Skopiowano do schowka' : '↳ Kliknij aby skopiować'}
            </span>
            <span className="text-white/20">·</span>
            <a
              href={`mailto:${profile.email}`}
              data-magnetic
              className="group relative inline-flex items-center gap-1 text-white/55 transition-colors hover:text-[#d4a574]"
            >
              lub napisz bezpośrednio
              <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          </p>
        </div>

        <SectionRule numeral="III" label="Particulars" />

        {/* === Editorial metadata grid (4 col) === */}
        <div className="imprint-grid grid gap-y-12 gap-x-8 md:grid-cols-4 md:gap-x-10 lg:gap-x-14">
          <ImprintBlock label="Editor">
            <p className="font-grotesk text-xl font-medium uppercase tracking-tight text-white md:text-[26px] md:leading-[1.05]">
              {profile.name}
            </p>
            <p className="mt-2 font-mono text-[12px] text-white/55">
              {handleAt}
            </p>
            <p className="mt-1 font-mono text-[12px] text-white/45">
              {profile.location} · CET +01
            </p>
          </ImprintBlock>

          <ImprintBlock label="Status">
            <p className="flex items-center gap-2.5 font-grotesk text-xl font-medium uppercase tracking-tight text-white md:text-[26px] md:leading-[1.05]">
              <span
                className={`status-dot inline-block h-2 w-2 rounded-full ${
                  profile.available ? 'bg-[#d4a574]' : 'bg-white/30'
                }`}
              />
              {profile.available ? 'Open' : 'Booked'}
            </p>
            <p className="mt-3 font-mono text-[12px] italic leading-relaxed text-white/55">
              for commissions in cinematic web,
              <br />
              n8n, MCP &amp; AI media
            </p>
          </ImprintBlock>

          <ImprintBlock label="Channels">
            <ul className="space-y-2">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-magnetic
                    className="group relative inline-flex items-baseline gap-2 font-grotesk text-xl font-medium uppercase tracking-tight text-white transition-colors hover:text-[#d4a574] md:text-[26px] md:leading-[1.05]"
                  >
                    <span className="relative">
                      {s.label}
                      <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#d4a574] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                    </span>
                    <span className="font-mono text-xs text-[#d4a574] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </ImprintBlock>

          <ImprintBlock label="Issue">
            <p className="font-grotesk text-xl font-medium uppercase tracking-tight text-white md:text-[26px] md:leading-[1.05]">
              Vol. 01 · MMXXVI
            </p>
            <p className="mt-2 font-mono text-[12px] text-white/55">
              Personal archive
            </p>
            <p className="mt-1 font-mono text-[12px] italic text-white/45">
              updated continuously
            </p>
          </ImprintBlock>
        </div>

        <SectionRule numeral="IV" label="Colophon" />

        {/* === Credits — Crafted with / Worked with the AI === */}
        <div className="imprint-grid grid gap-y-12 gap-x-8 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
          <ImprintBlock label="Crafted with">
            <p className="font-grotesk text-base leading-[1.55] tracking-tight text-white/85 md:text-[17px]">
              Next.js&nbsp;15 · React&nbsp;19 · TypeScript · Tailwind ·
              GSAP&nbsp;+&nbsp;ScrollTrigger · Lenis · Three.js · Custom GLSL ·
              Fraunces · JetBrains&nbsp;Mono · Space&nbsp;Grotesk.
            </p>
            <p className="mt-4 max-w-xs font-display text-[15px] italic leading-snug text-white/45">
              <span className="text-[#d4a574]">“</span>No tracking, no cookies,
              no analytics theatre.<span className="text-[#d4a574]">”</span>
            </p>
          </ImprintBlock>

          <ImprintBlock label="Worked with the AI">
            <p className="font-grotesk text-base leading-[1.55] tracking-tight text-white/85 md:text-[17px]">
              Claude&nbsp;Code · MCP&nbsp;servers · Ollama&nbsp;(qwen3:8b,
              local) · Higgsfield · Suno · CapCut · Photoshop · n8n.
            </p>
            <p className="mt-4 max-w-xs font-display text-[15px] italic leading-snug text-white/45">
              <span className="text-[#d4a574]">“</span>Model pisze obok mnie —
              nigdy zamiast mnie.<span className="text-[#d4a574]">”</span>
            </p>
          </ImprintBlock>
        </div>

        {/* Spacer before wordmark */}
        <div className="mt-24 h-px w-full bg-white/10 md:mt-32" />

        {/* === ADAM B. wordmark — natural HTML proportions, no stretching === */}
        <div className="wordmark mt-12 md:mt-16">
          <h3
            className="wordmark-svg font-grotesk font-medium uppercase leading-[0.9] tracking-[-0.05em] text-[#f5f1ea]"
            style={{ fontSize: 'clamp(3.5rem, 14vw, 13rem)' }}
          >
            <span className="whitespace-nowrap">
              ADAM B<span className="text-[#d4a574]">.</span>
            </span>
          </h3>
        </div>

        {/* === End of issue footer === */}
        <footer className="mt-12 border-t border-white/10 pt-8 pb-10">
          <div className="grid items-center gap-y-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35 md:grid-cols-3">
            <span>
              © {today.getFullYear()} {profile.name} · Made in Polska
            </span>
            <span className="text-center text-[#d4a574]">
              — End of issue —
            </span>
            <span className="flex items-center justify-end gap-3 md:justify-end">
              <span className="hidden lg:inline text-white/30">
                Set in Space&nbsp;Grotesk · Fraunces · JetBrains&nbsp;Mono
              </span>
              <a
                href="#top"
                data-magnetic
                aria-label="Powrót na górę"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-white/55 transition-colors hover:border-[#d4a574] hover:text-[#d4a574]"
              >
                <span>Top</span>
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5">
                  ↑
                </span>
              </a>
            </span>
          </div>
        </footer>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────── */
/* Helpers                                             */
/* ────────────────────────────────────────────────── */

function SectionRule({
  numeral,
  label,
}: {
  numeral: string
  label: string
}) {
  return (
    <div className="contact-meta my-12 flex items-center gap-4 md:my-16">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574]">
        § {numeral}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/35">
        {label}
      </span>
      <span className="section-rule-line h-px flex-1 origin-left bg-white/10" />
    </div>
  )
}

function ImprintBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="imprint-row">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">
        <span className="inline-block h-px w-4 bg-[#d4a574]/60" />
        {label}
      </p>
      {children}
    </div>
  )
}

function RegMark({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-10 h-3 w-3 ${className}`}
    >
      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-white/20" />
      <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-white/20" />
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
    </div>
  )
}
