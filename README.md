# Adam Bytniewski — Portfolio

Cinematic personal site / wizytówka. Stack: **Next.js 15 + React 19 + Three.js + GSAP + Lenis + Tailwind**.

---

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz `http://localhost:3000`.

---

## Reguła kuratorska Now feed (dla Claude Code)

Gdy Adam prosi *"wybierz najmocniejszą rzecz z dziś i dorzuć do now feed"*:

1. **Zidentyfikuj** wszystkie meaningful achievements z sesji (i innych sesji dnia jeśli są w claude-mem)
2. **Otaguj** każde: `build` / `skill` / `tooling` / `automation` / `music` / `ai-video` / `discovery` / `decision`
3. **Zrankuj** po wadze: feature/launch > major decision > significant fix > polish > cleanup
4. **Sprawdź** ostatnie 2 wpisy w `content/now.json` — jakie mają tagi?
5. Jeśli #1 ma TEN SAM tag co ostatnie 2 wpisy:
   - Czy to **milestone** (premiera, deploy, 10x upgrade, first-of-its-kind, major architectural shift)?
     - **TAK** → kontynuuj z #1, ten sam tag jest OK
     - **NIE** → schodzić na #2 z innym tagiem (variety > monotonia)
6. Jeśli #1 ma świeży tag → używaj #1 bez wahania

**Cel:** Now feed ma czytać się jak różnorodny dziennik twórcy, nie jak monoton dev-loga. Tag variety > forsowanie tylko najmocniejszego zawsze.

**Format wpisu** (editorial polski, 1. osoba, ~2 zdania):
```json
{
  "date": "YYYY-MM-DD",
  "title": "Krótki tytuł — co konkretnie",
  "body": "Pierwsze zdanie: co zrobiłem (technicznie). Drugie zdanie: co to daje / dlaczego ważne.",
  "tag": "build|skill|tooling|automation|music|ai-video|discovery|decision"
}
```

---

## Jak dodać nowe rzeczy (raz na 2 dni)

Masz dwa typy contentu:

### 1. Now / Latest feed — szybki wpis o tym czego się uczysz

Najszybsza droga:

```bash
npm run add:now
```

CLI zapyta o tytuł, treść, tag i datę → zapisze do `content/now.json`.

Albo edytuj ręcznie `content/now.json` — najnowsze wpisy idą na górę listy `items`:

```json
{
  "date": "2026-05-08",
  "title": "Krótki tytuł",
  "body": "1-3 zdania o tym co odkryłeś / zbudowałeś / zepsułeś.",
  "tag": "build"
}
```

Sugerowane tagi: `skill`, `tooling`, `automation`, `build`, `music`, `ai-video`.

### 2. Selected Work — pełny projekt do portfolio

```bash
npm run add:work
```

Albo ręcznie w `content/work.json`. Pole `category` przyjmuje:
`video`, `photo`, `automation`, `app`, `website`, `music`.

Cover do projektu: zrób SVG/PNG/JPG i wrzuć do `public/work/<id>.svg`,
potem ustaw pole `"cover": "/work/<id>.svg"`.

### 3. Skills / Stack

Edytuj `content/skills.json` jeśli dorzucasz nowy tool.

### 4. Profil (imię, email, status, socials)

`content/profile.json` — edycja jednego pliku, propagacja do całej strony.

---

## Struktura projektu

```
portfolio-adam/
├── app/
│   ├── layout.tsx          ← Fonty, metadata, preloader, kursor
│   ├── page.tsx            ← Wszystkie sekcje w kolejności
│   └── globals.css         ← Tailwind + marquee + scroll/cursor
├── components/
│   ├── Hero/
│   │   ├── CinematicHero.tsx     ← 3-warstwowy parallax + branding
│   │   └── ShaderBackground.tsx  ← Custom GLSL fbm noise (signature)
│   ├── Sections/
│   │   ├── Manifesto.tsx         ← Word-by-word reveal scroll
│   │   ├── SkillsStrip.tsx       ← 2-row infinite marquee
│   │   ├── SelectedWork.tsx      ← Filterable asymmetric grid
│   │   ├── Featured.tsx          ← Spotlight: Second Brain (light section)
│   │   ├── NowFeed.tsx           ← Live log nauki (every-2-days)
│   │   └── Contact.tsx           ← Big email + footer
│   ├── UI/
│   │   ├── MagneticCursor.tsx    ← Dot + ring follower z magnesem
│   │   ├── Preloader.tsx         ← Iris-out 0→100 counter
│   │   └── ScrollProgress.tsx    ← Top-of-page progress bar
│   └── SmoothScroll.tsx          ← Lenis ↔ ScrollTrigger sync
├── content/
│   ├── work.json           ← Pozycje portfolio
│   ├── now.json            ← Live log feed
│   ├── skills.json         ← Stack / tools
│   └── profile.json        ← Imię, email, status
├── lib/content.ts          ← Typy + helpers
├── public/work/*.svg       ← Cover arts (SVG)
└── scripts/add.mjs         ← Interaktywny CLI do dodawania
```

---

## Deploy + domena

### Deploy na Vercel (rekomendowany — 0 configu)

1. Wrzuć repo na GitHub
2. `vercel.com/new` → import repo → deploy
3. Po pierwszym deployu masz URL typu `adam-portfolio.vercel.app`

### Podpięcie własnej domeny

W panelu Vercel → Project → Settings → **Domains** → "Add domain":
- wpisz np. `adambytniewski.pl`
- skopiuj rekordy DNS (A + CNAME) które ci da Vercel
- wklej je u rejestratora domeny (OVH/home.pl/Cloudflare etc.)
- propagacja DNS: 5min – 24h, zwykle <1h

Vercel sam wystawi cert SSL (Let's Encrypt). HTTPS auto.

---

## Co tu jest premium

- **Custom GLSL shader** w hero (fbm noise + warm palette + mouse glow + scroll-reactive vignette + film grain)
- **3-warstwowy parallax** zsynchronizowany z Lenis-em (bez stutteru przy scrub)
- **Magnetic cursor** z dwiema warstwami (instant dot + eased ring) i mix-blend-difference
- **Word-by-word scroll-driven reveal** w manifeście
- **Asymetryczna siatka** z 5-elementowym wzorem col-span (nie 3-column slop)
- **Image parallax na hover** w każdej work card (powolny eased shift)
- **Cinematic preloader** z iris-out i licznikiem 000 → 100
- **Editorial typography**: Fraunces (display, italic accents) + JetBrains Mono (body)
- **Live clock w hero** (Europe/Warsaw)
- **Reduced-motion fallback** (cały GSAP się wycisza, kursor wraca do natywnego)

---

## Skróty / nawigacja

Wszystkie sekcje są ankerowane: `#top` `#manifesto` `#work` `#featured` `#now` `#contact`.

---

Built with cinematic-web skill methodology · 2026
