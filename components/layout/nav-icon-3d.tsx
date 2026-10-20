"use client"

import * as React from "react"
import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

/* =========================================================
   Three.js nav icons.
   One shared WebGLRenderer draws every icon into its own small
   2D canvas (browsers cap WebGL contexts, so no per-icon renderer).
   Icons render once, then only animate while hovered / settling.
   ========================================================= */

export type NavIcon3DKind =
  | "dashboard"
  | "briefcase"
  | "team"
  | "sliders"
  | "bars"
  | "gear"
  | "clipboard"
  | "building"
  | "card"
  | "palette"
  | "book"
  | "document"
  | "language"

/**
 * Natural, real-world colours for each object (leather briefcase, steel gear, paper,
 * glass…), the same on the green header and on white menus.
 */
const C = {
  white: "#F9FAFB",
  paper: "#FFFDF7",
  cream: "#F6EBD3",
  lightGrey: "#E5E7EB",
  grey: "#9CA3AF",
  steel: "#B8BEC8",
  darkSteel: "#6B7280",
  ink: "#1F2937",
  blue: "#3B82F6",
  navy: "#1E3A8A",
  sky: "#7DD3FC",
  amber: "#F59E0B",
  gold: "#D9A441",
  red: "#EF4444",
  maroon: "#9F1D1D",
  purple: "#8B5CF6",
  rose: "#F43F5E",
  leather: "#8B5A2B",
  darkLeather: "#5C3A1E",
  wood: "#C9965F",
  brick: "#B5533C",
  stone: "#D6D3D1",
  skinLight: "#F1C27D",
  skinDark: "#C68642",
  orange: "#EA580C",
}

function mat(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.05 })
}

/** Brushed-metal look for clasps, clips, rails and the gear. */
function metal(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.55 })
}

function box(w: number, h: number, d: number, r: number, material: THREE.Material | string) {
  return new THREE.Mesh(
    new RoundedBoxGeometry(w, h, d, 4, r),
    typeof material === "string" ? mat(material) : material,
  )
}

/* ---------- Icon models (each fits roughly in a 2×2 unit square) ---------- */

