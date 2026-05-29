'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const links = [
  { href: '#reel', label: 'Reel' },
  { href: '#why', label: 'Możliwości' },
  { href: '#process', label: 'Proces' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when menu open (mobile)
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  // Close menu on hash navigation
  const handleLinkClick = () => setOpen(false)

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-[backdrop-filter,background-color,border-color] duration-500 ${
          scrolled || open
            ? 'border-b border-white/[0.06] bg-[#0a0908]/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-12 md:py-5">
          <a
            href="#top"
            onClick={handleLinkClick}
            aria-label="Redmind — strona główna"
            className="-my-2 inline-flex items-center gap-2.5 py-2 transition-opacity hover:opacity-80 md:my-0 md:py-0"
          >
            <Image
              src="/images/redmind-r-logo.png"
              alt="Redmind"
              width={40}
              height={40}
              priority
              className="h-9 w-9 select-none md:h-10 md:w-10"
            />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.32em] text-white/70 md:inline">
              Redmind
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-9 font-mono text-[11px] uppercase tracking-[0.25em] text-white/55 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative transition-colors duration-300 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right side: CTA (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <a
              href="#brief"
              onClick={handleLinkClick}
              className="group relative hidden overflow-hidden rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#0a0908] transition-colors duration-300 hover:bg-white md:inline-block"
            >
              Wyceń stronę →
            </a>

            {/* Hamburger button — visible only on mobile */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={open}
              className="relative z-[61] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-accent md:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 top-0 block h-px w-full bg-white transition-all duration-300 ${
                    open ? 'translate-y-[6px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute left-0 top-[6px] block h-px w-full bg-white transition-opacity duration-200 ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 top-[12px] block h-px w-full bg-white transition-all duration-300 ${
                    open ? '-translate-y-[6px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu — full-screen */}
      <div
        className={`fixed inset-0 z-[55] flex flex-col bg-[#0a0908] transition-[opacity,transform] duration-500 md:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        aria-hidden={!open}
      >
        {/* Subtle ambient gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(212,165,116,0.12) 0%, rgba(212,165,116,0) 60%)',
          }}
        />

        <div className="flex h-full flex-col justify-between px-6 pb-10 pt-24">
          {/* Links */}
          <nav className="flex flex-col gap-6 font-display text-[12vw] font-light leading-[0.95] text-white">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={handleLinkClick}
                className={`block transition-colors duration-300 hover:text-accent ${
                  i === 1 ? 'italic text-accent' : ''
                }`}
                style={{
                  transform: open ? 'translateY(0)' : 'translateY(20px)',
                  opacity: open ? 1 : 0,
                  transition: `transform 600ms cubic-bezier(0.16,1,0.3,1) ${
                    i * 60 + 100
                  }ms, opacity 400ms ease ${i * 60 + 100}ms`,
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Footer block */}
          <div className="space-y-5 border-t border-white/10 pt-6">
            <a
              href="#brief"
              onClick={handleLinkClick}
              className="inline-flex w-full items-center justify-between rounded-full bg-accent px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#0a0908]"
            >
              <span className="inline-flex items-center gap-2">
                Wyceń swoją stronę
              </span>
              <span>→</span>
            </a>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
              Cinematic web · Automation · AI media
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
