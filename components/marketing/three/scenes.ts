import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

import { buildIcon } from "@/components/marketing/three/icon-models"

/**
 * Three.js scenes for the marketing homepage. Loaded lazily by <ThreeCanvas>
 * (dynamic import), so `three` stays out of the initial page bundle.
 *
 * Every scene shares one mount loop: transparent renderer, capped DPR,
 * smoothed pointer, and rendering only while the canvas is on screen.
 */

const BRAND = {
  forest: new THREE.Color("#0a4b37"),
  deep: new THREE.Color("#063728"),
  emerald: new THREE.Color("#12b76a"),
  mint: new THREE.Color("#6ae8b0"),
  sage: new THREE.Color("#2f9e6e"),
  pale: new THREE.Color("#8ce0b0"),
  wall: new THREE.Color("#f8fbf9"),
  amber: new THREE.Color("#e0a526"),
  coral: new THREE.Color("#d9634c"),
}

type SceneContext = {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  /** Smoothed pointer, -1..1 on each axis relative to the canvas. */
  pointer: THREE.Vector2
  /** Whether the cursor is currently over the canvas. */
  pointerInside: { value: boolean }
  /** External 0..1 driver (e.g. section scroll progress); 0 when none is given. */
  progress: { value: number }
}

type SceneInstance = {
  update: (t: number, dt: number) => void
  resize?: (width: number, height: number) => void
  /** Frees anything the generic scene traversal can't reach (e.g. environment maps). */
  dispose?: () => void
}

type SceneFactory = (ctx: SceneContext) => SceneInstance

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/** Soft round sprite so THREE.Points render as glowing dots, not squares. */
function dotTexture() {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.35, "rgba(255,255,255,0.75)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------------------- Devices showcase ---------------------------- */

/** Soft radial blot used as a fake contact shadow under a device. */
function contactShadow(opacity: number) {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, `rgba(6,55,40,${opacity})`)
  g.addColorStop(0.55, `rgba(6,55,40,${opacity * 0.35})`)
  g.addColorStop(1, "rgba(6,55,40,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
  )
}

