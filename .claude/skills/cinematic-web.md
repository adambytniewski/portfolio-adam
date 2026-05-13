---
name: cinematic-web
description: Build cinematic, premium-feeling websites with depth, parallax, scroll-driven animations, and 3D visuals. Use when the user asks for a "cinematic", "premium", "agency-style", "Awwwards-style", "scroll-animated", or "parallax" site. Stack: Three.js + GSAP/ScrollTrigger + Lenis. Methodology adapted from @weblove TikTok tutorials.
---

# Cinematic Web Skill

This skill produces websites that feel like Awwwards SOTD entries — not template-dumps. The signature: **depth, motion, restraint**. Every animation has weight; every scroll feels intentional.

## Core Stack (NON-NEGOTIABLE)

```bash
npm install three gsap @studio-freight/lenis
```

- **Three.js** → 3D scenes, depth, atmospheric visuals (NOT decoration — narrative)
- **GSAP + ScrollTrigger** → scroll-driven animations, timelines, pinning
- **Lenis** → smooth scroll (the difference between cheap and premium is here)

Optional add-ons when scope demands:
- `framer-motion` for component-level micro-interactions in React
- `@react-three/fiber` + `@react-three/drei` if working in React
- `splitting.js` or manual `Intl.Segmenter` for text-by-character reveals

## Methodology — 6 Steps (weblove framework)

Follow this order. Skipping steps produces "AI slop" sites.

### 1. PLAN before coding
List every scene/section with:
- **Anchor element** (the visual hero — image, 3D object, type)
- **Motion intent** (what does the user feel here? not "what moves")
- **Trigger** (scroll position, time, hover, viewport entry)
- **Depth layers** (foreground / midground / background — minimum 3)

Output a scene-list as commented pseudocode BEFORE writing any JSX/HTML.

### 2. LAYER for depth
Cut foreground subjects from backgrounds. Real depth requires ≥3 z-layers per cinematic section. Flat hero images = dead site. Use:
- Removed-background PNGs for product/people foregrounds
- Blurred background plates (CSS `filter: blur(20px)` or pre-rendered)
- Particle/noise/gradient mid-layers via Three.js or canvas

### 3. ANIMATE with intent — pan / zoom / tilt / parallax
GSAP timeline per section. Parallax is the floor, not the ceiling:
```js
gsap.to(".bg-layer", { yPercent: -30, ease: "none", scrollTrigger: { scrub: true }})
gsap.to(".mid-layer", { yPercent: -15, ease: "none", scrollTrigger: { scrub: true }})
gsap.to(".fg-layer", { yPercent: -5,  ease: "none", scrollTrigger: { scrub: true }})
```
Each layer moves at a different rate. Closer = slower. This is parallax 101 but most sites get it wrong by moving everything together.

### 4. TRANSITION between sections
No hard cuts. Use:
- Mask reveals (`clip-path: inset(...)`)
- Cross-fades with overlapping ScrollTrigger ranges
- Scale-and-blur handoffs (one section scales up + blurs out as next fades in)
- Pinned sections (`scrollTrigger: { pin: true }`) for hero moments

### 5. CUSTOM CSS for movement timing
GSAP defaults are fine. Custom `cubic-bezier()` is better. The "premium" feel comes from easing curves that mimic physics:
- `cubic-bezier(0.6, 0.01, 0.05, 0.95)` — confident, weighty
- `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out, smooth landing
- AVOID: `ease-in-out`, default `ease`, anything linear (except scrub)

### 6. LAUNCH cinematic
Final pass checklist:
- [ ] Lenis registered + integrated with ScrollTrigger
- [ ] No layout shift on load (reserve space for 3D canvas)
- [ ] Reduced-motion fallback (`@media (prefers-reduced-motion)`)
- [ ] Mobile: 3D scenes degraded to static, parallax kept simple
- [ ] First contentful paint < 1.5s (Three.js lazy-loaded)
- [ ] No generic fonts (Inter, Roboto banned — use editorial choices)

## Lenis + ScrollTrigger Integration (REQUIRED PATTERN)

This is the snippet that gets forgotten and breaks scrub animations:

```js
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

Without this, Lenis and ScrollTrigger fight each other.

## Three.js Defaults

- Use `THREE.WebGLRenderer({ antialias: true, alpha: true })` for transparent canvases
- Set `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — 3 wastes GPU
- Avoid `THREE.CapsuleGeometry` (introduced r142+, breaks in older builds)
- Lazy-load Three on scroll into the section that needs it — don't ship 600KB on hero

## Aesthetic Direction — Anti-Slop Rules

DO NOT default to:
- Purple gradients on white
- Inter / Roboto / system-ui
- Centered hero with "Welcome to [Brand]"
- Cards in a 3-column grid
- Identical card hover effects
- Stock-photo people staring at laptops

DO commit to:
- Editorial typography (serif display + mono body, OR brutalist sans + italic accents)
- Off-grid layouts, asymmetry, diagonal flow
- One signature interaction the visitor remembers in a week
- Color palette: 1 dominant + 1 sharp accent + neutrals (NOT 5 equal colors)
- Grain, noise, or paper texture overlays where appropriate

## Quick Reference — Snippet Library

### Parallax hero with 3 layers
See `components/Hero/CinematicHero.jsx` in starter.

### Scroll-pinned text reveal
```js
gsap.from(".reveal-text", {
  scrollTrigger: { trigger: ".reveal-text", start: "top 80%", scrub: 0.5 },
  yPercent: 100,
  stagger: 0.05,
  ease: "expo.out"
})
```

### Image mask reveal
```css
.mask-reveal { clip-path: inset(0 100% 0 0); transition: clip-path 1.2s cubic-bezier(0.6, 0.01, 0.05, 0.95); }
.mask-reveal.in-view { clip-path: inset(0 0 0 0); }
```

## When User Asks For "More"

Tier-up additions in priority order:
1. **WebGL shader background** (custom GLSL, not stock noise)
2. **Cursor-follower with magnetic buttons**
3. **Page transitions** (Barba.js or Next.js `view-transition-name`)
4. **Audio-reactive elements** (Web Audio API + Three.js uniforms)
5. **Scroll-driven 3D camera path** (CatmullRomCurve3 + scroll progress)

Tier 1–2 should be in every cinematic site. Tier 3+ when scope and budget allow.
