'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * BRIEF FORM — Act VI: multi-step lead qualifier
 *
 * 4 stepy które kwalifikują leada:
 *  1. Branża — szybka segmentacja
 *  2. Co potrzebujesz — strona / strona+auto / pełen stack
 *  3. Budżet — filtruje low-balla
 *  4. Kontakt — Nazwa, email, telefon, dodatkowe info
 *
 * Submit fallback: jeśli NEXT_PUBLIC_FORMSPREE_ENDPOINT ustawiony, POST tam.
 * Inaczej mailto: do redmind.mailbox@gmail.com z prefilled body.
 *
 * UX: każdy step ma animowane wejście GSAP, progress bar na górze, możliwość
 * powrotu (nigdy lock-in). Submit pokazuje success state z particle-feel.
 */

const INDUSTRIES = [
  { id: 'gastro', label: 'Gastronomia · HoReCa' },
  { id: 'beauty', label: 'Beauty · Salon · Spa' },
  { id: 'health', label: 'Zdrowie · Medycyna' },
  { id: 'realestate', label: 'Nieruchomości' },
  { id: 'services', label: 'Usługi B2B' },
  { id: 'ecom', label: 'E-commerce · Sklep' },
  { id: 'creative', label: 'Kreatywne · Studio · Agencja' },
  { id: 'other', label: 'Inne' },
]

const NEEDS = [
  {
    id: 'web',
    label: 'Premium strona',
    desc: 'Cinematic Next.js, mobile-first, AI features.',
  },
  {
    id: 'web-auto',
    label: 'Strona + Automatyzacje',
    desc: 'Strona + n8n workflowy + CRM integracje.',
  },
  {
    id: 'fullstack',
    label: 'Pełen stack AI',
    desc: 'Strona + automatyzacje + chatbot + content AI pipeline.',
  },
  {
    id: 'unsure',
    label: 'Nie wiem jeszcze',
    desc: 'Pokaż mi co możesz, doradź najlepiej.',
  },
]

const TIMELINES = [
  { id: 'asap', label: 'ASAP', desc: 'Najszybciej jak się da. Tak.' },
  { id: 'month', label: '2–4 tygodnie', desc: 'Mam konkretny deadline.' },
  { id: 'quarter', label: '1–3 miesiące', desc: 'Spokojnie, dobrze zrobić.' },
  { id: 'flexible', label: 'Elastycznie', desc: 'Doradź najlepiej.' },
]

type FormData = {
  industry: string
  industryOther: string
  need: string
  timeline: string
  name: string
  email: string
  phone: string
  notes: string
}

const initialData: FormData = {
  industry: '',
  industryOther: '',
  need: '',
  timeline: '',
  name: '',
  email: '',
  phone: '',
  notes: '',
}

