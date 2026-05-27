'use client'

import { useMemo } from 'react'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

type Props = {
  isMobile?: boolean
  bloomIntensity?: number
  bloomThreshold?: number
  bloomSmoothing?: number
  vignetteOffset?: number
  vignetteDarkness?: number
  chromaticOffset?: number
  noiseOpacity?: number
  dof?: boolean
  dofFocusDistance?: number
  dofFocalLength?: number
  dofBokehScale?: number
}

/**
 * Reusable cinematic postprocessing stack. Drop inside any <Canvas>.
 * Mobile path skips DoF + Noise + uses lower MSAA to save battery/GPU.
 */
export function CinematicFX({
  isMobile = false,
  bloomIntensity = 1.0,
  bloomThreshold = 0.2,
  bloomSmoothing = 0.9,
  vignetteOffset = 0.2,
  vignetteDarkness = 1.0,
  chromaticOffset = 0.001,
  noiseOpacity = 0.04,
  dof = true,
  dofFocusDistance = 0.018,
  dofFocalLength = 0.05,
  dofBokehScale = 3,
}: Props) {
  const chromaVec = useMemo(
    () => new THREE.Vector2(chromaticOffset, chromaticOffset),
    [chromaticOffset],
  )

  if (isMobile) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomIntensity * 0.8}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={bloomSmoothing}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={chromaVec}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={vignetteOffset} darkness={vignetteDarkness} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      {dof ? (
        <DepthOfField
          focusDistance={dofFocusDistance}
          focalLength={dofFocalLength}
          bokehScale={dofBokehScale}
        />
      ) : (
        <></>
      )}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaVec}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={vignetteOffset} darkness={vignetteDarkness} />
      <Noise
        opacity={noiseOpacity}
        blendFunction={BlendFunction.MULTIPLY}
        premultiply
      />
    </EffectComposer>
  )
}

export default CinematicFX