function screenTexture(renderer: THREE.WebGLRenderer, url: string) {
  const texture = new THREE.TextureLoader().load(url)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

const easeOut = (x: number) => 1 - Math.pow(1 - THREE.MathUtils.clamp(x, 0, 1), 3)
/** 0→1 as `p` moves from `a` to `b`, eased. */
const span = (p: number, a: number, b: number) => easeOut((p - a) / (b - a))

/**
 * The laptop's screen: a company dashboard drawn on a 2D canvas, so it stays
 * crisp and can animate — KPIs count up, the trend chart draws in, and the
 * approval donut fills as `k` goes 0 → 1.
 */
function createDashboardScreen(renderer: THREE.WebGLRenderer) {
  const W = 1600
  const H = 1000
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

  const C = {
    forest: "#0a4b37",
    deep: "#063728",
    emerald: "#12b76a",
    mint: "#6ae8b0",
    bg: "#f2f6f4",
    card: "#ffffff",
    ink: "#13231d",
    muted: "#6b7d75",
    line: "#e3ebe7",
  }
  const font = (w: number, s: number) => `${w} ${s}px Inter, "Segoe UI", system-ui, sans-serif`
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
  }
  const card = (x: number, y: number, w: number, h: number) => {
    ctx.save()
    ctx.shadowColor = "rgba(6,55,40,0.08)"
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 4
    rr(x, y, w, h, 18)
    ctx.fillStyle = C.card
    ctx.fill()
    ctx.restore()
    rr(x, y, w, h, 18)
    ctx.strokeStyle = C.line
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Claims trend (12 points, 0..1)
  const trend = [0.32, 0.38, 0.35, 0.47, 0.44, 0.55, 0.52, 0.63, 0.6, 0.72, 0.78, 0.86]
  const kpis = [
    { label: "Active jobs", value: 128, fmt: (v: number) => `${Math.round(v)}`, delta: "+12%" },
    { label: "Inspections today", value: 36, fmt: (v: number) => `${Math.round(v)}`, delta: "+8%" },
    { label: "Reports sent", value: 412, fmt: (v: number) => `${Math.round(v)}`, delta: "+21%" },
    { label: "Avg. approval", value: 2.4, fmt: (v: number) => `${v.toFixed(1)}d`, delta: "−0.6d" },
  ]
  const activity = [
    { name: "Mason Rivera", what: "Storm verified · Hail 1.75\"", tag: "Verified", tagC: C.emerald },
    { name: "Jhon Alan", what: "12 photos uploaded · GPS locked", tag: "Synced", tagC: "#3b82c4" },
    { name: "Ava Brooks", what: "Carrier PDF sent for review", tag: "Sent", tagC: "#e0a526" },
  ]

  function draw(k: number) {
    const count = easeOut(k / 0.7)
    const chart = easeOut((k - 0.15) / 0.75)
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)

    // Top bar
    ctx.fillStyle = C.forest
    ctx.fillRect(0, 0, W, 92)
    rr(36, 22, 48, 48, 12)
    ctx.fillStyle = C.mint
    ctx.fill()
    ctx.fillStyle = C.forest
    ctx.font = font(800, 26)
    ctx.fillText("R", 52, 56)
    ctx.fillStyle = "#fff"
    ctx.font = font(700, 26)
    ctx.fillText("RoofClaim", 100, 46)
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = font(500, 16)
    ctx.fillText("Company Admin", 100, 70)
    rr(470, 24, 520, 44, 22)
    ctx.fillStyle = "rgba(255,255,255,0.1)"
    ctx.fill()
    ctx.fillStyle = "rgba(255,255,255,0.55)"
    ctx.font = font(500, 18)
    ctx.fillText("Search jobs, inspectors, reports…", 500, 53)
    rr(1290, 24, 150, 44, 22)
    ctx.fillStyle = C.emerald
    ctx.fill()
    ctx.fillStyle = "#fff"
    ctx.font = font(700, 18)
    ctx.fillText("+ New job", 1322, 53)
    ctx.beginPath()
    ctx.arc(1510, 46, 24, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255,255,255,0.18)"
    ctx.fill()
    ctx.fillStyle = "#fff"
    ctx.font = font(700, 17)
    ctx.fillText("DT", 1497, 52)

    // Nav row
    ctx.fillStyle = C.deep
    ctx.fillRect(0, 92, W, 58)
    const tabs = ["Dashboard", "Operations", "Team", "Reports", "Settings"]
    let tx = 36
    ctx.font = font(600, 18)
    for (const [i, t] of tabs.entries()) {
      const w = ctx.measureText(t).width + 36
      if (i === 0) {
        rr(tx, 104, w, 34, 17)
        ctx.fillStyle = "rgba(255,255,255,0.14)"
        ctx.fill()
      }
      ctx.fillStyle = i === 0 ? "#fff" : "rgba(255,255,255,0.65)"
      ctx.fillText(t, tx + 18, 127)
      tx += w + 10
    }

    // Heading
    ctx.fillStyle = C.ink
    ctx.font = font(800, 40)
    ctx.fillText("Welcome back, Dev", 36, 212)
    ctx.fillStyle = C.muted
    ctx.font = font(500, 19)
    ctx.fillText("Brothers Roofing · live jobs, inspections and carrier reports", 36, 246)
    rr(1290, 182, 274, 46, 23)
    ctx.fillStyle = C.forest
    ctx.fill()
    ctx.fillStyle = "#fff"
    ctx.font = font(700, 18)
    ctx.fillText("Export weekly report", 1318, 212)

    // KPI cards
    const kw = (W - 72 - 3 * 24) / 4
    kpis.forEach((kp, i) => {
      const x = 36 + i * (kw + 24)
      const y = 278
      card(x, y, kw, 150)
      ctx.fillStyle = C.muted
      ctx.font = font(600, 18)
      ctx.fillText(kp.label, x + 24, y + 40)
      ctx.fillStyle = C.ink
      ctx.font = font(800, 50)
      ctx.fillText(kp.fmt(kp.value * count), x + 24, y + 102)
      rr(x + 24, y + 116, 70, 24, 12)
      ctx.fillStyle = "rgba(18,183,106,0.12)"
      ctx.fill()
      ctx.fillStyle = "#0f8a52"
      ctx.font = font(700, 15)
      ctx.fillText(kp.delta, x + 34, y + 133)
      // sparkline
      ctx.save()
      ctx.beginPath()
      const sx = x + kw - 140
      for (let j = 0; j < 8; j++) {
        const px = sx + j * 16
        const py = y + 70 - Math.sin(j * 0.9 + i) * 10 - j * 3 * count
        j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
      }
      ctx.strokeStyle = C.emerald
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.globalAlpha = count
      ctx.stroke()
      ctx.restore()
    })

    // Trend chart
    const cx0 = 36
    const cy0 = 456
    const cw = 980
    const ch = 510
    card(cx0, cy0, cw, ch)
    ctx.fillStyle = C.ink
    ctx.font = font(700, 22)
    ctx.fillText("Claims approved", cx0 + 28, cy0 + 44)
    ctx.fillStyle = C.muted
    ctx.font = font(500, 16)
    ctx.fillText("Last 12 weeks", cx0 + 28, cy0 + 70)
    const gx = cx0 + 40
    const gy = cy0 + 110
    const gw = cw - 80
    const gh = ch - 170
    ctx.strokeStyle = C.line
    ctx.lineWidth = 2
    for (let r = 0; r <= 4; r++) {
      const y = gy + (gh / 4) * r
      ctx.beginPath()
      ctx.moveTo(gx, y)
      ctx.lineTo(gx + gw, y)
      ctx.stroke()
    }
    const pts = trend.map((v, i) => [gx + (gw / (trend.length - 1)) * i, gy + gh - v * gh] as const)
    ctx.save()
    ctx.beginPath()
    ctx.rect(gx - 10, gy - 20, (gw + 20) * chart, gh + 40)
    ctx.clip()
    const area = ctx.createLinearGradient(0, gy, 0, gy + gh)
    area.addColorStop(0, "rgba(18,183,106,0.28)")
    area.addColorStop(1, "rgba(18,183,106,0)")
    ctx.beginPath()
    ctx.moveTo(pts[0][0], gy + gh)
    for (const [x, y] of pts) ctx.lineTo(x, y)
    ctx.lineTo(pts[pts.length - 1][0], gy + gh)
    ctx.closePath()
    ctx.fillStyle = area
    ctx.fill()
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.strokeStyle = C.emerald
    ctx.lineWidth = 5
    ctx.lineJoin = "round"
    ctx.stroke()
    for (const [x, y] of pts) {
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()
      ctx.lineWidth = 3
      ctx.stroke()
    }
    ctx.restore()
    // Leading glow dot
    if (chart > 0.02 && chart < 0.999) {
      const idx = Math.min(pts.length - 1, Math.floor(chart * (pts.length - 1)))
      ctx.beginPath()
      ctx.arc(pts[idx][0], pts[idx][1], 12, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(106,232,176,0.5)"
      ctx.fill()
    }
    ctx.fillStyle = C.muted
    ctx.font = font(500, 15)
    ;["W1", "W3", "W5", "W7", "W9", "W12"].forEach((l, i) => ctx.fillText(l, gx + (gw / 5) * i - 10, gy + gh + 34))

    // Approval donut
    const dx0 = 1040
    card(dx0, cy0, W - 36 - dx0, 230)
    ctx.fillStyle = C.ink
    ctx.font = font(700, 22)
    ctx.fillText("Approval rate", dx0 + 28, cy0 + 44)
    const dcx = dx0 + 120
    const dcy = cy0 + 140
    ctx.lineWidth = 22
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.arc(dcx, dcy, 62, 0, Math.PI * 2)
    ctx.strokeStyle = C.line
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(dcx, dcy, 62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.86 * chart)
    ctx.strokeStyle = C.emerald
    ctx.stroke()
    ctx.fillStyle = C.ink
    ctx.font = font(800, 34)
    ctx.fillText(`${Math.round(86 * chart)}%`, dcx - 34, dcy + 12)
    ctx.fillStyle = C.muted
    ctx.font = font(500, 17)
    ctx.fillText("First-pass approvals", dx0 + 222, cy0 + 120)
    ctx.fillStyle = "#0f8a52"
    ctx.font = font(700, 17)
    ctx.fillText("↑ 9% vs last month", dx0 + 222, cy0 + 150)

    // Recent activity
    const ay0 = cy0 + 254
    card(dx0, ay0, W - 36 - dx0, ch - 254)
    ctx.fillStyle = C.ink
    ctx.font = font(700, 22)
    ctx.fillText("Recent activity", dx0 + 28, ay0 + 44)
    activity.forEach((a, i) => {
      const row = easeOut((k - 0.35 - i * 0.12) / 0.3)
      if (row <= 0) return
      ctx.save()
      ctx.globalAlpha = row
      const y = ay0 + 72 + i * 58 + (1 - row) * 14
      ctx.beginPath()
      ctx.arc(dx0 + 48, y + 22, 18, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(10,75,55,0.1)"
      ctx.fill()
      ctx.fillStyle = C.forest
      ctx.font = font(700, 14)
      ctx.fillText(a.name.split(" ").map((s) => s[0]).join(""), dx0 + 38, y + 27)
      ctx.fillStyle = C.ink
      ctx.font = font(700, 17)
      ctx.fillText(a.name, dx0 + 80, y + 16)
      ctx.fillStyle = C.muted
      ctx.font = font(500, 15)
      ctx.fillText(a.what, dx0 + 80, y + 38)
      ctx.font = font(700, 14)
      const tw = ctx.measureText(a.tag).width + 22
      rr(W - 36 - 24 - tw, y + 8, tw, 26, 13)
      ctx.fillStyle = a.tagC + "22"
      ctx.fill()
      ctx.fillStyle = a.tagC
      ctx.fillText(a.tag, W - 36 - 24 - tw + 11, y + 26)
      ctx.restore()
    })

    texture.needsUpdate = true
  }

  let last = -1
  return {
    texture,
    /** Redraws only when the reveal value actually moved. */
    update(k: number) {
      const q = Math.round(THREE.MathUtils.clamp(k, 0, 1) * 200) / 200
      if (q === last) return
      last = q
      draw(q)
    },
  }
}

/**
 * Dashboard section: a 3D laptop running a live company dashboard and a phone
 * running the Inspector app. Driven by section scroll progress (0 → 1): the
 * laptop rises and its lid opens, the dashboard animates in, then the phone
 * slides in beside it. The camera auto-fits the pair, so nothing is cropped.
 */
const devices: SceneFactory = ({ scene, camera, renderer, pointer, progress }) => {
  renderer.toneMappingExposure = 1.0

  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envMap = pmrem.fromScene(room, 0.04).texture
  scene.environment = envMap
  pmrem.dispose()
  room.traverse((o) => (o as THREE.Mesh).geometry?.dispose())

  camera.fov = 30
  const key = new THREE.DirectionalLight(0xffffff, 1.4)
  key.position.set(3, 6, 5)
  scene.add(key)
  const rim = new THREE.PointLight(BRAND.mint, 16, 12)
  rim.position.set(-3.5, 2.5, -2)
  scene.add(rim)

  const aluminium = new THREE.MeshPhysicalMaterial({
    color: "#cdd6d2",
    metalness: 0.85,
    roughness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
  })
  const deckMat = new THREE.MeshPhysicalMaterial({ color: "#bcc6c1", metalness: 0.8, roughness: 0.38 })
  const darkAluminium = new THREE.MeshPhysicalMaterial({ color: "#2a3330", metalness: 0.7, roughness: 0.35 })
  const bezel = new THREE.MeshPhysicalMaterial({ color: "#0d1311", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 })
  const keyMat = new THREE.MeshStandardMaterial({ color: "#1d2523", roughness: 0.65 })

  /* ------------------------------ Laptop ------------------------------ */
  const LW = 3.3
  const LD = 2.2
  const laptop = new THREE.Group()
  scene.add(laptop)

  const base = new THREE.Mesh(new RoundedBoxGeometry(LW, 0.1, LD, 4, 0.05), aluminium)
  base.position.y = 0.05
  laptop.add(base)

  // Keyboard well + individual keycaps (one instanced mesh)
  const well = new THREE.Mesh(new RoundedBoxGeometry(LW * 0.84, 0.006, LD * 0.44, 2, 0.003), deckMat)
  well.position.set(0, 0.1, -0.3)
  laptop.add(well)
  const cols = 14
  const rows = 5
  const kwid = (LW * 0.82) / cols
  const kdep = (LD * 0.42) / rows
  const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(kwid * 0.84, 0.018, kdep * 0.8, 2, 0.008), keyMat, cols * rows + 1)
  const m4 = new THREE.Matrix4()
  let n = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c >= 4 && c <= 9) continue // spacebar gap
      m4.makeTranslation(-LW * 0.41 + kwid * (c + 0.5), 0.108, -0.3 - LD * 0.21 + kdep * (r + 0.5))
      keys.setMatrixAt(n++, m4)
    }
  }
  // Spacebar
  m4.compose(
    new THREE.Vector3(-LW * 0.41 + kwid * 7, 0.108, -0.3 - LD * 0.21 + kdep * (rows - 0.5)),
    new THREE.Quaternion(),
    new THREE.Vector3(6, 1, 1),
  )
  keys.setMatrixAt(n++, m4)
  keys.count = n
  laptop.add(keys)

  // Speaker grilles either side of the keyboard
  for (const side of [-1, 1]) {
    const grille = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.004, LD * 0.4, 2, 0.002), darkAluminium)
    grille.position.set(side * LW * 0.455, 0.101, -0.3)
    laptop.add(grille)
  }
  const trackpad = new THREE.Mesh(
    new RoundedBoxGeometry(LW * 0.36, 0.006, LD * 0.27, 3, 0.02),
    new THREE.MeshPhysicalMaterial({ color: "#d9e1dd", metalness: 0.5, roughness: 0.18, clearcoat: 0.6 }),
  )
  trackpad.position.set(0, 0.101, 0.62)
  laptop.add(trackpad)

  // Lid
  const lid = new THREE.Group()
  lid.position.set(0, 0.1, -LD / 2 + 0.03)
  laptop.add(lid)
  const LH = 2.1
  const lidShell = new THREE.Mesh(new RoundedBoxGeometry(LW, LH, 0.07, 4, 0.04), aluminium)
  lidShell.position.set(0, LH / 2, -0.035)
  lid.add(lidShell)
  const markCanvas = document.createElement("canvas")
  markCanvas.width = markCanvas.height = 256
  const mctx = markCanvas.getContext("2d")!
  mctx.fillStyle = "rgba(10,75,55,0.9)"
  mctx.beginPath()
  mctx.roundRect(48, 48, 160, 160, 44)
  mctx.fill()
  mctx.fillStyle = "#6ae8b0"
  mctx.font = '800 110px Inter, "Segoe UI", system-ui, sans-serif'
  mctx.textAlign = "center"
  mctx.textBaseline = "middle"
  mctx.fillText("R", 128, 136)
  const markTex = new THREE.CanvasTexture(markCanvas)
  markTex.colorSpace = THREE.SRGBColorSpace
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.42),
    new THREE.MeshBasicMaterial({ map: markTex, transparent: true, toneMapped: false }),
  )
  mark.position.set(0, LH / 2, -0.0715)
  mark.rotation.y = Math.PI
  mark.scale.x = -1 // the lid back faces away; un-mirror the logo
  lid.add(mark)
  const lidFace = new THREE.Mesh(new RoundedBoxGeometry(LW - 0.02, LH - 0.02, 0.01, 4, 0.04), bezel)
  lidFace.position.set(0, LH / 2, 0.001)
  lid.add(lidFace)
  const sw = LW - 0.16
  const dashboard = createDashboardScreen(renderer)
  const laptopScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(sw, sw / 1.6),
    new THREE.MeshBasicMaterial({ map: dashboard.texture, toneMapped: false }),
  )
  laptopScreen.position.set(0, LH / 2 - 0.02, 0.008)
  lid.add(laptopScreen)
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), new THREE.MeshBasicMaterial({ color: "#2b3a35" }))
  cam.position.set(0, LH - 0.045, 0.008)
  lid.add(cam)
  // Glass sheen across the screen
  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(sw, sw / 1.6),
    new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.06,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
      depthWrite: false,
    }),
  )
  sheen.position.copy(laptopScreen.position).setZ(0.01)
  lid.add(sheen)

  const laptopShadow = contactShadow(0.5)
  laptopShadow.rotation.x = -Math.PI / 2
  laptopShadow.scale.set(LW * 1.5, LD * 1.6, 1)
  laptopShadow.position.y = 0.002
  scene.add(laptopShadow)

  /* ------------------------------- Phone ------------------------------- */
  const PW = 0.95
  const PH = 2.02
  const phone = new THREE.Group()
  scene.add(phone)
  const phoneBody = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, 0.09, 6, 0.12), darkAluminium)
  phone.add(phoneBody)
  const phoneGlass = new THREE.Mesh(new RoundedBoxGeometry(PW - 0.03, PH - 0.03, 0.01, 6, 0.11), bezel)
  phoneGlass.position.z = 0.045
  phone.add(phoneGlass)
  const phoneScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(PW - 0.08, (PW - 0.08) * (1344 / 620)),
    new THREE.MeshBasicMaterial({
      map: screenTexture(renderer, "/marketing/device-phone-screen.png"),
      transparent: true,
      toneMapped: false,
    }),
  )
  phoneScreen.position.z = 0.052
  phone.add(phoneScreen)
  for (const [y, h] of [
    [0.45, 0.16],
    [0.22, 0.24],
  ]) {
    const btn = new THREE.Mesh(new RoundedBoxGeometry(0.02, h, 0.04, 2, 0.01), darkAluminium)
    btn.position.set(PW / 2 + 0.005, y, 0)
    phone.add(btn)
  }
  const phoneShadow = contactShadow(0.45)
  phoneShadow.rotation.x = -Math.PI / 2
  scene.add(phoneShadow)

  /* ------------------------------ Effects ------------------------------ */
  renderer.localClippingEnabled = true

  // Each device gets its own materials so it can be clipped independently:
  // the laptop is "built" by a sweeping plane, the phone rises through the floor.
  const laptopClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99)
  const floorClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const withClip = (root: THREE.Object3D, plane: THREE.Plane) =>
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.material || Array.isArray(m.material)) return
      m.material = m.material.clone()
      m.material.clippingPlanes = [plane]
    })
  withClip(laptop, laptopClip)
  withClip(phone, floorClip)

  /** Canvas-gradient texture helper. */
  const gradientTexture = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas")
    c.width = w
    c.height = h
    paint(c.getContext("2d")!)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }

  // Hologram: a glowing outline + translucent fill of the laptop shell. It is
  // clipped to the side the sweep has not reached yet, so the scan line turns
  // hologram into solid laptop as it passes.
  const holoClip = new THREE.Plane(new THREE.Vector3(1, 0, 0), 99)
  const holoMat = new THREE.LineBasicMaterial({
    color: BRAND.emerald,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    clippingPlanes: [holoClip],
  })
  const holoFill = new THREE.MeshBasicMaterial({
    color: BRAND.mint,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    side: THREE.DoubleSide,
    clippingPlanes: [holoClip],
  })
  for (const [mesh, dims] of [
    [base, [LW, 0.1, LD]],
    [lidShell, [LW, LH, 0.07]],
  ] as const) {
    const box = new THREE.BoxGeometry(dims[0], dims[1], dims[2])
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), holoMat))
    mesh.add(new THREE.Mesh(box, holoFill))
  }

  // Build sweep: a glowing vertical scan strip that moves across the laptop.
  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 1.9),
    new THREE.MeshBasicMaterial({
      map: gradientTexture(64, 4, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 64, 0)
        g.addColorStop(0, "rgba(18,183,106,0)")
        g.addColorStop(0.5, "rgba(18,183,106,0.95)")
        g.addColorStop(1, "rgba(18,183,106,0)")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 64, 4)
      }),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  scene.add(scan)

  // Screen boot: a light band that sweeps down the display as it powers on.
  const bootTex = gradientTexture(4, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, "rgba(106,232,176,0)")
    g.addColorStop(0.45, "rgba(106,232,176,0)")
    g.addColorStop(0.5, "rgba(190,255,225,0.95)")
    g.addColorStop(0.55, "rgba(106,232,176,0)")
    g.addColorStop(1, "rgba(106,232,176,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 256)
  })
  bootTex.wrapT = THREE.ClampToEdgeWrapping
  const boot = new THREE.Mesh(
    (laptopScreen.geometry as THREE.PlaneGeometry).clone(),
    new THREE.MeshBasicMaterial({
      map: bootTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      clippingPlanes: [laptopClip],
    }),
  )
  boot.position.copy(laptopScreen.position).setZ(0.012)
  lid.add(boot)
  const screenGlow = new THREE.PointLight(BRAND.mint, 0, 3.2)
  screenGlow.position.set(0, LH * 0.4, 0.7)
  lid.add(screenGlow)

  // Portal the phone rises through.
  const portal = new THREE.Group()
  scene.add(portal)
  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.022, 12, 96),
    new THREE.MeshBasicMaterial({ color: BRAND.emerald, transparent: true, toneMapped: false }),
  )
  portalRing.rotation.x = Math.PI / 2
  portal.add(portalRing)
  const portalPool = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 64),
    new THREE.MeshBasicMaterial({
      map: gradientTexture(128, 128, (ctx) => {
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
        g.addColorStop(0, "rgba(106,232,176,0.75)")
        g.addColorStop(0.7, "rgba(18,183,106,0.25)")
        g.addColorStop(1, "rgba(18,183,106,0)")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 128, 128)
      }),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  portalPool.rotation.x = -Math.PI / 2
  portal.add(portalPool)

  // Particles that spiral into the phone as it arrives.
  const SPIRAL = 110
  const spiralSeed = Array.from({ length: SPIRAL }, () => ({
    a: Math.random() * Math.PI * 2,
    r: 0.6 + Math.random() * 0.9,
    h: Math.random() * 2.4,
    s: 0.6 + Math.random() * 0.8,
  }))
  const spiralPos = new Float32Array(SPIRAL * 3)
  const spiralGeo = new THREE.BufferGeometry()
  spiralGeo.setAttribute("position", new THREE.BufferAttribute(spiralPos, 3))
  const spiralMat = new THREE.PointsMaterial({
    size: 0.06,
    map: dotTexture(),
    color: BRAND.emerald,
    transparent: true,
    depthWrite: false,
  })
  scene.add(new THREE.Points(spiralGeo, spiralMat))

  // Ambient dust drifting through the stage.
  const DUST = 180
  const dustPos = new Float32Array(DUST * 3)
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 9
    dustPos[i * 3 + 1] = Math.random() * 4 - 0.4
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 0.5
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.035,
      map: dotTexture(),
      color: BRAND.sage,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  )
  scene.add(dust)

  // Sync arc: phone → laptop once both are in place, with travelling pulses.
  const arcCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.3, 1.75, 0.95),
    new THREE.Vector3(-0.55, 2.75, 0.1),
    new THREE.Vector3(-1.1, 0.42, -0.95),
  )
  const arcGeo = new THREE.TubeGeometry(arcCurve, 80, 0.012, 8, false)
  const arcIndexCount = arcGeo.index!.count
  const arc = new THREE.Mesh(
    arcGeo,
    new THREE.MeshBasicMaterial({ color: BRAND.emerald, transparent: true, opacity: 0.7, toneMapped: false }),
  )
  scene.add(arc)
  const pulseMat = new THREE.MeshBasicMaterial({ color: BRAND.mint, toneMapped: false })
  const pulses = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), pulseMat)
    scene.add(m)
    return m
  })

  // Soft pool of light on the floor.
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 64),
    new THREE.MeshBasicMaterial({
      map: gradientTexture(256, 256, (ctx) => {
        const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
        g.addColorStop(0, "rgba(106,232,176,0.28)")
        g.addColorStop(1, "rgba(106,232,176,0)")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 256, 256)
      }),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.005
  scene.add(floor)

  /* ---------------------------- Choreography --------------------------- */
  // Driven by the pinned section's scroll progress p (0 → 1):
  //   hologram laptop → scan sweep builds it → lid opens, screen boots →
  //   camera orbits in → lid closes, laptop steps back → portal opens and the
  //   phone spins up through it → a sync arc links phone and laptop.
  let p = progress.value
  const content = { minX: -1.9, maxX: 1.9, minY: -0.1, maxY: 2.35 }
  const look = new THREE.Vector3(0, (content.minY + content.maxY) / 2 - 0.3, 0)
  let distance = 10
  const backOut = (x: number) => {
    const c = 1.4
    const v = THREE.MathUtils.clamp(x, 0, 1) - 1
    return 1 + (c + 1) * v * v * v + c * v * v
  }
  const CLOSED = Math.PI / 2 - 0.035
  const OPEN = -0.27
  const screenMat = laptopScreen.material as THREE.MeshBasicMaterial
  const baseShadow = laptopShadow.scale.clone()
  const PHONE_REST = new THREE.Vector3(0.8, 1.15, 1.05)
  const tmp = new THREE.Vector3()

  return {
    resize() {
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const halfW = (content.maxX - content.minX) / 2 + 0.35
      const halfH = (content.maxY - content.minY) / 2 + 0.35
      distance = Math.max(halfW / (tan * camera.aspect), halfH / tan) + 0.4
    },
    update(t, dt) {
      // Ease toward scroll progress over ~0.35s, independent of refresh rate.
      p += (progress.value - p) * (1 - Math.exp(-3 * dt))

      const build = span(p, 0.0, 0.14) // scan sweep materialises the laptop
      const settle = span(p, 0.04, 0.22)
      const open = span(p, 0.12, 0.32)
      const close = span(p, 0.56, 0.72)
      const lidT = open * (1 - close)
      const bootK = THREE.MathUtils.clamp((p - 0.2) / 0.12, 0, 1)
      const screenOn = span(p, 0.2, 0.3) * (1 - span(p, 0.55, 0.61))
      const push = span(p, 0.3, 0.45) * (1 - span(p, 0.55, 0.68))
      const away = span(p, 0.6, 0.8)
      const portalK = span(p, 0.62, 0.7) * (1 - span(p, 0.86, 0.94))
      const phoneT = THREE.MathUtils.clamp((p - 0.66) / 0.2, 0, 1)
      const phoneIn = easeOut(phoneT)
      const phonePop = backOut(phoneT)
      const arcK = span(p, 0.86, 0.95)
      const float = Math.sin(t * 1.1) * 0.04

      // Camera: slow cinematic orbit across the sequence.
      const orbit = THREE.MathUtils.lerp(-0.16, 0.06, span(p, 0.0, 0.45)) + away * 0.14
      camera.position.set(
        look.x + Math.sin(orbit) * distance,
        look.y + distance * THREE.MathUtils.lerp(0.3, 0.22, settle),
        look.z + Math.cos(orbit) * distance,
      )
      camera.lookAt(look)

      // Laptop
      laptop.position.set(
        THREE.MathUtils.lerp(0, -1.15, away),
        THREE.MathUtils.lerp(0.7, 0, settle) + float * (1 - settle * 0.6),
        push * 0.25 - away * 1.1,
      )
      laptop.rotation.y = THREE.MathUtils.lerp(-0.6, -0.22, settle) + away * 0.28 + pointer.x * 0.08
      laptop.rotation.x = THREE.MathUtils.lerp(0.32, 0, settle) + away * 0.14 - pointer.y * 0.03
      laptop.scale.setScalar(1 + push * 0.03 - away * 0.14)
      lid.rotation.x = THREE.MathUtils.lerp(CLOSED, OPEN, lidT)
      screenMat.color.setScalar(0.08 + 0.92 * screenOn)
      dashboard.update((p - 0.24) / 0.18)

      // Build sweep across the laptop (world x), hologram fades as it completes.
      const sweepX = THREE.MathUtils.lerp(-2.3, 2.3, build)
      laptopClip.constant = build >= 1 ? 99 : sweepX
      scan.visible = build > 0.001 && build < 0.999
      scan.position.set(sweepX, laptop.position.y + 0.45, laptop.position.z + 0.9)
      holoClip.constant = -sweepX
      const holo = build >= 1 ? 0 : 1
      holoMat.opacity = 0.9 * holo
      holoFill.opacity = 0.16 * holo

      // Screen boot band + light spill on the keyboard
      boot.visible = bootK > 0 && bootK < 1
      bootTex.offset.y = THREE.MathUtils.lerp(-0.55, 0.55, bootK)
      screenGlow.intensity = screenOn * 3

      laptopShadow.position.set(laptop.position.x, 0.002, laptop.position.z)
      laptopShadow.scale.copy(baseShadow).multiplyScalar(laptop.scale.x * (1.15 - settle * 0.15))
      ;(laptopShadow.material as THREE.MeshBasicMaterial).opacity = (0.35 + settle * 0.65) * build

      // Portal + phone rising through it
      portal.visible = portalK > 0.001
      portal.position.set(PHONE_REST.x, 0.01, PHONE_REST.z)
      portal.scale.setScalar(0.3 + portalK * 0.7)
      ;(portalRing.material as THREE.MeshBasicMaterial).opacity = portalK
      ;(portalPool.material as THREE.MeshBasicMaterial).opacity = portalK * 0.9
      portalRing.rotation.z = t * 1.2

      phone.visible = phoneT > 0
      phone.position.set(
        PHONE_REST.x,
        THREE.MathUtils.lerp(-1.6, PHONE_REST.y, phonePop) + float * phoneIn,
        PHONE_REST.z,
      )
      phone.rotation.y = -0.3 + (1 - phoneIn) * Math.PI * 2 + pointer.x * 0.12 * phoneIn
      phone.rotation.z = THREE.MathUtils.lerp(0.12, 0.04, phoneIn)
      phone.rotation.x = -0.06 + pointer.y * -0.04
      phone.scale.setScalar(THREE.MathUtils.lerp(0.85, 1.12, phoneIn))

      phoneShadow.visible = phone.visible
      phoneShadow.position.set(phone.position.x, 0.002, phone.position.z)
      phoneShadow.scale.set(1.5 - float, 0.6 - float * 0.3, 1)
      ;(phoneShadow.material as THREE.MeshBasicMaterial).opacity = phoneIn * phoneIn * 0.9

      // Spiral particles converge on the phone while it rises
      const swirl = Math.sin(Math.PI * phoneT)
      spiralMat.opacity = swirl * 0.9
      for (let i = 0; i < SPIRAL; i++) {
        const s = spiralSeed[i]
        const k = THREE.MathUtils.clamp(phoneT * s.s * 1.3, 0, 1)
        const a = s.a + k * 5 + t * 0.6
        const r = s.r * (1 - k) + 0.08
        tmp.set(
          PHONE_REST.x + Math.cos(a) * r,
          THREE.MathUtils.lerp(s.h, PHONE_REST.y, k),
          PHONE_REST.z + Math.sin(a) * r,
        )
        tmp.toArray(spiralPos, i * 3)
      }
      spiralGeo.attributes.position.needsUpdate = true

      // Sync arc draws itself, then pulses travel phone → laptop
      arc.visible = arcK > 0.001
      arcGeo.setDrawRange(0, Math.floor((arcIndexCount * arcK) / 3) * 3)
      pulses.forEach((m, i) => {
        m.visible = arcK > 0.98
        arcCurve.getPoint(((t * 0.35 + i / 3) % 1), m.position)
      })

      // Dust drift + pointer parallax
      for (let i = 0; i < DUST; i++) {
        let y = dustPos[i * 3 + 1] + dt * (0.08 + (i % 5) * 0.02)
        if (y > 3.6) y = -0.4
        dustPos[i * 3 + 1] = y
      }
      dustGeo.attributes.position.needsUpdate = true
      dust.position.x = pointer.x * 0.25
      dust.position.y = pointer.y * 0.12
    },
    dispose() {
      envMap.dispose()
      scene.environment = null
    },
  }
}

