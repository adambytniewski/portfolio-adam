'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  Environment,
  MeshTransmissionMaterial,
  PerspectiveCamera,
} from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * CINEMATIC HERO V2 — Premium 3D portal scene.
 *
 * Cinematic narrative for Redmind Agency landing page:
 *  - Floating morphing crystal / sculpture (icosahedron z transmission material)
 *  - PBR / refraction / chromatic aberration → wygląda jak premium szkło
 *  - HDR studio environment → realistic reflection
 *  - Scroll-bound morph (gem → laptop slab → phone → wordmark)
 *  - Mouse parallax → kamera follow + crystal tilt
 *  - Postprocessing: Bloom + DoF + Vignette + Noise + Chromatic Aberration
 *
 * Layered HTML overlay z taglinem + CTA buttons.
 */

// ────────────────────────────────────────────────────────────────────────
// MORPHING CRYSTAL — main 3D object
// ────────────────────────────────────────────────────────────────────────

function MorphingCrystal({
  scrollRef,
  mouseRef,
}: {
  scrollRef: React.MutableRefObject<number>
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  // Target scale per scroll stage (4 stages, 0..1 normalized)
  const targetScales = useMemo(
    () => [
      new THREE.Vector3(1.0, 1.0, 1.0), // 0: gem
      new THREE.Vector3(1.7, 0.18, 1.1), // 1: laptop slab (flat horizontal)
      new THREE.Vector3(0.45, 1.6, 0.12), // 2: phone (tall narrow)
      new THREE.Vector3(1.9, 0.55, 0.55), // 3: wordmark (horizontal block)
    ],
    [],
  )

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return

    // Idle rotation
    meshRef.current.rotation.y += delta * 0.15
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.25) * 0.12

    // Mouse parallax tilt of group
    const tx = mouseRef.current.x * 0.3
    const ty = mouseRef.current.y * 0.2
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      tx,
      0.05,
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -ty,
      0.05,
    )

    // Scale morph driven by scroll (0..1 mapped to 0..3 stages)
    const stage = scrollRef.current * 3
    const i0 = Math.min(Math.floor(stage), 3)
    const i1 = Math.min(i0 + 1, 3)
    const t = stage - i0
    const target = new THREE.Vector3().lerpVectors(
      targetScales[i0],
      targetScales[i1],
      t,
    )
    meshRef.current.scale.lerp(target, 0.08)
  })

  return (
    <group ref={groupRef}>
      <Float
        floatIntensity={0.8}
        speed={1.2}
        rotationIntensity={0.3}
        floatingRange={[-0.15, 0.15]}
      >
        <mesh ref={meshRef}>
          {/* High-poly icosahedron for smooth refraction */}
          <icosahedronGeometry args={[1, 6]} />
          <MeshTransmissionMaterial
            color="#f5d4a3"
            thickness={0.6}
            roughness={0.05}
            chromaticAberration={0.15}
            ior={1.55}
            transmission={1}
            backside
            backsideThickness={0.4}
            temporalDistortion={0.08}
            distortion={0.2}
            distortionScale={0.4}
            anisotropy={0.5}
            samples={6}
            resolution={512}
          />
        </mesh>
      </Float>

      {/* Inner core — emissive accent */}
      <mesh scale={0.18}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#d4a574"
          emissive="#d4a574"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

// ────────────────────────────────────────────────────────────────────────
// AMBIENT PARTICLES — golden dust floating slowly
// ────────────────────────────────────────────────────────────────────────

function AmbientParticles() {
  const meshRef = useRef<THREE.Points>(null)
  const count = 200

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.02
    const pos = meshRef.current.geometry.attributes.position
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.0015
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4a574"
        size={0.025}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ────────────────────────────────────────────────────────────────────────
// SCENE — komponuje lights + objects + postprocessing
// ────────────────────────────────────────────────────────────────────────

function Scene({
  scrollRef,
  mouseRef,
  isMobile,
}: {
  scrollRef: React.MutableRefObject<number>
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
  isMobile: boolean
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={35} />

      {/* Lighting — cinematic warm setup */}
      <ambientLight intensity={0.15} />
      {/* Key light — warm amber backlight */}
      <directionalLight
        position={[5, 6, 5]}
        intensity={2.8}
        color="#ffd9a3"
      />
      {/* Fill light — deep ember */}
      <pointLight position={[-4, -2, -3]} intensity={1.8} color="#a8632d" />
      {/* Rim light */}
      <pointLight position={[0, 4, -5]} intensity={2.2} color="#ffeacc" />

      {/* HDR environment for reflections */}
      <Environment preset="studio" environmentIntensity={0.4} />

      <MorphingCrystal scrollRef={scrollRef} mouseRef={mouseRef} />
      <AmbientParticles />

      {/* Postprocessing stack — różne dla mobile vs desktop żeby DoF nie żarł baterii */}
      {isMobile ? (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            offset={[0.0008, 0.0008] as any}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.15} darkness={1.05} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <DepthOfField
            focusDistance={0.018}
            focalLength={0.05}
            bokehScale={3}
          />
          <ChromaticAberration
            offset={[0.0012, 0.0012] as any}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.15} darkness={1.05} />
          <Noise
            opacity={0.04}
            blendFunction={BlendFunction.MULTIPLY}
            premultiply
          />
        </EffectComposer>
      )}
    </>
  )
}

