'use client'

import { useEffect, useState } from 'react'

const links = [
  { href: '#work', label: 'Selected' },
  { href: '#featured', label: 'Featured' },
  { href: '#now', label: 'Now' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] transition-[backdrop-filter,background-color,border-color] duration-500 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#0a0908]/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
        <a
          href="#top"
          className="font-mono text-xs uppercase tracking-[0.25em] text-white"
        >
          {name.split(' ')[0]}
          <span className="text-accent">.</span>
        </a>

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

        <a
          href="#contact"
          className="group relative overflow-hidden rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/80 transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          <span className="inline-flex items-center gap-2">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Dostępny
          </span>
        </a>
      </div>
    </header>
  )
}
