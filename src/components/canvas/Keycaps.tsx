import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { KEYS, type KeyData } from '../../data/layout75'
import { PALETTES } from '../../data/colorways'
import { useSceneStore } from '../../store/useSceneStore'
import { addEmissiveAttribute, createGlowMaterial } from './glowMaterial'
import { playClick } from '../../lib/clickSound'

const PRESS_DEPTH = 0.17 // how far a cap sinks (units)

/** The character a tapped 3D key types (physical keys use e.key instead). */
const charFor = (k: KeyData) =>
  k.code === 'Space' ? ' ' : k.code === 'Backspace' || k.code === 'Enter' ? k.code : k.label.length === 1 ? k.label.toLowerCase() : ''

const GAP = 0.07 // visible gap between neighbouring caps
const H = 0.55
export const KEY_Y = 0.3 // cap centre inside the keycaps group

/** One rounded cap, narrowed toward the top like a real (cherry-profile) keycap. */
function makeCapGeometry(w: number) {
  const geo = new RoundedBoxGeometry(w - GAP, H, 1 - GAP, 4, 0.09)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) + H / 2) / H // 0 bottom → 1 top
    const s = 1 - 0.13 * k
    pos.setX(i, pos.getX(i) * (w > 2 ? 1 - 0.03 * k : s))
    pos.setZ(i, pos.getZ(i) * s)
  }
  return geo
}