/* --------------------------- Claim file (CTA) ---------------------------- */

/** The claim report page, drawn on a canvas so it stays crisp in 3D. */
function claimReportTexture(renderer: THREE.WebGLRenderer) {
  const W = 800
  const H = 1040
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  const font = (w: number, s: number) => `${w} ${s}px Inter, "Segoe UI", system-ui, sans-serif`
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, W, H)

  // Header
  ctx.fillStyle = "#0a4b37"
  ctx.fillRect(0, 0, W, 120)
  rr(44, 32, 56, 56, 14)
  ctx.fillStyle = "#6ae8b0"
  ctx.fill()
  ctx.fillStyle = "#0a4b37"
  ctx.font = font(800, 32)
  ctx.fillText("R", 62, 72)
  ctx.fillStyle = "#ffffff"
  ctx.font = font(700, 30)
  ctx.fillText("RoofClaim", 118, 62)
  ctx.fillStyle = "rgba(255,255,255,0.65)"
  ctx.font = font(500, 18)
  ctx.fillText("Carrier-ready claim report", 118, 90)

  // Title
  ctx.fillStyle = "#13231d"
  ctx.font = font(800, 40)
  ctx.fillText("Claim #RC-2041", 44, 190)
  ctx.fillStyle = "#6b7d75"
  ctx.font = font(500, 20)
  ctx.fillText("Hail damage · Date of loss 06/14 · Summit Ridge Roofing", 44, 224)

  // Photo grid (illustrated roof shots)
  const shots = [
    ["#b7d9f2", "#3b6e5a"],
    ["#c9e6f6", "#2f5d4c"],
    ["#a9d0ee", "#41725f"],
    ["#d3ebf8", "#355f50"],
  ]
  shots.forEach(([sky, roof], i) => {
    const x = 44 + (i % 2) * 362
    const y = 260 + Math.floor(i / 2) * 210
    ctx.save()
    rr(x, y, 350, 196, 16)
    ctx.clip()
    const g = ctx.createLinearGradient(0, y, 0, y + 196)
    g.addColorStop(0, sky)
    g.addColorStop(1, "#eef6f1")
    ctx.fillStyle = g
    ctx.fillRect(x, y, 350, 196)
    ctx.fillStyle = roof
    ctx.beginPath()
    ctx.moveTo(x - 10, y + 196)
    ctx.lineTo(x + 120 + i * 18, y + 70)
    ctx.lineTo(x + 360, y + 150)
    ctx.lineTo(x + 360, y + 196)
    ctx.closePath()
    ctx.fill()
    // hail hits
    ctx.fillStyle = "rgba(224,100,76,0.9)"
    for (let k = 0; k < 4; k++) {
      ctx.beginPath()
      ctx.arc(x + 110 + k * 46 + i * 6, y + 140 + ((k * 13) % 26), 7, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    // GPS chip
    rr(x + 12, y + 12, 112, 30, 15)
    ctx.fillStyle = "rgba(10,75,55,0.85)"
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.font = font(700, 15)
    ctx.fillText("GPS ✓ 32.77°N", x + 22, y + 32)
  })

  // Checks
  const rows = [
    ["GPS verified on every photo", "12 / 12"],
    ["Storm match · NOAA date of loss", "Hail 1.75\""],
    ["Test squares", "8 hits / 100 sq ft"],
  ]
  rows.forEach(([label, value], i) => {
    const y = 718 + i * 64
    ctx.beginPath()
    ctx.arc(62, y, 15, 0, Math.PI * 2)
    ctx.fillStyle = "#12b76a"
    ctx.fill()
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    ctx.moveTo(55, y)
    ctx.lineTo(60, y + 6)
    ctx.lineTo(70, y - 6)
    ctx.stroke()
    ctx.fillStyle = "#13231d"
    ctx.font = font(600, 22)
    ctx.fillText(label, 92, y + 8)
    ctx.fillStyle = "#0f8a52"
    ctx.font = font(700, 20)
    const w = ctx.measureText(value).width
    ctx.fillText(value, W - 44 - w, y + 8)
    ctx.fillStyle = "#e3ebe7"
    ctx.fillRect(44, y + 32, W - 88, 2)
  })

  // Footer
  ctx.fillStyle = "#f2f6f4"
  ctx.fillRect(0, H - 90, W, 90)
  ctx.fillStyle = "#6b7d75"
  ctx.font = font(500, 18)
  ctx.fillText("Generated by RoofClaim · Page 1 of 6", 44, H - 38)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

/**
 * Closing CTA: a 3D carrier-ready claim report. Evidence (photos, GPS, storm
 * data, test squares) orbits the document and flies into it one piece at a
 * time; each arrival flashes the page and the "Approved" seal pulses. Leans
 * toward the pointer. Time-driven, so it plays whenever the panel is on screen.
 */
const claimFile: SceneFactory = ({ scene, camera, renderer, pointer }) => {
  renderer.toneMappingExposure = 1.05
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envMap = pmrem.fromScene(room, 0.04).texture
  scene.environment = envMap
  pmrem.dispose()
  room.traverse((o) => (o as THREE.Mesh).geometry?.dispose())

  camera.fov = 32
  const look = new THREE.Vector3(0, 0.05, 0)
  const key = new THREE.DirectionalLight(0xffffff, 1.2)
  key.position.set(2, 4, 5)
  scene.add(key)
  const rim = new THREE.PointLight(BRAND.mint, 20, 10)
  rim.position.set(-2.5, 1.5, 2)
  scene.add(rim)

  const rig = new THREE.Group()
  scene.add(rig)

  // Document stack: two blank sheets fanned behind the report page
  const DW = 1.6
  const DH = 2.08
  const paperMat = new THREE.MeshPhysicalMaterial({ color: "#f4f8f6", roughness: 0.6, clearcoat: 0.3 })
  const doc = new THREE.Group()
  rig.add(doc)
  ;[
    [-0.16, -0.08, -0.12, -0.12],
    [-0.08, -0.04, -0.06, -0.06],
  ].forEach(([x, y, z, rz]) => {
    const sheet = new THREE.Mesh(new RoundedBoxGeometry(DW, DH, 0.02, 3, 0.03), paperMat)
    sheet.position.set(x, y, z)
    sheet.rotation.z = rz
    doc.add(sheet)
  })
  const page = new THREE.Mesh(new RoundedBoxGeometry(DW, DH, 0.03, 3, 0.03), paperMat)
  doc.add(page)
  const pageFace = new THREE.Mesh(
    new THREE.PlaneGeometry(DW - 0.04, DH - 0.04),
    new THREE.MeshBasicMaterial({ map: claimReportTexture(renderer), toneMapped: false }),
  )
  pageFace.position.z = 0.016
  doc.add(pageFace)
  // Arrival flash across the page
  const flash = new THREE.Mesh(
    new THREE.PlaneGeometry(DW - 0.04, DH - 0.04),
    new THREE.MeshBasicMaterial({
      color: BRAND.mint,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  flash.position.z = 0.018
  doc.add(flash)

  // "Approved" seal on the page corner
  const seal = new THREE.Group()
  const sealDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.06, 48),
    new THREE.MeshPhysicalMaterial({
      color: BRAND.emerald,
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 1,
      emissive: BRAND.emerald,
      emissiveIntensity: 0.25,
    }),
  )
  sealDisc.rotation.x = Math.PI / 2
  seal.add(sealDisc)
  const checkPath = new THREE.CurvePath<THREE.Vector3>()
  checkPath.add(new THREE.LineCurve3(new THREE.Vector3(-0.1, 0.0, 0), new THREE.Vector3(-0.03, -0.08, 0)))
  checkPath.add(new THREE.LineCurve3(new THREE.Vector3(-0.03, -0.08, 0), new THREE.Vector3(0.12, 0.08, 0)))
  const sealCheck = new THREE.Mesh(
    new THREE.TubeGeometry(checkPath, 24, 0.025, 10, false),
    new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3 }),
  )
  sealCheck.position.z = 0.035
  seal.add(sealCheck)
  const sealRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.01, 8, 64),
    new THREE.MeshBasicMaterial({ color: BRAND.mint, transparent: true, toneMapped: false }),
  )
  seal.add(sealRing)
  seal.position.set(DW / 2 - 0.12, DH / 2 - 0.18, 0.08)
  doc.add(seal)

  // Evidence orbiting the document (the same 3D icon models used across the site)
  const evidenceKeys = ["photos", "map", "storm", "squares"] as const
  const evidence = evidenceKeys.map((k, i) => {
    const icon = buildIcon(k, 0.46)
    icon.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.material && !Array.isArray(m.material)) m.material = m.material.clone() // own copies → safe to dispose
    })
    rig.add(icon)
    return { icon, phase: (i / evidenceKeys.length) * Math.PI * 2 }
  })

  // Orbit path + drifting dust
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.006, 8, 160),
    new THREE.MeshBasicMaterial({ color: BRAND.mint, transparent: true, opacity: 0.35, toneMapped: false }),
  )
  orbit.rotation.x = Math.PI / 2 - 0.32
  rig.add(orbit)
  const DUST = 140
  const dustPos = new Float32Array(DUST * 3)
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 7
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 4.5
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.04,
      map: dotTexture(),
      color: BRAND.mint,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  scene.add(dust)

  // Timeline: every CYCLE seconds one evidence piece leaves the orbit and
  // flies into the page, then returns to its slot.
  const CYCLE = 2.4
  const FLY = 1.1
  const tmp = new THREE.Vector3()
  const target = new THREE.Vector3(0, 0, 0.1)

  return {
    resize() {
      const distance = camera.aspect < 0.9 ? 9.8 : 8
      camera.position.set(0, 0.45, distance)
      camera.lookAt(look)
    },
    update(t, dt) {
      const intro = easeOut(t / 1.6)

      rig.rotation.y = -0.32 + Math.sin(t * 0.35) * 0.12 + pointer.x * 0.25
      rig.rotation.x = 0.06 - pointer.y * 0.1
      rig.position.x = -0.2
      rig.position.y = (1 - intro) * -0.6 + Math.sin(t * 0.9) * 0.05
      rig.scale.setScalar(0.85 + intro * 0.15)

      doc.rotation.z = Math.sin(t * 0.6) * 0.015

      const slot = Math.floor(t / CYCLE)
      const local = t - slot * CYCLE
      const active = slot % evidence.length
      let flashK = 0

      evidence.forEach((e, i) => {
        const a = e.phase + t * 0.45
        tmp.set(Math.cos(a) * 1.95, Math.sin(a) * 1.95 * Math.sin(0.32) + 0.05, Math.sin(a) * 1.95 * Math.cos(0.32) * 0.6)
        let k = 0
        if (i === active && local < FLY) k = Math.sin((local / FLY) * Math.PI) // out and back
        e.icon.position.copy(tmp).lerp(target, easeOut(k) * 0.92)
        e.icon.scale.setScalar((0.9 + 0.1 * Math.sin(t * 2 + i)) * (1 - k * 0.55) * intro)
        e.icon.rotation.set(0.25, -0.5 + Math.sin(t * 0.8 + i) * 0.35 + k * Math.PI, 0)
        if (i === active) flashK = Math.max(0, Math.sin(((local - FLY * 0.45) / 0.5) * Math.PI)) * (local > FLY * 0.45 && local < FLY * 0.45 + 0.5 ? 1 : 0)
      })

      ;(flash.material as THREE.MeshBasicMaterial).opacity = flashK * 0.35
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4)
      seal.scale.setScalar(1 + flashK * 0.18 + pulse * 0.03)
      seal.rotation.z = Math.sin(t * 0.8) * 0.12
      ;(sealRing.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.5
      sealRing.scale.setScalar(1 + pulse * 0.12)

      for (let i = 0; i < DUST; i++) {
        let y = dustPos[i * 3 + 1] + dt * (0.1 + (i % 4) * 0.03)
        if (y > 2.4) y = -2.3
        dustPos[i * 3 + 1] = y
      }
      dustGeo.attributes.position.needsUpdate = true
      dust.position.x = pointer.x * 0.2
    },
    dispose() {
      envMap.dispose()
      scene.environment = null
    },
  }
}

