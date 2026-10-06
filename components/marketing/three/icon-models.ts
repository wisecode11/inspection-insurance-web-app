import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

/**
 * Small glossy 3D icons for the homepage capability strip, built from
 * primitives (no model files). Every builder returns a group roughly centred
 * on the origin; `buildIcon` normalises it to a common size.
 */

export const ICON_KEYS = [
  "pin",
  "storm",
  "squares",
  "camera",
  "pdf",
  "palette",
  "phone",
  "dashboard",
  "shield",
  "home",
  "photos",
  "map",
  "clipboard",
] as const

export type IconKey = (typeof ICON_KEYS)[number]

const gloss = (color: THREE.ColorRepresentation, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.18, ...extra })

const M = {
  green: gloss("#12b76a"),
  forest: gloss("#0a4b37"),
  mint: gloss("#8ce0b0"),
  white: gloss("#f6faf8", { roughness: 0.45 }),
  amber: gloss("#f2b53a"),
  coral: gloss("#e0644c"),
  blue: gloss("#4f8fd6"),
  ink: gloss("#1c2a26", { metalness: 0.4, roughness: 0.35 }),
  wood: gloss("#e9cf9f", { roughness: 0.5 }),
  line: gloss("#c5d6ce"),
  sky: gloss("#a9d4f5", { roughness: 0.4 }),
  paleMint: gloss("#d6f2e3", { roughness: 0.5 }),
  cloud: gloss("#d7e7f6", { roughness: 0.45 }),
  lens: gloss("#163d33", { roughness: 0.08, metalness: 0.3 }),
  screen: gloss("#1fa774", { emissive: new THREE.Color("#12b76a"), emissiveIntensity: 0.35 }),
}

const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}
const rbox = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 4, r)

function checkTube(scale: number, radius: number) {
  const path = new THREE.CurvePath<THREE.Vector3>()
  const a = new THREE.Vector3(-0.36, 0.02, 0).multiplyScalar(scale)
  const b = new THREE.Vector3(-0.1, -0.24, 0).multiplyScalar(scale)
  const c = new THREE.Vector3(0.38, 0.28, 0).multiplyScalar(scale)
  path.add(new THREE.LineCurve3(a, b))
  path.add(new THREE.LineCurve3(b, c))
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.TubeGeometry(path, 24, radius, 12, false), M.white))
  for (const p of [a, b, c]) g.add(mesh(new THREE.SphereGeometry(radius, 12, 12), M.white, p.x, p.y, p.z))
  return g
}

