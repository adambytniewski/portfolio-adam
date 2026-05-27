'use client'

import { profile } from '../../lib/content'

/**
 * FOOTER — minimal final mark.
 *
 * - Wordmark "Redmind."
 * - Kontakt: email + social
 * - Copyright + Made in Polska
 * - Tech credits subtle
 * - Top button
 */

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0908] pb-10 pt-16 md:pt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        {/* Big wordmark "Redmind." */}
        <h3
          className="font-grotesk font-medium uppercase leading-[0.85] tracking-[-0.05em] text-[#f5f1ea]"
          style={{ fontSize: 'clamp(3rem, 16vw, 14rem)' }}
        >
          <span className="whitespace-nowrap">
            Redmind<span className="text-[#d4a574]">.</span>
          </span>
        </h3>

        {/* Subtitle */}
        <p className="mt-4 max-w-xl font-mono text-[12px] uppercase tracking-[0.22em] text-white/45 md:text-[13px]">
          Cinematic strony Next.js dla polskich firm. Premium. Mierzalne. Twoje.
        </p>

        {/* Divider */}
        <div className="mt-12 h-px w-full bg-white/10 md:mt-16" />

        {/* 3-col footer */}
        <div className="mt-10 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-y-0">
          {/* Contact */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
              Kontakt
            </p>
            <a
              href="mailto:redmind.mailbox@gmail.com"
              className="mt-3 inline-block font-grotesk text-base font-medium text-white transition-colors hover:text-[#d4a574] md:text-lg"
            >
              redmind.mailbox@gmail.com
            </a>
            <p className="mt-1 font-mono text-[12px] text-white/55">
              Polska · CET +01
            </p>
          </div>

          {/* Social */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
              Social
            </p>
            <ul className="mt-3 space-y-2">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-grotesk text-base font-medium text-white transition-colors hover:text-[#d4a574] md:text-lg"
                  >
                    {s.label}
                    <span className="text-xs text-[#d4a574] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
              Zaczynamy?
            </p>
            <a
              href="#brief"
              data-magnetic
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#d4a574] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0a0908] transition-all hover:bg-white"
            >
              Wyceń stronę
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 flex flex-col gap-3 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 md:mt-20 md:flex-row md:items-center md:justify-between md:text-[11px]">
          <span>
            © {year} Redmind · Made in Polska by{' '}
            <span className="text-white/55">Adam Bytniewski</span>
          </span>
          <span className="hidden text-white/30 md:inline">
            Set in Fraunces · Space Grotesk · JetBrains Mono
          </span>
          <a
            href="#top"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-white/55 transition-colors hover:border-[#d4a574] hover:text-[#d4a574]"
          >
            <span>Top</span>
            <span className="inline-block transition-transform group-hover:-translate-y-0.5">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