function CapGroup({ keys, w, material }: { keys: KeyData[]; w: number; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const colorway = useSceneStore((s) => s.colorway)
  const n = keys.length
  const geometry = useMemo(() => {
    const g = makeCapGeometry(w)
    addEmissiveAttribute(g, n)
    return g
  }, [w, n])

  // per-key animation state (plain typed arrays: no allocations inside the frame loop)
  const sim = useMemo(() => {
    const c = new THREE.Color(useSceneStore.getState().rgbColor)
    const rgb = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { rgb[i * 3] = c.r; rgb[i * 3 + 1] = c.g; rgb[i * 3 + 2] = c.b }
    return { travel: new Float32Array(n), glow: new Float32Array(n), rgb, target: new THREE.Color(), tmp: new THREE.Color(), accent: new THREE.Color(), seenPick: 0, colorTgt: new Float32Array(n * 3), fading: false }
  }, [n])

  const first = useRef(true)
  useLayoutEffect(() => {
    const mesh = ref.current
    const pal = PALETTES[colorway]
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    keys.forEach((k, i) => {
      mesh.setMatrixAt(i, m.setPosition(k.cx, KEY_Y, k.cz))
      c.set(k.kind === 'accent' ? pal.accent : k.kind === 'mod' ? pal.mod : pal.keycap)
      sim.colorTgt[i * 3] = c.r; sim.colorTgt[i * 3 + 1] = c.g; sim.colorTgt[i * 3 + 2] = c.b
      if (first.current) mesh.setColorAt(i, c) // first mount: paint immediately (also creates the instanceColor buffer)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (first.current) { mesh.instanceColor!.needsUpdate = true; first.current = false }
    else sim.fading = true // colourway changed: the frame loop eases every cap toward its new colour
  }, [keys, colorway, sim])

  /**
   * Per frame, per key: sink depth (typing), glow (typing afterglow) and RGB colour.
   * Emissive = rgb * power * 0.3  +  accent * pressGlow * 2.4. Values above 1 are "HDR", so Bloom turns them into light.
   * The loop sleeps completely when nothing is pressed and RGB is off.
   */
  useFrame(({ clock }, dt) => {
    if (sim.fading) {
      const arr = ref.current.instanceColor!.array as Float32Array
      const r = 1 - Math.exp(-4 * dt)
      let diff = 0
      for (let i = 0; i < arr.length; i++) {
        const d = sim.colorTgt[i] - arr[i]
        arr[i] += d * r
        diff = Math.max(diff, Math.abs(d))
      }
      if (diff < 0.002) { arr.set(sim.colorTgt); sim.fading = false }
      ref.current.instanceColor!.needsUpdate = true
    }
    const s = useSceneStore.getState()
    // read the attribute from the geometry actually in use (a ref filled inside useMemo would break under StrictMode's double-invoke)
    const emissive = geometry.getAttribute('aEmissive') as THREE.InstancedBufferAttribute
    const { travel, glow, rgb, target, tmp, accent } = sim
    const power = s.rgbPower
    const pressed = s.pressedKeys
    let residual = 0
    for (let i = 0; i < n; i++) residual = Math.max(residual, travel[i], glow[i])
    if (pressed.size === 0 && power < 0.002 && residual < 0.002) {
      if (sim.seenPick !== -1) { // one last clear so nothing stays lit
        emissive.array.fill(0); emissive.needsUpdate = true; sim.seenPick = -1
      }
      return
    }
    sim.seenPick = 0

    const now = performance.now() / 1000
    const wave = s.rgbMode === 'wave'
    target.set(s.rgbColor)
    accent.set(PALETTES[s.colorway].accent)
    const em = emissive.array as Float32Array
    const m = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      const k = keys[i]
      const down = pressed.has(k.code) ? 1 : 0
      travel[i] = THREE.MathUtils.damp(travel[i], down, 40, dt)
      glow[i] = THREE.MathUtils.damp(glow[i], down, down ? 30 : 3, dt) // quick on, slow fade = afterglow

      if (wave) {
        // continuous rainbow travelling left → right
        tmp.setHSL(((clock.elapsedTime * 0.12 + k.t * 0.9 + k.row * 0.03) % 1 + 1) % 1, 1, 0.5)
        rgb[i * 3] = tmp.r; rgb[i * 3 + 1] = tmp.g; rgb[i * 3 + 2] = tmp.b
      } else if (now - s.rgbPickT >= k.t * 0.6 + k.row * 0.04) {
        // a new pick reaches each key after a delay proportional to its x → the colour sweeps across the board
        const r = 1 - Math.exp(-9 * dt)
        rgb[i * 3] += (target.r - rgb[i * 3]) * r
        rgb[i * 3 + 1] += (target.g - rgb[i * 3 + 1]) * r
        rgb[i * 3 + 2] += (target.b - rgb[i * 3 + 2]) * r
      }
      const pr = power * 0.3, pg = glow[i] * 2.4
      em[i * 3] = rgb[i * 3] * pr + accent.r * pg
      em[i * 3 + 1] = rgb[i * 3 + 1] * pr + accent.g * pg
      em[i * 3 + 2] = rgb[i * 3 + 2] * pr + accent.b * pg
      ref.current.setMatrixAt(i, m.setPosition(k.cx, KEY_Y - PRESS_DEPTH * travel[i], k.cz))
    }
    emissive.needsUpdate = true
    ref.current.instanceMatrix.needsUpdate = true
  })

  // Touch / mouse: tapping a 3D cap presses it (the section overlay is pointer-events:none so these reach the canvas)
  const press = (e: ThreeEvent<PointerEvent>) => {
    const s = useSceneStore.getState()
    if (!s.typeActive || e.instanceId === undefined) return
    e.stopPropagation()
    const k = keys[e.instanceId]
    s.pressKey(k.code)
    s.typeChar(charFor(k))
    if (s.soundOn) playClick()
  }
  const release = (e: ThreeEvent<PointerEvent>) => {
    if (e.instanceId !== undefined) useSceneStore.getState().releaseKey(keys[e.instanceId].code)
  }

  // frustumCulled off: the auto bounding sphere only covers the base geometry at the origin
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, n]}
      frustumCulled={false}
      onPointerDown={press}
      onPointerUp={release}
      onPointerOut={release}
    />
  )
}

export default function Keycaps() {
  const material = useMemo(() => createGlowMaterial({ roughness: 0.48, metalness: 0 }), [])
  // Caps are instanced per width class: one draw call each, no distorted corners from non-uniform scaling.
  const groups = useMemo(() => {
    const map = new Map<number, KeyData[]>()
    for (const k of KEYS) map.set(k.w, [...(map.get(k.w) ?? []), k])
    return [...map.entries()]
  }, [])
  return (
    <>
      {groups.map(([w, keys]) => (
        <CapGroup key={w} w={w} keys={keys} material={material} />
      ))}
    </>
  )
}
