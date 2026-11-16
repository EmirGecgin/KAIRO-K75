import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { KEYS, FIELD } from '../../data/layout75'
import { PALETTES } from '../../data/colorways'
import { useSceneStore } from '../../store/useSceneStore'

const SW = 0.74 // switch cut-out size (14mm / 19.05mm)

/** Flat aluminium plate with a square hole for every switch. Shape lives in XY, so y = -z after the rotation. */
export function Plate() {
  const geometry = useMemo(() => {
    const w = FIELD.w + 0.2, d = FIELD.d + 0.2
    const shape = new THREE.Shape()
    shape.moveTo(-w / 2, -d / 2).lineTo(w / 2, -d / 2).lineTo(w / 2, d / 2).lineTo(-w / 2, d / 2).closePath()
    for (const k of KEYS) {
      const hole = new THREE.Path()
      const x = k.cx, y = -k.cz, h = SW / 2
      hole.moveTo(x - h, y - h).lineTo(x + h, y - h).lineTo(x + h, y + h).lineTo(x - h, y + h).closePath()
      shape.holes.push(hole)
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#9b9ba1" metalness={1} roughness={0.38} />
    </mesh>
  )
}

export function Pcb() {
  return (
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[FIELD.w + 0.1, 0.06, FIELD.d + 0.1]} />
      <meshStandardMaterial color="#0f3322" roughness={0.55} metalness={0.2} />
    </mesh>
  )
}

/** Foam strips around the plate edge that give the gasket-mount its bounce. */
export function Gaskets() {
  const strips: [number, number, number, number][] = [
    // x, z, length(x), length(z)
    ...[-5.4, 0, 5.4].flatMap((x): [number, number, number, number][] => [
      [x, -FIELD.d / 2 - 0.05, 3, 0.14], [x, FIELD.d / 2 + 0.05, 3, 0.14],
    ]),
    [-FIELD.w / 2 - 0.05, 0, 0.14, 2.4], [FIELD.w / 2 + 0.05, 0, 0.14, 2.4],
  ]
  return (
    <>
      {strips.map(([x, z, lx, lz], i) => (
        <mesh key={i} position={[x, 0.06, z]}>
          <boxGeometry args={[lx, 0.12, lz]} />
          <meshStandardMaterial color="#b6ff3b" roughness={0.9} />
        </mesh>
      ))}
    </>
  )
}

/** Switch housings + stems: two instanced meshes, one instance per key. */
export function Switches() {
  const housing = useRef<THREE.InstancedMesh>(null!)
  const stem = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    KEYS.forEach((k, i) => {
      housing.current.setMatrixAt(i, m.setPosition(k.cx, 0.2, k.cz))
      stem.current.setMatrixAt(i, m.setPosition(k.cx, 0.5, k.cz))
    })
    housing.current.instanceMatrix.needsUpdate = true
    stem.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <>
      <instancedMesh ref={housing} args={[undefined, undefined, KEYS.length]} frustumCulled={false}>
        <boxGeometry args={[0.68, 0.4, 0.68]} />
        <meshStandardMaterial color="#2c2c31" roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={stem} args={[undefined, undefined, KEYS.length]} frustumCulled={false}>
        <boxGeometry args={[0.2, 0.26, 0.2]} />
        <meshStandardMaterial color="#e8e8ea" roughness={0.3} />
      </instancedMesh>
    </>
  )
}

/** Milled case: base slab + rounded frame ring. Material follows the active colorway. */
export function Case() {
  const colorway = useSceneStore((s) => s.colorway)
  const { slab, frame } = useMemo(() => {
    const rr = (w: number, d: number, r: number) => {
      const s = new THREE.Shape(), x = -w / 2, y = -d / 2
      s.moveTo(x + r, y).lineTo(x + w - r, y).quadraticCurveTo(x + w, y, x + w, y + r)
        .lineTo(x + w, y + d - r).quadraticCurveTo(x + w, y + d, x + w - r, y + d)
        .lineTo(x + r, y + d).quadraticCurveTo(x, y + d, x, y + d - r)
        .lineTo(x, y + r).quadraticCurveTo(x, y, x + r, y)
      return s
    }
    const ow = FIELD.w + 0.9, od = FIELD.d + 0.9
    const outer = rr(ow, od, 0.45)
    const slab = new THREE.ExtrudeGeometry(outer, { depth: 0.2, bevelEnabled: false })
    slab.rotateX(-Math.PI / 2)
    const ring = rr(ow, od, 0.45)
    ring.holes.push(rr(FIELD.w + 0.3, FIELD.d + 0.3, 0.12))
    const frame = new THREE.ExtrudeGeometry(ring, {
      depth: 0.8, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2,
    })
    frame.rotateX(-Math.PI / 2)
    frame.translate(0, 0.2, 0)
    return { slab, frame }
  }, [])
  const mats = useRef<THREE.MeshStandardMaterial[]>([])
  const target = useMemo(() => new THREE.Color(), [])
  const initial = useMemo(() => PALETTES[useSceneStore.getState().colorway].case, [])
  // ease the case colour toward the active colourway instead of snapping
  useFrame((_, dt) => {
    target.set(PALETTES[colorway].case)
    for (const m of mats.current) if (m) m.color.lerp(target, 1 - Math.exp(-4 * dt))
  })
  const reg = (i: number) => (m: THREE.MeshStandardMaterial | null) => { if (m) mats.current[i] = m }
  return (
    <>
      <mesh geometry={slab}><meshStandardMaterial ref={reg(0)} color={initial} metalness={0.8} roughness={0.42} /></mesh>
      <mesh geometry={frame}><meshStandardMaterial ref={reg(1)} color={initial} metalness={0.8} roughness={0.42} /></mesh>
    </>
  )
}