export default function BriefForm() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0) // 0..4 (4 = success)
  const [data, setData] = useState<FormData>(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Entry animation
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      gsap.from('.brief-headline span', {
        yPercent: isMobile ? 50 : 100,
        duration: 1.1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 90%' : 'top 75%',
        },
      })
      gsap.from('.brief-meta', {
        opacity: 0,
        y: 16,
        stagger: 0.05,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isMobile ? 'top 90%' : 'top 75%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Step transition animation
  useEffect(() => {
    if (!stepRef.current) return
    gsap.fromTo(
      stepRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' },
    )
  }, [step])

  const goNext = () => setStep((s) => Math.min(s + 1, 4))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const canProceed = () => {
    if (step === 0) return data.industry && (data.industry !== 'other' || data.industryOther)
    if (step === 1) return !!data.need
    if (step === 2) return !!data.timeline
    if (step === 3) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return data.name.length >= 2 && emailRe.test(data.email)
    }
    return false
  }

  const formatEmailBody = () => {
    const industryLabel =
      data.industry === 'other'
        ? data.industryOther
        : INDUSTRIES.find((i) => i.id === data.industry)?.label || data.industry
    const needLabel = NEEDS.find((n) => n.id === data.need)?.label || data.need
    const timelineLabel =
      TIMELINES.find((t) => t.id === data.timeline)?.label || data.timeline

    return `Brief z redmind.pl

Branża: ${industryLabel}
Potrzebuję: ${needLabel}
Timeline: ${timelineLabel}

Imię: ${data.name}
Email: ${data.email}
Telefon: ${data.phone || '(nie podano)'}

Dodatkowe info:
${data.notes || '(brak)'}
`
  }

  const submit = async () => {
    setSubmitting(true)
    setError(null)

    const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT
    const body = formatEmailBody()

    try {
      if (endpoint) {
        // Real Formspree submit
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...data,
            _subject: `Brief od ${data.name} — ${data.industry}`,
            message: body,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } else {
        // Fallback: open mailto z prefill (działa zawsze bez backendu)
        const subject = encodeURIComponent(`Brief od ${data.name}`)
        const mailBody = encodeURIComponent(body)
        window.location.href = `mailto:redmind.mailbox@gmail.com?subject=${subject}&body=${mailBody}`
      }
      setStep(4)
    } catch (e: any) {
      setError(
        'Coś poszło nie tak. Napisz bezpośrednio: redmind.mailbox@gmail.com',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="brief"
      className="relative overflow-hidden bg-transparent py-24 md:py-40"
    >
      {/* Top warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            'linear-gradient(180deg, rgba(212,165,116,0.16) 0%, rgba(212,165,116,0) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-10 lg:px-14">
        <div className="brief-meta mb-6 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:mb-10 md:text-[11px] md:tracking-[0.32em]">
          <span>N° 007 — Brief</span>
          <span className="text-[#d4a574]">4 kroki · 2 minuty</span>
        </div>

        <h2 className="brief-headline font-display text-[clamp(2.4rem,10vw,6.5rem)] font-light leading-[1.0] tracking-tight text-white">
          <span className="block overflow-hidden pb-[0.05em]">
            <span className="inline-block">Powiedz mi</span>
          </span>
          <span className="block overflow-hidden pb-[0.05em] italic text-[#d4a574]">
            <span className="inline-block">czego potrzebujesz.</span>
          </span>
        </h2>

        <p className="brief-meta mt-5 max-w-2xl font-mono text-[13px] leading-relaxed text-white/65 md:mt-7 md:text-sm">
          Krótki brief — w ciągu 24 godzin dostajesz odpowiedź z propozycją
          dalszych kroków. Cztery pytania, bez zobowiązań.
        </p>

        {/* Form container */}
        <div className="brief-meta mt-12 rounded-2xl border border-white/10 bg-white/[0.015] p-6 backdrop-blur-sm md:mt-16 md:p-10">
          {/* Progress bar */}
          {step < 4 && (
            <div className="mb-8 flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= step
                      ? 'bg-[#d4a574]'
                      : 'bg-white/10'
                  }`}
                />
              ))}
              <span className="ml-3 shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                {step + 1}/4
              </span>
            </div>
          )}

          {/* Step content */}
          <div ref={stepRef}>
            {step === 0 && (
              <StepIndustry
                data={data}
                onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
              />
            )}
            {step === 1 && (
              <StepNeed
                data={data}
                onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
              />
            )}
            {step === 2 && (
              <StepTimeline
                data={data}
                onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
              />
            )}
            {step === 3 && (
              <StepContact
                data={data}
                onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
              />
            )}
            {step === 4 && <StepSuccess data={data} />}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4 font-mono text-[12px] text-red-300">
              {error}
            </p>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="mt-10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className={`rounded-full border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-all md:px-6 md:py-3.5 ${
                  step === 0
                    ? 'cursor-not-allowed border-white/5 text-white/20'
                    : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
                }`}
              >
                ← Cofnij
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed()}
                  data-magnetic
                  className={`group inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-all md:px-7 md:py-3.5 ${
                    canProceed()
                      ? 'bg-[#d4a574] text-[#0a0908] hover:bg-white'
                      : 'cursor-not-allowed bg-white/10 text-white/30'
                  }`}
                >
                  Dalej
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canProceed() || submitting}
                  data-magnetic
                  className={`group inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-all md:px-7 md:py-3.5 ${
                    canProceed() && !submitting
                      ? 'bg-[#d4a574] text-[#0a0908] hover:bg-white'
                      : 'cursor-not-allowed bg-white/10 text-white/30'
                  }`}
                >
                  {submitting ? 'Wysyłam...' : 'Wyślij brief'}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────
// STEPS
// ────────────────────────────────────────────────────────────────────────

function StepIndustry({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
        Krok 1 z 4
      </p>
      <h3 className="mt-3 font-display text-2xl font-light leading-tight text-white md:text-3xl">
        W jakiej branży działasz?
      </h3>
      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INDUSTRIES.map((ind) => {
          const active = data.industry === ind.id
          return (
            <button
              key={ind.id}
              type="button"
              onClick={() => onChange({ industry: ind.id, industryOther: '' })}
              className={`rounded-xl border px-5 py-4 text-left font-mono text-[12px] tracking-wide transition-all md:text-[13px] ${
                active
                  ? 'border-[#d4a574] bg-[#d4a574]/10 text-white'
                  : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:text-white'
              }`}
            >
              {ind.label}
            </button>
          )
        })}
      </div>
      {data.industry === 'other' && (
        <input
          type="text"
          autoFocus
          value={data.industryOther}
          onChange={(e) => onChange({ industryOther: e.target.value })}
          placeholder="Doprecyzuj branżę..."
          className="mt-4 w-full rounded-xl border border-white/15 bg-transparent px-5 py-4 font-mono text-[14px] text-white placeholder:text-white/30 focus:border-[#d4a574] focus:outline-none"
        />
      )}
    </div>
  )
}

function StepNeed({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
        Krok 2 z 4
      </p>
      <h3 className="mt-3 font-display text-2xl font-light leading-tight text-white md:text-3xl">
        Co dokładnie potrzebujesz?
      </h3>
      <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2">
        {NEEDS.map((n) => {
          const active = data.need === n.id
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onChange({ need: n.id })}
              className={`rounded-xl border p-5 text-left transition-all ${
                active
                  ? 'border-[#d4a574] bg-[#d4a574]/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/30'
              }`}
            >
              <p
                className={`font-display text-lg font-light leading-tight ${
                  active ? 'text-white' : 'text-white/80'
                }`}
              >
                {n.label}
              </p>
              <p className="mt-2 font-mono text-[12px] leading-relaxed text-white/55">
                {n.desc}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepTimeline({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
        Krok 3 z 4
      </p>
      <h3 className="mt-3 font-display text-2xl font-light leading-tight text-white md:text-3xl">
        Kiedy chciałbyś launch?
      </h3>
      <p className="mt-2 font-mono text-[12px] leading-relaxed text-white/50">
        Dobre planowanie = brak chaosu. Bez presji — wycena dopasuje się do
        Twojego terminu.
      </p>
      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TIMELINES.map((t) => {
          const active = data.timeline === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ timeline: t.id })}
              className={`rounded-xl border p-5 text-left transition-all ${
                active
                  ? 'border-[#d4a574] bg-[#d4a574]/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/30'
              }`}
            >
              <p
                className={`font-display text-xl font-light leading-tight ${
                  active ? 'text-white' : 'text-white/80'
                } md:text-2xl`}
              >
                {t.label}
              </p>
              <p className="mt-2 font-mono text-[12px] leading-relaxed text-white/55">
                {t.desc}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepContact({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4a574]">
        Krok 4 z 4
      </p>
      <h3 className="mt-3 font-display text-2xl font-light leading-tight text-white md:text-3xl">
        Jak się odezwać?
      </h3>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Imię"
          value={data.name}
          onChange={(v) => onChange({ name: v })}
          placeholder="Adam"
          required
        />
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="adam@firma.pl"
          required
        />
        <Input
          label="Telefon (opcjonalnie)"
          type="tel"
          value={data.phone}
          onChange={(v) => onChange({ phone: v })}
          placeholder="+48 ..."
        />
      </div>
      <div className="mt-4">
        <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
          Dodatkowe info (opcjonalnie)
        </label>
        <textarea
          rows={4}
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Co byś chciał osiągnąć tą stroną? Skąd nas znasz?"
          className="mt-2 w-full rounded-xl border border-white/15 bg-transparent px-5 py-4 font-mono text-[14px] leading-relaxed text-white placeholder:text-white/30 focus:border-[#d4a574] focus:outline-none"
        />
      </div>
    </div>
  )
}

function StepSuccess({ data }: { data: FormData }) {
  return (
    <div className="py-8 text-center md:py-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4a574]/40 bg-[#d4a574]/10 md:h-20 md:w-20">
        <span className="text-3xl text-[#d4a574]">✓</span>
      </div>
      <h3 className="font-display text-3xl font-light leading-tight text-white md:text-4xl">
        Brief odebrany.
      </h3>
      <p className="mt-4 mx-auto max-w-md font-mono text-[13px] leading-relaxed text-white/65 md:text-sm">
        Dzięki, {data.name || 'partnerze'}. Skontaktuję się z Tobą na{' '}
        <span className="text-[#d4a574]">{data.email}</span> w ciągu 24 godzin
        z propozycją dalszych kroków.
      </p>
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-white/35">
        Możesz teraz spokojnie zamknąć kartę.
      </p>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
        {label} {required && <span className="text-[#d4a574]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/15 bg-transparent px-5 py-4 font-mono text-[14px] text-white placeholder:text-white/30 focus:border-[#d4a574] focus:outline-none"
      />
    </div>
  )
}