function buildIcon(kind: NavIcon3DKind): THREE.Group {
  const g = new THREE.Group()

  switch (kind) {
    case "dashboard": {
      const tiles: [number, number, string][] = [
    [-0.46,  0.46, "#3B82F6"],
    [ 0.46,  0.46, "#60A5FA"],
    [-0.46, -0.46, "#2563EB"],
    [ 0.46, -0.46, "#93C5FD"],
  ]
      for (const [x, y, c] of tiles) {
        const t = box(0.82, 0.82, 0.3, 0.13, c)
        t.position.set(x, y, 0)
        g.add(t)
      }
      break
    }

    case "briefcase": {
      const body = box(1.9, 1.3, 0.62, 0.18, C.leather)
      body.position.y = -0.2
      const band = box(1.92, 0.14, 0.64, 0.05, C.darkLeather)
      const clasp = box(0.34, 0.26, 0.7, 0.06, metal(C.gold))
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 12, 28, Math.PI), mat(C.darkLeather))
      handle.position.y = 0.45
      g.add(body, band, clasp, handle)
      break
    }

    case "team": {
      const person = (x: number, z: number, scale: number, skin: string, shirt: string) => {
        const p = new THREE.Group()
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), mat(skin))
        head.position.y = 0.5
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.28, 6, 16), mat(shirt))
        torso.position.y = -0.42
        p.add(head, torso)
        p.position.set(x, 0, z)
        p.scale.setScalar(scale)
        return p
      }
      g.add(
        person(0.48, -0.35, 0.86, C.skinDark, C.blue),
        person(-0.3, 0.1, 1, C.skinLight, C.blue),
      )
      break
    }

    case "sliders": {
      const rows: [number, number, string][] = [
        [0.62, -0.38, C.red],
        [0, 0.42, C.blue],
        [-0.62, -0.08, C.amber],
      ]
      for (const [y, knobX, c] of rows) {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 12), metal(C.steel))
        rail.rotation.z = Math.PI / 2
        rail.position.y = y
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 24), mat(c))
        knob.rotation.x = Math.PI / 2
        knob.position.set(knobX, y, 0.05)
        g.add(rail, knob)
      }
      break
    }

    case "bars": {
      const base = box(1.95, 0.14, 0.72, 0.06, C.lightGrey)
      base.position.y = -0.86
      g.add(base)
      const bars: [number, number, string][] = [
        [-0.58, 0.72, C.amber],
        [0, 1.18, C.blue],
        [0.58, 1.62, C.purple],
      ]
      for (const [x, h, c] of bars) {
        const b = box(0.44, h, 0.44, 0.1, c)
        b.position.set(x, -0.79 + h / 2, 0)
        g.add(b)
      }
      break
    }

    case "gear": {
      const shape = new THREE.Shape()
      const teeth = 8
      const outer = 0.98
      const inner = 0.76
      for (let i = 0; i < teeth * 4; i++) {
        // tooth top (2 points) then valley (2 points)
        const a = (i / (teeth * 4)) * Math.PI * 2
        const r = i % 4 < 2 ? outer : inner
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      }
      shape.closePath()
      const hole = new THREE.Path()
      hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true)
      shape.holes.push(hole)
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.32,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.05,
        bevelSegments: 3,
        curveSegments: 24,
      })
      geo.center()
      const gear = new THREE.Mesh(geo, metal(C.steel))
      const hub = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 10, 32), metal(C.darkSteel))
      hub.position.z = 0.2
      g.add(gear, hub)
      break
    }

    case "clipboard": {
      const board = box(1.5, 1.95, 0.2, 0.14, C.wood)
      const paper = box(1.22, 1.55, 0.06, 0.04, C.paper)
      paper.position.set(0, -0.1, 0.12)
      const clip = box(0.72, 0.3, 0.32, 0.1, metal(C.steel))
      clip.position.set(0, 0.92, 0.04)
      g.add(board, paper, clip)
      for (const [y, w] of [[0.35, 0.86], [0.02, 0.86], [-0.31, 0.6]] as const) {
        const line = box(w, 0.1, 0.06, 0.03, C.grey)
        line.position.set((w - 0.86) / 2, y, 0.17)
        g.add(line)
      }
      break
    }

    case "building": {
      const tower = box(1.05, 1.95, 0.9, 0.08, C.stone)
      tower.position.x = -0.32
      const wing = box(0.78, 1.15, 0.9, 0.08, C.brick)
      wing.position.set(0.6, -0.4, 0)
      g.add(tower, wing)
      for (const col of [-0.55, -0.1]) {
        for (const row of [0.6, 0.15, -0.3]) {
          const win = box(0.26, 0.24, 0.06, 0.03, C.sky)
          win.position.set(col + 0.01, row, 0.46)
          g.add(win)
        }
      }
      const door = box(0.32, 0.46, 0.06, 0.03, C.darkLeather)
      door.position.set(-0.32, -0.75, 0.46)
      g.add(door)
      break
    }

    case "card": {
      const body = box(2, 1.3, 0.14, 0.13, C.navy)
      const stripe = box(2.02, 0.24, 0.17, 0.02, C.ink)
      stripe.position.y = 0.3
      const chip = box(0.4, 0.3, 0.18, 0.05, metal(C.gold))
      chip.position.set(-0.55, -0.18, 0)
      const digits = box(0.7, 0.09, 0.17, 0.03, C.lightGrey)
      digits.position.set(0.35, -0.4, 0)
      g.add(body, stripe, chip, digits)
      break
    }

    case "palette": {
      const shape = new THREE.Shape()
      shape.absellipse(0, 0, 1.0, 0.86, 0, Math.PI * 2, false, 0)
      const thumb = new THREE.Path()
      thumb.absarc(0.42, -0.36, 0.18, 0, Math.PI * 2, true)
      shape.holes.push(thumb)
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.18,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3,
        curveSegments: 32,
      })
      geo.center()
      g.add(new THREE.Mesh(geo, mat(C.wood)))
      const dots: [number, number, string][] = [
        [-0.5, 0.25, C.red],
        [-0.05, 0.5, C.amber],
        [0.45, 0.3, C.blue],
        [-0.42, -0.3, C.purple],
      ]
      for (const [x, y, c] of dots) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14), mat(c))
        dot.scale.z = 0.55
        dot.position.set(x, y, 0.16)
        g.add(dot)
      }
      break
    }

    case "book": {
      const pages = box(1.4, 1.82, 0.36, 0.04, C.cream)
      pages.position.x = 0.04
      const front = box(1.5, 1.95, 0.08, 0.05, C.maroon)
      front.position.z = 0.22
      const back = box(1.5, 1.95, 0.08, 0.05, C.maroon)
      back.position.z = -0.22
      const spine = box(0.14, 1.95, 0.52, 0.05, "#6B1414")
      spine.position.x = -0.72
      const label = box(0.8, 0.22, 0.04, 0.03, metal(C.gold))
      label.position.set(0.05, 0.45, 0.27)
      g.add(pages, front, back, spine, label)
      break
    }

    case "document": {
      const page = box(1.45, 1.92, 0.16, 0.1, C.white)
      const corner = box(0.42, 0.42, 0.18, 0.06, C.lightGrey)
      corner.position.set(0.52, 0.76, 0.02)
      g.add(page, corner)
      for (const [y, w, c] of [
        [0.25, 0.95, C.blue],
        [-0.05, 0.95, C.grey],
        [-0.35, 0.95, C.grey],
        [-0.65, 0.6, C.grey],
      ] as const) {
        const line = box(w, 0.11, 0.05, 0.03, c)
        line.position.set(-0.12 - (0.95 - w) / 2, y, 0.1)
        g.add(line)
      }
      break
    }

    case "language": {
      const back = box(1.25, 0.88, 0.26, 0.2, C.lightGrey)
      back.position.set(0.38, -0.42, -0.25)
      const front = box(1.45, 1.0, 0.3, 0.22, C.blue)
      front.position.set(-0.22, 0.3, 0.05)
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.36, 4), mat(C.blue))
      tail.rotation.z = Math.PI * 0.82
      tail.position.set(-0.62, -0.28, 0.05)
      g.add(back, front, tail)
      for (const x of [-0.6, -0.22, 0.16]) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat(C.white))
        dot.position.set(x, 0.3, 0.22)
        g.add(dot)
      }
      break
    }
  }

  return g
}

