'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Custom GLSL shader background — flowing warm noise.
 * Calm, atmospheric gold-brown waves. Mouse-reactive glow.
 * Subtle scroll-driven darkening (no zoom, no dramatic transitions).
 */
export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_scroll: { value: 0 },
    }

    const fragmentShader = /* glsl */ `
      precision highp float;

      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_scroll;

      vec2 hash22(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
        const float K1 = 0.366025404;
        const float K2 = 0.211324865;
        vec2 i = floor(p + (p.x + p.y) * K1);
        vec2 a = p - i + (i.x + i.y) * K2;
        vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0 * K2;
        vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
        vec3 n = h * h * h * h * vec3(
          dot(a, hash22(i)),
          dot(b, hash22(i + o)),
          dot(c, hash22(i + 1.0))
        );
        return dot(n, vec3(70.0));
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

        float t = u_time * 0.06;
        vec2 q = vec2(fbm(p + t), fbm(p + vec2(2.3, 1.7) + t));
        vec2 r = vec2(
          fbm(p + 2.0 * q + vec2(1.7, 9.2) + 0.15 * t),
          fbm(p + 2.0 * q + vec2(8.3, 2.8) + 0.13 * t)
        );
        float f = fbm(p + 2.0 * r);

        // Mouse-reactive soft glow
        vec2 m = u_mouse - uv;
        m.x *= u_resolution.x / u_resolution.y;
        float md = length(m);
        float glow = smoothstep(0.45, 0.0, md) * 0.35;

        // Warm gold-brown palette — calm, atmospheric
        vec3 deep   = vec3(0.039, 0.035, 0.031); // #0a0908
        vec3 ember  = vec3(0.235, 0.122, 0.051); // dark amber
        vec3 honey  = vec3(0.831, 0.647, 0.455); // #d4a574

        vec3 col = mix(deep, ember, smoothstep(-0.2, 0.6, f + 0.1 * r.x));
        col = mix(col, honey, smoothstep(0.4, 0.95, f + q.x * 0.5) * 0.55);
        col += honey * glow;

        // Soft vignette — frames the composition
        float vign = 1.0 - smoothstep(0.4, 1.1, length((uv - 0.5) * vec2(1.4, 1.0)));
        col *= mix(0.55, 1.0, vign);

        // Subtle scroll-reactive darkening (so the hero softly recedes as user scrolls)
        col *= mix(1.0, 0.6, clamp(u_scroll, 0.0, 1.0));

        // Film grain
        float grain = (hash22(gl_FragCoord.xy + u_time).x) * 0.04;
        col += grain;

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const vertexShader = /* glsl */ `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let mouseTarget = { x: 0.5, y: 0.5 }
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = e.clientX / window.innerWidth
      mouseTarget.y = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Subtle scroll darkening — driven by raw scrollY (no pin / no proxy needed)
    const onScroll = () => {
      const max = window.innerHeight
      uniforms.u_scroll.value = Math.min(window.scrollY / max, 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const start = performance.now()
    let raf = 0
    const tick = () => {
      uniforms.u_time.value = (performance.now() - start) * 0.001
      uniforms.u_mouse.value.x +=
        (mouseTarget.x - uniforms.u_mouse.value.x) * 0.05
      uniforms.u_mouse.value.y +=
        (mouseTarget.y - uniforms.u_mouse.value.y) * 0.05
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 z-0 h-full w-full"
    />
  )
}