const builders: Record<IconKey, () => THREE.Group> = {
  /** GPS on every photo — teardrop map pin */
  pin() {
    const g = new THREE.Group()
    g.add(mesh(new THREE.SphereGeometry(0.5, 40, 40), M.green, 0, 0.22, 0))
    const tip = new THREE.ConeGeometry(0.43, 0.9, 40)
    tip.rotateX(Math.PI)
    g.add(mesh(tip, M.green, 0, -0.38, 0))
    g.add(mesh(new THREE.SphereGeometry(0.19, 24, 24), M.white, 0, 0.24, 0.4))
    return g
  },

  /** NOAA storm verification — cloud with a lightning bolt */
  storm() {
    const g = new THREE.Group()
    for (const [x, y, r] of [
      [-0.42, -0.02, 0.36],
      [0.0, 0.2, 0.48],
      [0.42, 0.0, 0.34],
      [-0.12, -0.12, 0.36],
      [0.2, -0.12, 0.34],
    ])
      g.add(mesh(new THREE.SphereGeometry(r, 28, 28), M.cloud, x, y, 0))
    const bolt = new THREE.Shape()
    bolt.moveTo(0.08, 0.32)
    bolt.lineTo(-0.2, -0.06)
    bolt.lineTo(-0.02, -0.06)
    bolt.lineTo(-0.14, -0.42)
    bolt.lineTo(0.2, 0.04)
    bolt.lineTo(0.02, 0.04)
    bolt.closePath()
    const boltGeo = new THREE.ExtrudeGeometry(bolt, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3 })
    g.add(mesh(boltGeo, M.amber, 0.05, -0.38, 0.32))
    return g
  },

  /** Test squares — chalked test square with hail hits */
  squares() {
    const g = new THREE.Group()
    g.add(mesh(rbox(1.35, 1.35, 0.22, 0.08), M.forest))
    g.add(mesh(rbox(1.02, 1.02, 0.08, 0.04), M.white, 0, 0, 0.12))
    for (const [x, y, r] of [
      [-0.22, 0.2, 0.09],
      [0.24, 0.12, 0.07],
      [-0.05, -0.2, 0.08],
      [0.26, -0.26, 0.06],
    ]) {
      const hit = mesh(new THREE.SphereGeometry(r, 16, 16), M.coral, x, y, 0.17)
      hit.scale.z = 0.45
      g.add(hit)
    }
    return g
  },

  /** Damage tags by slope — camera */
  camera() {
    const g = new THREE.Group()
    g.add(mesh(rbox(1.5, 1.0, 0.55, 0.14), M.forest))
    g.add(mesh(rbox(0.5, 0.2, 0.4, 0.06), M.forest, -0.32, 0.55, 0))
    const lensRing = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 40)
    lensRing.rotateX(Math.PI / 2)
    g.add(mesh(lensRing, M.white, 0, -0.02, 0.32))
    const glass = new THREE.CylinderGeometry(0.25, 0.25, 0.24, 40)
    glass.rotateX(Math.PI / 2)
    g.add(mesh(glass, M.lens, 0, -0.02, 0.34))
    g.add(mesh(new THREE.SphereGeometry(0.07, 16, 16), M.mint, 0.08, 0.06, 0.45))
    g.add(mesh(rbox(0.22, 0.12, 0.08, 0.03), M.amber, 0.48, 0.32, 0.28))
    return g
  },

  /** Carrier-ready PDFs — document with a PDF band */
  pdf() {
    const g = new THREE.Group()
    g.add(mesh(rbox(1.0, 1.3, 0.12, 0.05), M.white))
    for (const [y, w] of [
      [0.36, 0.62],
      [0.18, 0.62],
      [0.0, 0.44],
    ])
      g.add(mesh(rbox(w, 0.07, 0.04, 0.02), M.line, -0.32 + w / 2, y, 0.07))
    g.add(mesh(rbox(0.62, 0.28, 0.1, 0.05), M.coral, 0.1, -0.34, 0.08))
    g.add(mesh(rbox(0.3, 0.3, 0.1, 0.05), M.green, -0.42, 0.56, 0.06))
    return g
  },

  /** Your branding on every report — paint palette */
  palette() {
    const g = new THREE.Group()
    const shape = new THREE.Shape()
    shape.absellipse(0, 0, 0.78, 0.62, 0, Math.PI * 2, false, 0)
    const hole = new THREE.Path()
    hole.absarc(0.38, -0.22, 0.13, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4, curveSegments: 40 })
    geo.translate(0, 0, -0.06)
    g.add(new THREE.Mesh(geo, M.wood))
    for (const [x, y, mat] of [
      [-0.42, 0.12, M.green],
      [-0.12, 0.34, M.amber],
      [0.24, 0.3, M.coral],
      [-0.3, -0.22, M.blue],
      [0.02, -0.08, M.forest],
    ] as const) {
      const blob = mesh(new THREE.SphereGeometry(0.13, 20, 20), mat, x, y, 0.14)
      blob.scale.z = 0.55
      g.add(blob)
    }
    return g
  },

  /** Inspector mobile app — phone */
  phone() {
    const g = new THREE.Group()
    g.add(mesh(rbox(0.82, 1.55, 0.14, 0.12), M.ink))
    g.add(mesh(rbox(0.7, 1.42, 0.04, 0.09), M.screen, 0, 0, 0.06))
    g.add(mesh(rbox(0.2, 0.06, 0.03, 0.03), M.ink, 0, 0.6, 0.09))
    for (const [y, w] of [
      [0.3, 0.46],
      [0.08, 0.46],
      [-0.2, 0.3],
    ])
      g.add(mesh(rbox(w, 0.13, 0.03, 0.03), M.white, 0, y, 0.09))
    return g
  },

  /** Company + platform portals — monitor with a bar chart */
  dashboard() {
    const g = new THREE.Group()
    g.add(mesh(rbox(1.55, 1.0, 0.12, 0.08), M.forest, 0, 0.18, 0))
    g.add(mesh(rbox(1.4, 0.85, 0.04, 0.05), M.white, 0, 0.18, 0.06))
    for (const [x, h, mat] of [
      [-0.38, 0.3, M.mint],
      [-0.1, 0.5, M.green],
      [0.18, 0.38, M.green],
      [0.44, 0.58, M.forest],
    ] as const)
      g.add(mesh(rbox(0.18, h, 0.06, 0.03), mat, x, -0.12 + h / 2, 0.1))
    const neck = new THREE.CylinderGeometry(0.06, 0.06, 0.32, 16)
    g.add(mesh(neck, M.forest, 0, -0.45, -0.02))
    g.add(mesh(rbox(0.66, 0.08, 0.32, 0.04), M.forest, 0, -0.62, 0))
    return g
  },

  /** Role-based access — shield with a check */
  shield() {
    const g = new THREE.Group()
    const s = new THREE.Shape()
    s.moveTo(0, 0.78)
    s.bezierCurveTo(0.26, 0.62, 0.5, 0.6, 0.66, 0.62)
    s.lineTo(0.66, 0.1)
    s.bezierCurveTo(0.66, -0.36, 0.34, -0.62, 0, -0.82)
    s.bezierCurveTo(-0.34, -0.62, -0.66, -0.36, -0.66, 0.1)
    s.lineTo(-0.66, 0.62)
    s.bezierCurveTo(-0.5, 0.6, -0.26, 0.62, 0, 0.78)
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 5, curveSegments: 40 })
    geo.center()
    g.add(new THREE.Mesh(geo, M.green))
    const check = checkTube(1, 0.065)
    check.position.z = 0.2
    g.add(check)
    return g
  },

  /** One complete claim file — the house mark on the hub card */
  home() {
    const g = new THREE.Group()
    g.add(mesh(rbox(1.15, 0.8, 0.7, 0.06), M.white, 0, -0.3, 0))
    // Gable roof: triangle extruded through the depth, with overhang
    const tri = new THREE.Shape()
    tri.moveTo(-0.8, 0)
    tri.lineTo(0.8, 0)
    tri.lineTo(0, 0.62)
    tri.closePath()
    const roof = new THREE.ExtrudeGeometry(tri, { depth: 0.86, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 })
    roof.translate(0, 0, -0.43)
    g.add(mesh(roof, M.green, 0, 0.08, 0))
    g.add(mesh(rbox(0.16, 0.34, 0.16, 0.03), M.forest, 0.38, 0.5, -0.1))
    // Window (four panes) and door on the front
    for (const [x, y] of [
      [-0.11, -0.18],
      [0.03, -0.18],
      [-0.11, -0.32],
      [0.03, -0.32],
    ])
      g.add(mesh(rbox(0.12, 0.12, 0.04, 0.02), M.forest, x - 0.22, y + 0.02, 0.36))
    g.add(mesh(rbox(0.22, 0.4, 0.04, 0.03), M.forest, 0.28, -0.5, 0.36))
    return g
  },

  /** Field photos — two stacked photo prints with a landscape */
  photos() {
    const g = new THREE.Group()
    const print = (x: number, y: number, z: number, rot: number) => {
      const p = new THREE.Group()
      p.add(mesh(rbox(1.2, 0.92, 0.06, 0.04), M.white))
      p.add(mesh(rbox(1.02, 0.66, 0.02, 0.02), M.sky, 0, 0.06, 0.035))
      const hill = new THREE.Shape()
      hill.moveTo(-0.5, -0.27)
      hill.lineTo(-0.15, 0.1)
      hill.lineTo(0.08, -0.08)
      hill.lineTo(0.28, 0.12)
      hill.lineTo(0.5, -0.1)
      hill.lineTo(0.5, -0.27)
      hill.closePath()
      p.add(mesh(new THREE.ShapeGeometry(hill), M.green, 0, 0.06, 0.05))
      p.add(mesh(new THREE.SphereGeometry(0.07, 16, 16), M.amber, 0.28, 0.22, 0.06))
      p.position.set(x, y, z)
      p.rotation.z = rot
      return p
    }
    g.add(print(-0.16, 0.12, -0.1, 0.16))
    g.add(print(0.08, -0.06, 0.06, -0.08))
    return g
  },

  /** GPS stamps — folded map with a pin */
  map() {
    const g = new THREE.Group()
    const panels = [M.mint, M.paleMint, M.mint]
    panels.forEach((mat, i) => {
      const panel = mesh(rbox(0.5, 1.0, 0.04, 0.02), mat, (i - 1) * 0.47, -0.25, 0)
      panel.rotation.y = i === 1 ? -0.35 : 0.35
      panel.rotation.x = -1.05
      g.add(panel)
    })
    const pin = new THREE.Group()
    pin.add(mesh(new THREE.SphereGeometry(0.26, 32, 32), M.green, 0, 0.42, 0))
    const tip = new THREE.ConeGeometry(0.22, 0.46, 32)
    tip.rotateX(Math.PI)
    pin.add(mesh(tip, M.green, 0, 0.12, 0))
    pin.add(mesh(new THREE.SphereGeometry(0.1, 16, 16), M.white, 0, 0.44, 0.2))
    pin.position.set(0.05, -0.02, 0.05)
    g.add(pin)
    return g
  },

  /** Office review — clipboard with checked lines */
  clipboard() {
    const g = new THREE.Group()
    g.add(mesh(rbox(1.0, 1.32, 0.1, 0.08), M.blue))
    g.add(mesh(rbox(0.84, 1.12, 0.04, 0.03), M.white, 0, -0.04, 0.06))
    g.add(mesh(rbox(0.42, 0.16, 0.12, 0.05), M.ink, 0, 0.62, 0.06))
    for (const y of [0.28, 0.0, -0.28]) {
      const tick = checkTube(0.28, 0.03)
      tick.traverse((o) => ((o as THREE.Mesh).material = M.green))
      tick.position.set(-0.24, y, 0.1)
      g.add(tick)
      g.add(mesh(rbox(0.38, 0.06, 0.03, 0.015), M.line, 0.14, y, 0.09))
    }
    return g
  },
}

/** Builds an icon and scales it so its largest dimension is `size`. */
export function buildIcon(key: IconKey, size = 1.7) {
  const icon = builders[key]()
  const box = new THREE.Box3().setFromObject(icon)
  const dims = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const wrapper = new THREE.Group()
  icon.position.sub(center)
  wrapper.add(icon)
  wrapper.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z))
  return wrapper
}

/** Materials are shared across icons, so they are disposed once, here. */
export function disposeIconMaterials() {
  for (const m of Object.values(M)) m.dispose()
}