/* ---------- Shared renderer ---------- */

type Entry = {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  group: THREE.Group
  hovered: boolean
  hoverAmt: number
  spin: number
  dirty: boolean
}

const BASE_ROT = { x: -0.38, y: 0.55 }

class NavIconRenderer {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  private entries = new Set<Entry>()
  private raf = 0
  private last = 0
  private size = 0
  readonly reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
    this.renderer.setPixelRatio(1)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.camera.position.set(0, 0, 6.2)
    // Neutral lighting so objects keep their natural colours (no green cast).
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f98, 1.5))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(2.5, 3.5, 4)
    const rim = new THREE.DirectionalLight(0xfff4e6, 0.9)
    rim.position.set(-3, -1, -2)
    this.scene.add(key, rim)
  }

  register(canvas: HTMLCanvasElement, kind: NavIcon3DKind): Entry | null {
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    const group = buildIcon(kind)
    group.visible = false
    group.rotation.set(BASE_ROT.x, BASE_ROT.y, 0)
    this.scene.add(group)
    const entry: Entry = { ctx, canvas, group, hovered: false, hoverAmt: 0, spin: 0, dirty: true }
    this.entries.add(entry)
    this.kick()
    return entry
  }

  unregister(entry: Entry) {
    this.entries.delete(entry)
    this.scene.remove(entry.group)
    entry.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        ;(obj.material as THREE.Material).dispose()
      }
    })
  }

  setHovered(entry: Entry, hovered: boolean) {
    entry.hovered = hovered && !this.reduceMotion
    entry.dirty = true
    this.kick()
  }

  private kick() {
    if (!this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    let animating = false

    for (const e of this.entries) {
      // Ease hover amount; spin while hovered, settle back to the rest angle after.
      const target = e.hovered ? 1 : 0
      e.hoverAmt += (target - e.hoverAmt) * Math.min(1, dt * 10)
      let settled = false
      if (e.hovered) {
        e.spin += dt * 2.4
      } else {
        const rest = Math.round(e.spin / (Math.PI * 2)) * Math.PI * 2
        e.spin += (rest - e.spin) * Math.min(1, dt * 7)
        if (Math.abs(rest - e.spin) < 0.002 && e.hoverAmt < 0.002) {
          // Back at the rest pose: snap and stop animating this icon.
          e.spin = 0
          e.hoverAmt = 0
          settled = true
        }
      }
      if (!settled || e.dirty) {
        e.group.rotation.set(
          BASE_ROT.x + Math.sin(now / 260) * 0.12 * e.hoverAmt,
          BASE_ROT.y + e.spin,
          0,
        )
        e.group.scale.setScalar(1 + 0.12 * e.hoverAmt)
        this.draw(e)
        e.dirty = false
      }
      if (!settled) animating = true
    }

    this.raf = animating ? requestAnimationFrame(this.tick) : 0
  }

  private draw(e: Entry) {
    const px = e.canvas.width
    if (px !== this.size) {
      this.renderer.setSize(px, px, false)
      this.size = px
    }
    for (const other of this.entries) other.group.visible = other === e
    this.renderer.render(this.scene, this.camera)
    e.ctx.clearRect(0, 0, px, px)
    e.ctx.drawImage(this.renderer.domElement, 0, 0, px, px)
  }
}