const SCENES = { claimFile, devices } satisfies Record<string, SceneFactory>

export type SceneName = keyof typeof SCENES

/* -------------------------------------------------------------------------- */
/*                                  Runtime                                   */
/* -------------------------------------------------------------------------- */

/** Mounts a scene into `wrap`. Returns a cleanup function. Throws if WebGL is unavailable. */
export function mountScene(name: SceneName, wrap: HTMLElement, progress: { value: number } = { value: 0 }) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%"
  wrap.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  const pointer = new THREE.Vector2()
  const pointerTarget = new THREE.Vector2()
  const pointerInside = { value: false }
  const instance = SCENES[name]({ scene, camera, renderer, pointer, pointerInside, progress })

  const resize = () => {
    const { width, height } = wrap.getBoundingClientRect()
    const w = Math.max(1, width)
    const h = Math.max(1, height)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    instance.resize?.(w, h)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(wrap)

  const onPointer = (e: PointerEvent) => {
    const rect = wrap.getBoundingClientRect()
    pointerInside.value =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    pointerTarget.set(
      THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
      THREE.MathUtils.clamp(-(((e.clientY - rect.top) / rect.height) * 2 - 1), -1, 1),
    )
  }
  window.addEventListener("pointermove", onPointer, { passive: true })

  let raf = 0
  let visible = false
  let last = performance.now()
  let elapsed = 0

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    elapsed += dt
    pointer.lerp(pointerTarget, 0.06)
    instance.update(elapsed, dt)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  const setRunning = (run: boolean) => {
    if (run && !raf) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    } else if (!run && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  // Render one frame right away so the scene never pops in blank.
  instance.update(0, 0)
  renderer.render(scene, camera)

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    setRunning(visible && !document.hidden)
  })
  io.observe(wrap)
  const onVisibility = () => setRunning(visible && !document.hidden)
  document.addEventListener("visibilitychange", onVisibility)

  return () => {
    setRunning(false)
    io.disconnect()
    ro.disconnect()
    window.removeEventListener("pointermove", onPointer)
    document.removeEventListener("visibilitychange", onVisibility)
    instance.dispose?.()

    scene.traverse((obj) => {
      const o = obj as THREE.Mesh
      o.geometry?.dispose()
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
      for (const m of mats) {
        ;(m as THREE.PointsMaterial).map?.dispose()
        m.dispose()
      }
    })
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }
}
