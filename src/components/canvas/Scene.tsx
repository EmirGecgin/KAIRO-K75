import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Keyboard from './Keyboard'
import Lights from './Lights'
import Effects from './Effects'
import { PALETTES } from '../../data/colorways'
import { useSceneStore } from '../../store/useSceneStore'
import { gpuTier } from '../../lib/gpuTier'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Radial accent-colour gradient used as the soft reflection pool under the keyboard. */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.45, 'rgba(255,255,255,0.23)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

/**
 * Everything that moves the keyboard as a whole: idle float ("breathing") + mouse tilt.
 * Later sections (exploded view, etc.) will drive this rig from scroll instead.
 */
function Rig() {
  const intro = useRef<THREE.Group>(null!)
  const introT = useRef(0)
  const hideT = useRef(0)
  const rig = useRef<THREE.Group>(null!)
  const mouse = useRef({ x: 0, y: 0 })
  const reduced = useMemo(reduceMotion, [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1 // -1..1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useFrame((state, dt) => {
    // intro: once the preloader opens, the board rises from below while turning into place
    const target = reduced || useSceneStore.getState().loaded ? 1 : 0
    introT.current = THREE.MathUtils.damp(introT.current, target, 1.8, dt)
    const k = 1 - introT.current
    // hide: Switches/Specs sections own the screen, the board sinks out of frame (and stops rendering once gone)
    hideT.current = THREE.MathUtils.damp(hideT.current, useSceneStore.getState().hide, 5, dt)
    intro.current.position.y = -5 * k - 14 * hideT.current
    const gone = hideT.current > 0.98
    intro.current.visible = !gone
    // tell <Scene> it may stop the render loop (nothing is visible); it resumes by itself when `hide` drops
    if (gone !== useSceneStore.getState().stageHidden) useSceneStore.setState({ stageHidden: gone })
    intro.current.rotation.y = 0.9 * k
    intro.current.scale.setScalar(1 - 0.25 * k)

    const g = rig.current
    const t = reduced ? 0 : state.clock.elapsedTime
    // damp() is a frame-rate independent lerp: same feel at 60Hz and 144Hz
    const tiltX = reduced ? 0 : mouse.current.y * 0.12
    const tiltZ = reduced ? 0 : -mouse.current.x * 0.05
    const yaw = reduced ? 0 : mouse.current.x * 0.22
    // h = how much of the "hero pose" is left. pose 1 (flat) removes tilt, float and yaw
    const { pose, thunk } = useSceneStore.getState()
    const h = 1 - pose
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, (0.08 + tiltX) * h, 3, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (-0.25 + yaw) * h, 3, dt)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, tiltZ * h, 3, dt)
    g.position.y = (Math.sin(t * 0.9) * 0.18 + 2.1) * h - 0.22 * thunk
  })

  return (
    <group ref={intro}>
      <group ref={rig}>
        <Keyboard />
      </group>
    </group>
  )
}

/**
 * The camera is a pure function of three scroll-driven numbers, recomputed every frame:
 *  pose  (0→1) hero view → flat studio view (a bit further back, a bit lower)
 *  explode (0→1) pull back and rise so the whole stack of layers fits
 *  orbit (0→1) swing around the board (angle goes +0.25 → -0.35 rad)
 * k widens the distance on portrait screens so the 16u-wide board always fits.
 */
function CameraRig() {
  useFrame(({ camera, size }) => {
    const { pose: p, explode: e, orbit: o, shiftY } = useSceneStore.getState()
    const aspect = size.width / size.height
    const k = Math.max(1, 1.7 / aspect)
    // Room for labels: each side needs margin + label width + leader line. The board may only use what is left (f),
    // otherwise labels would run off-screen. 25.4 = 16u / (2·tan(fov/2)), so dist = 25.4 / (aspect·f) gives board width = f·viewport.
    const vw = size.width
    const reserve = vw < 768 ? 12 + 77 + 30 : Math.max(24, vw * 0.04) + 240 + 56
    const f = THREE.MathUtils.clamp(1 - (2 * reserve) / vw, 0.4, 1)
    const base = (19 + 3 * p) * k
    const target = Math.max(base + 7 * k, 25.4 / (aspect * f))
    const dist = THREE.MathUtils.lerp(base, target, e)
    const lookY = 0.4 * (1 - p) + 4.2 * e + shiftY
    // constant-ish elevation angle (hero ≈ 24°, studio ≈ 17°) → the view keeps its shape however far we pull back
    const height = lookY + dist * Math.tan(THREE.MathUtils.lerp(0.42, 0.3, p) + 0.12 * e)
    // at pose 1 / orbit 0 the camera angle (+0.25) cancels the hero's rig yaw (-0.25): no visual jump
    const angle = p * THREE.MathUtils.lerp(0.25, -0.35, o)
    camera.position.set(Math.sin(angle) * dist, height, Math.cos(angle) * dist)
    camera.lookAt(0, lookY, 0)
  })
  return null
}

