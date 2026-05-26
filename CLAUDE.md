# Portfolio Adam — Runbook dla Claude Code

Stronka: **redmind.pl** (Vercel) | Repo: `adambytniewski/portfolio-adam`
Stack: Next.js 15 · React 19 · TypeScript · Tailwind 3 · GSAP · Lenis · Three.js

---

## 🚨 NAJCZĘSTSZE PUŁAPKI (po kolei sprawdzaj!)

### 1. "Strona wygląda dobrze lokalnie ale źle na żywo" → CHECK VERCEL DEPLOYMENT FIRST

**Problem 26 maja 2026**: 6 commitów leciało na GitHub, ale Vercel nie deployował od 13 dni (GitHub→Vercel connection blocked, observation #1872). User widział starą wersję na iPhone i myślał że nasze zmiany nie działają.

**Sprawdzenie**:
```bash
cd portfolio-adam
vercel ls portfolio-adam | head -5
```
Jeśli najnowszy deployment ma więcej niż kilka minut po Twoim pushu → **auto-deploy nie działa**.

**Workaround (ręczny deploy)**:
```bash
vercel deploy --prod --yes
```

**Stała naprawa (akcja usera)**:
1. https://vercel.com/adambytniewski-8299s-projects/portfolio-adam/settings/git
2. "Manage Login Connections →" → Reconnect GitHub OAuth
3. Wróć na settings/git, klikij czarny GitHub button → wybierz `adambytniewski/portfolio-adam` → Connect

### 2. "Na telefonie nic nie widać / sekcje puste" → GSAP from(opacity:0) nie odpalił scrollTriggera

**Przyczyna**: Animacje `gsap.from({opacity: 0, yPercent: 110, ...})` z `scrollTrigger` ustawiają initial state jako niewidoczny. Jeśli trigger się nie odpali (Lenis vs touch scroll, fonts loading race, prefers-reduced-motion, iOS WebKit frame skip), content zostaje niewidoczny.

**Już naprawione w kodzie (zostawione jako wzór)**:
- `SmoothScroll.tsx` — Lenis WYŁĄCZONY na `pointer:coarse` i `max-width:767px`
- `CinematicHero.tsx`, `Manifesto.tsx`, `SelectedWork.tsx`, `Featured.tsx`, `NowFeed.tsx`, `Contact.tsx`, `SectionInterstitial.tsx` — każdy `useEffect` zaczyna od:
  ```js
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  if (isMobile) {
    gsap.set('.target-class', { opacity: 1, y: 0, /* target values */ })
    return // skip animation entirely
  }
  // ... desktop animations
  ```
- `app/globals.css` — **CSS SAFETY NET**:
  ```css
  @media (max-width: 767px) {
    .hero-line, .hero-meta, .manifesto-word, .work-card,
    .featured-line, .now-row, .contact-line, .wordmark-svg,
    .interstitial-line, /* ...wszystkie GSAP-animated */ {
      opacity: 1 !important;
      transform: none !important;
      clip-path: none !important;
      filter: none !important;
    }
  }
  ```
  To deterministyczny fallback. Działa NIEZALEŻNIE od GSAP. `!important` przebija nawet inline `style={{ clipPath: ... }}`.

**Jak dodać nową sekcję z animacjami GSAP**:
1. W useEffect zacznij od `if (isMobile) { gsap.set(...) return }`
2. Dodaj klasy animowanych elementów do safety net w `globals.css` (sekcja `@media (max-width: 767px)`)
3. Zostaw tylko **loop animations** (puls, marquee) na mobile — one są bezpieczne

### 3. "Horizontal overflow na mobile" → szukaj elementów z fixed width

**Przyczyna**: Elementy z `width: 600px` (lub innym hardcoded) w wrapperze bez `overflow-hidden` wystają z viewportu.

**Już naprawione**:
- `Featured.tsx`: flare miał `width: '600px'` → zmieniony na `width: 'min(600px, 110vw)'` + wrapper dostał `overflow-hidden`
- WorkCard `aspect-[16/10]` na mobile był za krótki dla bottom-info → wszystkie aspect-[4/5] na mobile

**Diagnoza nowych overflow** (Playwright evaluate):
```js
const vw = window.innerWidth;
document.querySelectorAll('*').forEach(el => {
  const r = el.getBoundingClientRect();
  if ((r.right > vw + 5 || r.left < -5) && r.width > 50) {
    let p = el.parentElement, hidden = false;
    while (p && p !== document.body) {
      const ps = getComputedStyle(p);
      if (ps.overflowX === 'hidden' || ps.overflow === 'hidden') { hidden = true; break; }
      p = p.parentElement;
    }
    if (!hidden) console.log(el.tagName, el.className, r.right - vw);
  }
});
```

---

## 🎯 Automatyczne pętle (Daily Now-feed)

Strona ma sekcję "Aktualne realizacje" (`content/now.json`) aktualizowaną **2× dziennie**:
- **18:00** — wpis za cały dzień (Windows Task Scheduler "Portfolio Daily Now Update")
- **03:00** — wpis z wieczornych sesji wczoraj (Task Scheduler "Portfolio Daily Now Night Update")

Skrypt: `scripts/daily-now.mjs` (flaga `--night` dla nocnego runa).
Engine: **Claude Code CLI** (`claude -p` przez stdin) — był Ollama qwen3:8b, ale przepiąłem na Claude'a (lepsza jakość, 3x szybsze).

Źródło: `OneDrive\Dokumenty\SecondBrain\Sessions\YYYY-MM-DD-*.md`

**Idempotencja**: `auto: true` flag w now.json (day) lub `auto: true, late: true` (night). Drugi run = skip.

**Manualne odpalenie**:
```bash
npm run daily-now       # tryb day
node scripts/daily-now.mjs --night    # tryb night (yesterday > 18:00)
```

---

## 📋 Testing checklist dla mobile

Przy każdej znacząnej zmianie kodu — Playwright na 390×844 (iPhone-like):

```js
// Sprawdź czy nie ma horizontal overflow
const html = document.documentElement;
return { scrollWidth: html.scrollWidth, clientWidth: html.clientWidth };
// Powinno być równe (np. 382 / 382 dla 390 vw - scrollbar)

// Sprawdź czy żadna sekcja nie ma elementów opacity:0
const sections = ['top', 'manifesto', 'work', 'featured', 'now', 'contact'];
sections.forEach(id => {
  const el = document.getElementById(id);
  let invisible = 0;
  el.querySelectorAll('*').forEach(c => {
    if (parseFloat(getComputedStyle(c).opacity) < 0.05 && getComputedStyle(c).display !== 'none') invisible++;
  });
  console.log(id, invisible);
});
// Każda sekcja powinna mieć 0 (poza desktop-only arrows z display:none w work)
```

---

## 🔑 Konwencje stylu

- Mobile-first padding: `px-5 md:px-10 lg:px-14`
- Mobile-first typography: `text-[clamp(2rem,8vw,5rem)]` (min realny dla mobile, max desktop)
- **Wszystkie aspect-ratios** uniformowe na mobile (np. wszystkie WorkCard = aspect-[4/5]). Asymetria tylko od `md:` (grid wielokolumnowy)
- Hover-only states (`group-hover:opacity-100`) muszą mieć mobile fallback (`opacity-100 md:opacity-0 md:group-hover:opacity-100`)
- `data-magnetic` na clickable elements (MagneticCursor pickup) — automatycznie pomijane na touch