// ────────────────────────────────────────────────────────────────────────
// MAIN HERO COMPONENT
// ────────────────────────────────────────────────────────────────────────

export default function CinematicHeroV2() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [is3DEnabled, setIs3DEnabled] = useState(true)

  // Detect mobile + low-end devices (don't try Three.js on Android Go-tier)
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)').matches
    setIsMobile(mobile)
    // Disable 3D for prefers-reduced-motion users
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion) setIs3DEnabled(false)
  }, [])

  // Scroll tracking → drives morph
  useEffect(() => {
    const onScroll = () => {
      const max = window.innerHeight * 1.5
      scrollRef.current = Math.min(window.scrollY / max, 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mouse tracking → drives parallax tilt
  useEffect(() => {
    if (isMobile) return
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [isMobile])

  // Hero text entry animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-v2-line', {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.3,
      })
      gsap.from('.hero-v2-meta', {
        opacity: 0,
        y: 12,
        duration: 0.8,
        stagger: 0.06,
        delay: 1.0,
        ease: 'power2.out',
      })
      gsap.from('.hero-v2-cta', {
        opacity: 0,
        y: 16,
        duration: 0.7,
        stagger: 0.1,
        delay: 1.4,
        ease: 'expo.out',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-[100svh] w-full overflow-hidden bg-transparent"
    >
      {/* 3D Canvas USUNIETY — video bg z layoutu jest natywnym tlem hero.
          Subtle bottom-up dark gradient zachowany dla czytelnosci tekstu. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,9,8,0.35) 0%, rgba(10,9,8,0) 25%, rgba(10,9,8,0) 60%, rgba(10,9,8,0.85) 100%)',
        }}
      />

      {/* === Foreground content layer (z-20) === */}
      <div className="relative z-20 flex h-full flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28 lg:px-14">
        <div aria-hidden />

        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="hero-v2-meta font-mono text-[10px] uppercase tracking-[0.32em] text-[#d4a574] md:text-[11px]">
            — Redmind Agency · Premium Web · Est. 2026
          </p>

          {/* Headline */}
          <h1 className="mt-5 font-display text-[clamp(2.8rem,11vw,8.5rem)] font-light leading-[1.02] tracking-tight text-white md:mt-6">
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="hero-v2-line inline-block">Strony które</span>
            </span>
            <span className="block overflow-hidden pb-[0.05em] italic text-[#d4a574]">
              <span className="hero-v2-line inline-block">klient</span>
            </span>
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="hero-v2-line inline-block">pamięta.</span>
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="hero-v2-meta mt-6 max-w-xl font-mono text-[13px] leading-relaxed text-white/70 md:mt-8 md:text-sm">
            Cinematic Next.js dla polskich firm.{' '}
            <span className="text-white">7 na 10 klientów</span> idzie do
            trzeciego wyniku w Google. Bez własnej strony — nawet jeśli jesteś
            dwa razy lepszy, oni Cię nie znajdą.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10">
            <a
              href="#mockup"
              data-magnetic
              className="hero-v2-cta group inline-flex items-center justify-center gap-3 rounded-full bg-[#d4a574] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0a0908] transition-all hover:bg-white md:px-7 md:text-[12px]"
            >
              Darmowy mockup w 48h
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#reel"
              data-magnetic
              className="hero-v2-cta inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/75 transition-all hover:border-[#d4a574] hover:text-[#d4a574] md:px-7 md:text-[12px]"
            >
              Zobacz reel
              <span>↓</span>
            </a>
          </div>
        </div>

        {/* Bottom strip — minimalist meta */}
        <div className="grid grid-cols-2 items-end gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:grid-cols-4 md:gap-6">
          <div className="hero-v2-meta">
            <span className="block text-white/25">Stack</span>
            <span>Next.js · R3F · GSAP</span>
          </div>
          <div className="hero-v2-meta">
            <span className="block text-white/25">Location</span>
            <span>Polska · CET</span>
          </div>
          <div className="hero-v2-meta hidden md:block">
            <span className="block text-white/25">Status</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d4a574]" />
              Open dla zleceń
            </span>
          </div>
          <div className="hero-v2-meta hidden items-end justify-end gap-2 md:flex">
            <span>Scroll</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>
      </div>
    </section>
  )
}
