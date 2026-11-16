import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '../../store/useSceneStore'
import { layerAnchors } from '../../store/layerAnchors'
import Keycaps from './Keycaps'
import { Case, Gaskets, Pcb, Plate, Switches } from './Internals'

/**
 * Each layer is its own <group> so the Exploded section can move them independently.
 * base   = resting height when stacked
 * spread = how far (units) it rises at full explosion
 * order  = reading order on screen (0 = top layer, leaves first) and label index
 * side   = which edge its label hangs from (+1 right / -1 left)
 */
const LAYERS = [
  { id: 'case', base: 0, spread: 0, order: 5, side: -1 },
  { id: 'pcb', base: 0.3, spread: 1.3, order: 4, side: 1 },
  { id: 'gaskets', base: 0.45, spread: 2.6, order: 3, side: -1 },
  { id: 'plate', base: 0.62, spread: 3.9, order: 2, side: 1 },
  { id: 'switches', base: 0.72, spread: 5.3, order: 1, side: -1 },
  { id: 'keycaps', base: 1.15, spread: 7.0, order: 0, side: 1 },
] as const

const smooth = (t: number) => t * t * (3 - 2 * t)
const v = new THREE.Vector3()

export default function Keyboard() {
  const refs = useRef<Record<string, THREE.Group | null>>({})
  const current = useRef(0)

  useFrame(({ camera, size }, dt) => {
    // tiny damp just to take the edge off scroll steps
    current.current = THREE.MathUtils.damp(current.current, useSceneStore.getState().explode, 14, dt)
    const e = current.current
    camera.updateMatrixWorld()

    for (const l of LAYERS) {
      const g = refs.current[l.id]
      if (!g) continue
      // Staggered: the top layer starts at e=0, each one below starts 0.1 later and travels over 0.5 of the range.
      // At e=1 every layer has finished (5*0.1 + 0.5 = 1), so they leave one after another, top → bottom.
      const local = smooth(THREE.MathUtils.clamp((e - 0.1 * l.order) / 0.5, 0, 1))
      g.position.y = l.base + l.spread * local

      // project the layer's edge to screen pixels so the HTML label can hang from it
      g.updateWorldMatrix(true, false)
      v.set(l.side * 8.7, 0.15, 0)
      g.localToWorld(v).project(camera)
      const a = layerAnchors[l.order]
      a.x = (v.x * 0.5 + 0.5) * size.width
      a.y = (-v.y * 0.5 + 0.5) * size.height
      a.open = local
    }
  })

  const set = (id: string) => (g: THREE.Group | null) => { refs.current[id] = g }
  return (
    <group>
      <group ref={set('case')}><Case /></group>
      <group ref={set('pcb')}><Pcb /></group>
      <group ref={set('gaskets')}><Gaskets /></group>
      <group ref={set('plate')}><Plate /></group>
      <group ref={set('switches')}><Switches /></group>
      <group ref={set('keycaps')}><Keycaps /></group>
    </group>
  )
}
