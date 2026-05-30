'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import agency from '../../content/agency.json'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * FAQ — accordion z typowymi pytaniami klienta.
 *
 * Layout:
 *  - 8 pytań w accordion
 *  - Wszystkie zamknięte na start (no spoilers)
 *  - Klik na pytanie → smooth expand (GSAP)
 *  - "+" → "×" rotacja przy otwarciu
 *  - Cinematic feel: border bottom only, accent na hover
 */

export default function Faq() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.faq-head', {
        y: isMobile ? 16 : 24,
        duration: isMobile ? 0.7 : 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 95%' : 'top 80%',
        },
      })
      gsap.from('.faq-item', {
        y: isMobile ? 16 : 24,
        duration: isMobile ? 0.5 : 0.7,
        stagger: 0.05,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.faq-list',
          start: isMobile ? 'top 95%' : 'top 85%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const toggle = (i: number) => setOpenIdx((cur) => (cur === i ? null : i))

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative overflow-hidden bg-transparent py-24 md:py-44"
    >
      <div className="relative mx-auto max-w-4xl px-5 md:px-10 lg:px-14">
        <div className="faq-head mb-6 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:mb-10 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 005 — FAQ</span>
          <span className="hidden text-[#d4a574] md:inline">
            Najczęstsze pytania
          </span>
        </div>

        <h2 className="faq-head font-display text-[clamp(2.4rem,9vw,6rem)] font-light leading-[1.02] tracking-tight text-white">
          Najczęstsze{' '}
          <span className="italic text-[#d4a574]">pytania</span>.
        </h2>

        <p className="faq-head mt-5 max-w-xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-7 md:text-sm">
          Pytasz to samo co inni klienci. Tu wszystko bez owijania w bawełnę.
        </p>

        <ul className="faq-list mt-12 divide-y divide-white/10 border-y border-white/10 md:mt-16">
          {agency.faq.map((item, i) => {
            const isOpen = openIdx === i
            return (
              <FaqItem
                key={i}
                idx={i}
                question={item.q}
                answer={item.a}
                isOpen={isOpen}
                onToggle={() => toggle(i)}
              />
            )
          })}
        </ul>

        {/* Below FAQ — fallback */}
        <p className="faq-head mt-12 text-center font-mono text-[12px] text-white/55 md:mt-16 md:text-[13px]">
          Nie znalazłeś odpowiedzi?{' '}
          <a
            href="#brief"
            className="text-[#d4a574] underline underline-offset-4 transition-colors hover:text-white"
          >
            Napisz w briefie
          </a>{' '}
          albo na{' '}
          <a
            href="mailto:redmind.mailbox@gmail.com"
            className="text-[#d4a574] underline underline-offset-4 transition-colors hover:text-white"
          >
            redmind.mailbox@gmail.com
          </a>
        </p>
      </div>
    </section>
  )
}

function FaqItem({
  idx,
  question,
  answer,
  isOpen,
  onToggle,
}: {
  idx: number
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  const answerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = answerRef.current
    if (!el) return
    if (isOpen) {
      gsap.to(el, {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: 'expo.out',
      })
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: 'expo.inOut',
      })
    }
  }, [isOpen])

  return (
    <li className="faq-item">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:bg-white/[0.02] md:py-8"
      >
        <span className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#d4a574] md:text-[12px]">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <span
            className={`font-display text-lg font-light leading-tight transition-colors md:text-2xl ${
              isOpen ? 'text-white' : 'text-white/85 group-hover:text-white'
            }`}
          >
            {question}
          </span>
        </span>
        <span
          className={`mt-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-[#d4a574] transition-all duration-300 group-hover:border-[#d4a574]/60 md:h-9 md:w-9 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <span className="text-lg leading-none md:text-xl">+</span>
        </span>
      </button>
      <div
        ref={answerRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <p className="pb-7 pl-9 pr-4 font-mono text-[13px] leading-relaxed text-white/65 md:pb-8 md:pl-14 md:text-sm">
          {answer}
        </p>
      </div>
    </li>
  )
}