/** Soft reflection pool under the board. Tinted by the accent normally, by the live RGB colour in the dark RGB section. */
function GroundGlow() {
  const map = useGlowTexture()
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const target = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }, dt) => {
    const s = useSceneStore.getState()
    if (s.rgbPower > 0.01) {
      if (s.rgbMode === 'wave') target.setHSL((clock.elapsedTime * 0.12) % 1, 1, 0.5)
      else target.set(s.rgbColor)
    } else target.set(PALETTES[s.colorway].accent)
    mat.current.color.lerp(target, 1 - Math.exp(-5 * dt))
    mat.current.opacity = (0.26 + 0.55 * s.rgbPower) * (1 - s.hide)
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -2.2, 0.5]}>
      <planeGeometry args={[30, 18]} />
      <meshBasicMaterial ref={mat} map={map} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/**
 * Compiles every shader program asynchronously (KHR_parallel_shader_compile) before the first frame, so the main thread is not
 * blocked by one long synchronous compile. The render loop stays asleep until this resolves.
 */
function Precompile({ onDone }: { onDone: () => void }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let live = true
    const done = () => { if (live) onDone() }
    gl.compileAsync(scene, camera).then(done, done)
    return () => { live = false }
  }, [gl, scene, camera, onDone])
  return null
}

/** Background colour follows the colourway (smoothly) and sinks toward black as `dark` rises. */
function Atmosphere() {
  const target = useMemo(() => new THREE.Color(), [])
  useFrame(({ scene }, dt) => {
    const s = useSceneStore.getState()
    target.set(PALETTES[s.colorway].bg).multiplyScalar(1 - 0.85 * s.dark)
    ;(scene.background as THREE.Color).lerp(target, 1 - Math.exp(-6 * dt))
  })
  return <color attach="background" args={[PALETTES.arctic.bg]} />
}

export default function Scene() {
  // Render loop sleeps while the board is off-stage (Switches / Specs / CTA). `hide > 0.9` guards the resume: the Rig can only
  // un-set stageHidden while frames are running, so the store's `hide` value is what wakes us up.
  const paused = useSceneStore((s) => s.stageHidden && s.hide > 0.9)
  const tier = useMemo(gpuTier, [])
  const maxDpr = tier === 'high' ? 1.75 : tier === 'mid' ? 1.5 : 1
  // adaptive quality: if the frame rate sags, drop to 1x pixel ratio and cheap effects; recover when it is healthy again
  const [dpr, setDpr] = useState(maxDpr)
  const [ready, setReady] = useState(false)
  const onCompiled = useCallback(() => setReady(true), [])
  const [lite, setLite] = useState(tier !== 'high')
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={dpr}
        frameloop={paused || !ready ? 'never' : 'always'}
        camera={{ fov: 35, near: 1, far: 500, position: [0, 8.5, 19] }}
        // with post-processing the ToneMapping effect runs last; without it (low tier) the renderer must tone-map itself
        gl={{ antialias: false, toneMapping: tier === 'low' ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping, powerPreference: 'high-performance' }}
      >
        {tier !== 'low' && (
          <PerformanceMonitor
            flipflops={3}
            onDecline={() => { setDpr(1); setLite(true) }}
            onIncline={() => { setDpr(maxDpr); setLite(tier !== 'high') }}
            onFallback={() => { setDpr(1); setLite(true) }}
          />
        )}
        <Precompile onDone={onCompiled} />
        <Atmosphere />
        <CameraRig />
        <Lights />
        <Rig />
        <GroundGlow />
        {tier !== 'low' && <Effects lite={lite} />}
      </Canvas>
    </div>
  )
}
