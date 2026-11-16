import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSceneStore } from '../../store/useSceneStore'
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode, type BloomEffect } from 'postprocessing'
import * as THREE from 'three'

export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

/**
 * Bloom only catches pixels brighter than 1.0 (HDR), so ordinary surfaces stay crisp
 * and only glowing keys bleed light. Tone mapping runs LAST so bloom works on linear HDR values.
 * Mobile: no chromatic aberration and no MSAA to save fill-rate.
 */
export default function Effects({ lite }: { lite: boolean }) {
  const isSmall = useMemo(isMobile, [])
  const mobile = lite || isSmall
  const offset = useMemo(() => new THREE.Vector2(0.0007, 0.0007), [])
  const bloom = useRef<BloomEffect>(null!)
  // bloom is strongest in the dark RGB section, where it is the main light
  useFrame(() => { bloom.current.intensity = (mobile ? 0.7 : 1.0) + 0.45 * useSceneStore.getState().dark })
  return (
    <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
      <Bloom ref={bloom} mipmapBlur intensity={mobile ? 0.7 : 1.0} luminanceThreshold={1} luminanceSmoothing={0.15} radius={0.7} />
      {mobile ? <></> : <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />}
      <Vignette offset={0.25} darkness={0.85} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
