'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { CinematicFX } from '../Fx/CinematicFX'

/**
 * SHOWPIECE — scroll-driven cinematic 3D narrative section.
 *
 * Pattern adapted from MERIDIAN-01 / Assembly.jsx:
 *  - h-[260vh] container, sticky inner viewport
 *  - progressRef updated on raw scroll (no re-renders, R3F reads via useFrame)
 *  - 36 procedural pieces: assemble → orbit → dissolve
 *  - Mobile: static formation, no scroll animation
 *
 * Brand: Redmind Agency gold/warm palette (#d4a574 accent, #a8632d deep).
 */

const PART_COUNT = 36

type Part = {
  i: number
  target: [number, number, number]
  start: [number, number, number]
  explode: [number, number, number]
  kind: number
  baseAngle: number
}

function generateParts(): Part[] {
  // Deterministic seed so SSR/CSR match — avoids hydration mismatch
  const rand = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }
  const parts: Part[] = []
  for (let i = 0; i < PART_COUNT; i++) {
    const ring = Math.floor(i / 12)
    const idxInRing = i % 12
    const a = (idxInRing / 12) * Math.PI * 2 + ring * 0.25
    const r = 0.7 + ring * 0.35
    const yOff = (rand(i * 13) - 0.5) * 0.18
    const target: [number, number, number] = [
      Math.sin(a) * r,
      yOff,
      Math.cos(a) * r,
    ]
    const start: [number, number, number] = [
      (rand(i * 3) - 0.5) * 14,
      (rand(i * 7) - 0.5) * 8,
      (rand(i * 11) - 0.5) * 12,
    ]
    const explode: [number, number, number] = [
      Math.sin(a) * (r + 6 + rand(i * 17) * 2.5),
      yOff + (rand(i * 19) - 0.5) * 5,
      Math.cos(a) * (r + 6 + rand(i * 23) * 2.5),
    ]
    parts.push({ i, target, start, explode, kind: i % 5, baseAngle: a })
  }
  return parts
}

function Piece({
  data,
  progressRef,
}: {
  data: Part
  progressRef: React.MutableRefObject<number>
}) {
  const ref = useRef<THREE.Mesh>(null)
  const targetVec = useMemo(() => new THREE.Vector3(...data.target), [data.target])
  const startVec = useMemo(() => new THREE.Vector3(...data.start), [data.start])
  const explodeVec = useMemo(() => new THREE.Vector3(...data.explode), [data.explode])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!ref.current) return
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1)

    if (p < 0.55) {
      // Phase 1: assemble from chaos to ring
      const tp = p / 0.55
      const eased = 1 - Math.pow(1 - tp, 3)
      tmp.lerpVectors(startVec, targetVec, eased)
      ref.current.position.copy(tmp)
      ref.current.rotation.x = (1 - eased) * Math.PI * 2
      ref.current.rotation.y = (1 - eased) * Math.PI * 1.5
    } else {
      // Phase 2: explode outward
      const tp = (p - 0.55) / 0.45
      const eased = Math.pow(tp, 2)
      tmp.lerpVectors(targetVec, explodeVec, eased)
      ref.current.position.copy(tmp)
      ref.current.rotation.x = eased * Math.PI * 3
      ref.current.rotation.y = eased * Math.PI * 2
      ref.current.rotation.z = eased * Math.PI * 1.5
    }

    // Subtle idle orbit while assembled
    if (p > 0.3 && p < 0.6) {
      ref.current.rotation.y += state.clock.elapsedTime * 0.0002
    }
  })

  const geom = (() => {
    switch (data.kind) {
      case 0:
        return <torusGeometry args={[0.11, 0.028, 12, 24]} />
      case 1:
        return <boxGeometry args={[0.15, 0.04, 0.08]} />
      case 2:
        return <octahedronGeometry args={[0.07, 0]} />
      case 3:
        return <cylinderGeometry args={[0.06, 0.06, 0.022, 24]} />
      default:
        return <icosahedronGeometry args={[0.055, 0]} />
    }
  })()

  const isAccent = data.kind === 2 || data.kind === 4
  const color = isAccent ? '#d4a574' : data.kind === 1 ? '#a8632d' : '#e8d4a8'
  const emissive = isAccent ? '#3a2410' : '#000000'
  const emissiveIntensity = isAccent ? 0.35 : 0

  return (
    <mesh ref={ref} castShadow>
      {geom}
      <meshStandardMaterial
        color={color}
        metalness={0.88}
        roughness={0.28}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        envMapIntensity={1.3}
      />
    </mesh>
  )
}

