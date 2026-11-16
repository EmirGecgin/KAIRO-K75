import { Environment, Lightformer } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { PALETTES } from '../../data/colorways'
import { useSceneStore } from '../../store/useSceneStore'

/**
 * Studio lighting. The Environment is a tiny cubemap built from emissive "softbox" panels
 * (no HDR download), which gives the aluminium case something to reflect.
 * On top: a cool rim light from behind, a soft key from above, and the accent colour from below.
 */
export default function Lights() {
  const accent = PALETTES[useSceneStore((s) => s.colorway)].accent
  // base intensities, scaled down by `dark` (RGB section: only the keys should light the scene)
  const amb = useRef<THREE.AmbientLight>(null!)
  const rim = useRef<THREE.SpotLight>(null!)
  const key = useRef<THREE.SpotLight>(null!)
  const under = useRef<THREE.PointLight>(null!)
  useFrame(({ scene }) => {
    const k = 1 - 0.84 * useSceneStore.getState().dark
    amb.current.intensity = 0.12 * k
    rim.current.intensity = 420 * k
    key.current.intensity = 260 * k
    under.current.intensity = 28 * k
    scene.environmentIntensity = 0.9 * k
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.12} />
      <Environment resolution={128} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={3} position={[0, 6, -6]} scale={[14, 2, 1]} color="#cfd8ff" />
        <Lightformer form="rect" intensity={1.5} position={[-8, 3, 2]} scale={[2, 8, 1]} rotation-y={Math.PI / 2} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[8, 2, 3]} scale={[1.5, 6, 1]} rotation-y={-Math.PI / 2} color={accent} />
        <Lightformer form="ring" intensity={1} position={[0, 8, 4]} scale={6} rotation-x={Math.PI / 2} color="#ffffff" />
      </Environment>
      <spotLight ref={rim} position={[-7, 9, -6]} angle={0.5} penumbra={1} intensity={420} color="#bcd0ff" distance={40} decay={2} />
      <spotLight ref={key} position={[2, 12, 6]} angle={0.6} penumbra={1} intensity={260} color="#ffffff" distance={40} decay={2} />
      <pointLight ref={under} position={[0, -2.5, 3]} intensity={28} color={accent} distance={18} decay={2} />
    </>
  )
}