let shared: NavIconRenderer | null | undefined

/** Lazily creates the shared renderer; null when WebGL is unavailable. */
function getRenderer() {
  if (shared === undefined) {
    try {
      shared = new NavIconRenderer()
    } catch {
      shared = null
    }
  }
  return shared
}

/* ---------- React component ---------- */

/**
 * 3D nav icon. Animates while its nearest `[data-icon-host]` / `[data-nav-item]` is hovered or keyboard-focused.
 * Renders `fallback` when WebGL is unavailable.
 */
export function NavIcon3D({
  kind,
  size = 20,
  fallback = null,
}: {
  kind: NavIcon3DKind
  size?: number
  fallback?: React.ReactNode
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = getRenderer()
    if (!renderer) {
      setFailed(true)
      return
    }
    const px = Math.round(size * Math.min(window.devicePixelRatio || 1, 2) * 1.5)
    canvas.width = px
    canvas.height = px

    const entry = renderer.register(canvas, kind)
    if (!entry) {
      setFailed(true)
      return
    }

    const host = canvas.closest<HTMLElement>("[data-icon-host], [data-nav-item]") ?? canvas
    const on = () => renderer.setHovered(entry, true)
    const off = () => renderer.setHovered(entry, false)
    const onFocus = () => host.matches(":focus-visible") && on()
    host.addEventListener("pointerenter", on)
    host.addEventListener("pointerleave", off)
    host.addEventListener("focus", onFocus)
    host.addEventListener("blur", off)

    return () => {
      host.removeEventListener("pointerenter", on)
      host.removeEventListener("pointerleave", off)
      host.removeEventListener("focus", onFocus)
      host.removeEventListener("blur", off)
      renderer.unregister(entry)
    }
  }, [kind, size])

  if (failed) return <>{fallback}</>

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none shrink-0"
      // Drawn at 1.5× so the pop-scale on hover never clips.
      style={{ width: size * 1.5, height: size * 1.5, margin: -size * 0.25 }}
    />
  )
}