function CenterBloom({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (!ref.current) return
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1)
    const intensity = p < 0.55 ? p / 0.55 : Math.max(0, 1 - (p - 0.55) / 0.35)
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = intensity * 0.55
    const s = 0.25 + intensity * 0.6
    ref.current.scale.set(s, s, s)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.0, 32, 32]} />
      <meshBasicMaterial color="#d4a574" transparent opacity={0} />
    </mesh>
  )
}

function ShowpieceScene({
  progressRef,
  parts,
  isMobile,
}: {
  progressRef: React.MutableRefObject<number>
  parts: Part[]
  isMobile: boolean
}) {
  return (
    <>
      <color attach="background" args={['#0a0908']} />
      <fog attach="fog" args={['#0a0908', 4, 15]} />
      <ambientLight intensity={0.15} />
      <spotLight
        position={[3, 5, 3]}
        angle={0.5}
        penumbra={1}
        intensity={isMobile ? 14 : 22}
        color="#fff3d6"
        castShadow={!isMobile}
      />
      <spotLight
        position={[-3, 3, 2]}
        angle={0.55}
        penumbra={1}
        intensity={9}
        color="#d4a574"
      />
      <pointLight position={[-3, 0, -2]} intensity={2.5} color="#a8632d" />
      <pointLight position={[2, -1, 3]} intensity={1.6} color="#6e3d12" />
      <Suspense fallback={null}>
        <CenterBloom progressRef={progressRef} />
        {parts.map((d) => (
          <Piece key={d.i} data={d} progressRef={progressRef} />
        ))}
        {!isMobile && (
          <Sparkles
            count={70}
            scale={[8, 5, 8]}
            size={1.6}
            speed={0.18}
            color="#fffaee"
            opacity={0.35}
          />
        )}
        <Environment preset="studio" environmentIntensity={0.55} />
      </Suspense>
      <CinematicFX
        isMobile={isMobile}
        bloomIntensity={isMobile ? 0.9 : 1.15}
        bloomThreshold={0.6}
        vignetteOffset={0.3}
        vignetteDarkness={0.9}
        chromaticOffset={0.0008}
        noiseOpacity={0.04}
        dof={false}
      />
    </>
  )
}

export default function Showpiece() {
  const root = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const parts = useMemo(() => generateParts(), [])

  useEffect(() => {
    setMounted(true)
    const mm = window.matchMedia('(max-width: 767px)')
    setIsMobile(mm.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mm.addEventListener('change', onChange)
    return () => mm.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (isMobile) {
      // Mobile: lock to stable assembled formation
      progressRef.current = 0.45
      return
    }
    const onScroll = () => {
      if (!root.current) return
      const rect = root.current.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) return
      const scrolled = -rect.top
      progressRef.current = Math.min(Math.max(scrolled / total, 0), 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile])

  return (
    <section
      id="showpiece"
      ref={root}
      className="relative w-full bg-[#0a0908]"
      style={{ height: isMobile ? '100svh' : '260vh' }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {mounted && (
          <Canvas
            camera={{ position: [0, 0.8, 3.6], fov: 42 }}
            dpr={[1, isMobile ? 1.25 : 1.75]}
            shadows={!isMobile}
            performance={{ min: 0.5 }}
          >
            <ShowpieceScene
              progressRef={progressRef}
              parts={parts}
              isMobile={isMobile}
            />
          </Canvas>
        )}

        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between px-5 md:px-12 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="showpiece-meta font-mono text-[11px] md:text-xs uppercase tracking-[0.3em] text-[#d4a574]/70 mb-3">
              Sekcja 04 · Showpiece
            </div>
            <h2 className="showpiece-headline font-[var(--font-display)] text-[#f5f1ea] text-4xl md:text-6xl leading-[0.95]">
              Trzydzieści sześć elementów.<br />
              <span className="text-[#d4a574]">Jedna strona,</span><br />
              <span className="text-[#f5f1ea]/60">która oddycha.</span>
            </h2>
          </div>
          <div className="flex justify-between items-end gap-8">
            <div className="showpiece-meta font-mono text-[11px] md:text-xs text-[#f5f1ea]/55 max-w-sm leading-relaxed">
              Każda strona z Redmind to nie szablon. To kompozycja kodu, typografii i ruchu — złożona ręcznie, jak zegarek.
            </div>
            <div className="showpiece-meta font-mono text-[10px] md:text-[11px] text-[#f5f1ea]/45 uppercase tracking-[0.3em] text-right hidden md:block">
              Scroll<br />
              <span className="text-[#d4a574]">to feel it</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
