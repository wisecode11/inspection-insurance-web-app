import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

import { buildIcon, disposeIconMaterials, ICON_KEYS, type IconKey } from "@/components/marketing/three/icon-models"

/**
 * One WebGL renderer for every 3D icon on the page. Each frame it renders each
 * icon model once and copies the pixels into that icon's plain 2D canvases,
 * so dozens of icons cost a single WebGL context. Rendering stops while no
 * icon is on screen or the tab is hidden; under prefers-reduced-motion each
 * icon is drawn once, at rest.
 */

type Target = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  key: IconKey
  visible: boolean
}

type Engine = {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  envMap: THREE.Texture
  scenes: Map<IconKey, { scene: THREE.Scene; icon: THREE.Group }>
  io: IntersectionObserver
  raf: number
  start: number
}

const targets = new Set<Target>()
let engine: Engine | null = null
let teardownTimer = 0
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

function createEngine(): Engine {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" })
  renderer.setPixelRatio(1)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9

  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envMap = pmrem.fromScene(room, 0.04).texture
  pmrem.dispose()
  room.traverse((o) => (o as THREE.Mesh).geometry?.dispose())

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20)
  camera.position.set(0, 0, 4.5)

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      for (const t of targets) if (t.canvas === entry.target) t.visible = entry.isIntersecting
    }
    syncLoop()
  })

  return { renderer, camera, envMap, scenes: new Map(), io, raf: 0, start: performance.now() }
}

function sceneFor(e: Engine, key: IconKey) {
  let entry = e.scenes.get(key)
  if (!entry) {
    const scene = new THREE.Scene()
    scene.environment = e.envMap
    scene.environmentIntensity = 0.65
    const light = new THREE.DirectionalLight(0xffffff, 1.4)
    light.position.set(2, 3, 4)
    scene.add(light)
    const icon = buildIcon(key)
    scene.add(icon)
    entry = { scene, icon }
    e.scenes.set(key, entry)
  }
  return entry
}

/** Pose for an icon at time t: a slow sway and bob, offset per icon so they don't move in lockstep. */
function pose(icon: THREE.Group, key: IconKey, t: number) {
  const phase = ICON_KEYS.indexOf(key) * 0.9
  icon.rotation.y = -0.42 + Math.sin(t * 0.9 + phase) * 0.28
  icon.rotation.x = 0.28 + Math.sin(t * 0.7 + phase) * 0.08
  icon.position.y = Math.sin(t * 1.3 + phase) * 0.05
}

function draw(e: Engine, list: Target[], t: number) {
  // Group by model AND pixel size, so a large icon is never an upscaled small render.
  const groups = new Map<string, Target[]>()
  for (const target of list) {
    const id = `${target.key}:${target.canvas.width}`
    groups.set(id, [...(groups.get(id) ?? []), target])
  }

  for (const group of groups.values()) {
    const key = group[0].key
    const size = group[0].canvas.width
    if (e.renderer.domElement.width !== size) e.renderer.setSize(size, size, false)
    const { scene, icon } = sceneFor(e, key)
    pose(icon, key, t)
    e.renderer.render(scene, e.camera)
    for (const target of group) {
      target.ctx.clearRect(0, 0, target.canvas.width, target.canvas.height)
      target.ctx.drawImage(e.renderer.domElement, 0, 0, target.canvas.width, target.canvas.height)
    }
  }
}

function tick() {
  if (!engine) return
  const visible = [...targets].filter((t) => t.visible)
  draw(engine, visible, (performance.now() - engine.start) / 1000)
  engine.raf = requestAnimationFrame(tick)
}

function syncLoop() {
  if (!engine || reduceMotion()) return
  const shouldRun = !document.hidden && [...targets].some((t) => t.visible)
  if (shouldRun && !engine.raf) engine.raf = requestAnimationFrame(tick)
  else if (!shouldRun && engine.raf) {
    cancelAnimationFrame(engine.raf)
    engine.raf = 0
  }
}

function teardown() {
  if (!engine) return
  cancelAnimationFrame(engine.raf)
  engine.io.disconnect()
  document.removeEventListener("visibilitychange", syncLoop)
  for (const { scene } of engine.scenes.values()) scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose())
  disposeIconMaterials()
  engine.envMap.dispose()
  engine.renderer.dispose()
  engine.renderer.forceContextLoss()
  engine = null
}

/** Starts drawing `key` into `canvas`. Returns an unregister function. Throws if WebGL is unavailable. */
export function registerIcon(canvas: HTMLCanvasElement, key: IconKey) {
  window.clearTimeout(teardownTimer)
  if (!engine) {
    engine = createEngine()
    document.addEventListener("visibilitychange", syncLoop)
  }
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("2D canvas unavailable")

  const target: Target = { canvas, ctx, key, visible: true }
  targets.add(target)
  engine.io.observe(canvas)

  // First frame immediately (and the only one under reduced motion).
  draw(engine, [target], 0)
  syncLoop()

  return () => {
    targets.delete(target)
    engine?.io.unobserve(canvas)
    syncLoop()
    // Defer teardown so quick remounts (navigation, StrictMode) reuse the engine.
    if (targets.size === 0) teardownTimer = window.setTimeout(teardown, 2000)
  }
}
