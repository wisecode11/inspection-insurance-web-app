"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

import type { AuthSceneState } from "@/components/auth/auth-scene-context"
import { cn } from "@/lib/utils"

const TAU = Math.PI * 2
const MINT = new THREE.Color("#6ae8b0")
const AMBER = new THREE.Color("#fdb022")
const CORAL = new THREE.Color("#ff7a6b")

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))
const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/* ─────────────── Evidence cards: the claim story, in field photos ─────────────── */

type Evidence = {
  src: string
  title: string
  detail: string
  /** Damage markers in UV space: x, y (0 = bottom), radius. */
  marks: [number, number, number][]
}

const EVIDENCE: Evidence[] = [
  { src: "/marketing/journey-capture.jpg", title: "Field capture", detail: "Inspector app · GPS-stamped", marks: [[0.62, 0.36, 0.05], [0.84, 0.22, 0.04], [0.7, 0.12, 0.035]] },
  { src: "/images/roof-replace-a.jpg", title: "Shingle loss", detail: "Hip ridge · 3 areas flagged", marks: [[0.7, 0.42, 0.06], [0.42, 0.34, 0.05], [0.55, 0.18, 0.04]] },
  { src: "/marketing/journey-verify.jpg", title: "Damage verified", detail: "On-site confirmation", marks: [[0.3, 0.2, 0.05], [0.18, 0.36, 0.04], [0.48, 0.5, 0.035]] },
  { src: "/images/aerial-roofs.jpg", title: "Drone survey", detail: "Aerial pass · Block 12", marks: [[0.28, 0.78, 0.05], [0.66, 0.66, 0.045], [0.5, 0.2, 0.04]] },
  { src: "/images/roof-replace-b.jpg", title: "Repair crew", detail: "Decking replacement", marks: [[0.3, 0.32, 0.05], [0.62, 0.3, 0.045], [0.82, 0.2, 0.04]] },
  { src: "/images/hero-roof.jpg", title: "Property record", detail: "2-storey residential", marks: [[0.56, 0.6, 0.05], [0.42, 0.66, 0.04], [0.72, 0.62, 0.04]] },
  { src: "/marketing/journey-send.jpg", title: "Report sent", detail: "Delivered to carrier", marks: [[0.7, 0.5, 0.05], [0.66, 0.34, 0.04], [0.28, 0.4, 0.035]] },
  { src: "/images/roof-shingles.jpg", title: "Front elevation", detail: "Roof line & flashing", marks: [[0.5, 0.7, 0.05], [0.66, 0.5, 0.04], [0.36, 0.48, 0.035]] },
]

/* Line glyphs (24×24 grid) for the floating icons — drawn with no background. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`

const GLYPHS: string[][] = [
  ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z", circle(12, 13, 3)],
  ["M9.5 10h5v4h-5z", "M9.5 10L6.5 7", "M14.5 10l3-3", "M9.5 14l-3 3", "M14.5 14l3 3", circle(5, 6, 2.6), circle(19, 6, 2.6), circle(5, 18, 2.6), circle(19, 18, 2.6)],
  ["M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z", "M14.5 12.5l2-2", "M11.5 9.5l2-2", "M8.5 6.5l2-2", "M17.5 15.5l2-2"],
  ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"],
  ["M15 12l-8.373 8.373a1 1 0 1 1-3-3L12 9", "M18 15l4-4", "M21.5 11.5l-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"],
  [circle(11, 11, 7), "M21 21l-4.6-4.6"],
  ["M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5", "M14 6a6 6 0 0 1 6 6v3", "M4 15v-3a6 6 0 0 1 6-6", "M3 15h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"],
  ["M8 2.5L6 21.5", "M16 2.5l2 19", "M7.6 7h8.8", "M7.2 11h9.6", "M6.8 15h10.4"],
  ["M8 2h8a1 1 0 0 1 1 1v2H7V3a1 1 0 0 1 1-1z", "M17 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1", "M9 14l2 2 4-4"],
  [circle(12, 10, 3), "M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"],
]
const CHECK_GLYPH = [circle(12, 12, 10), "M8 12.5l2.7 2.7L16.5 9.5"]

function glyphTexture(paths: string[], color: string, glow: string) {
  const S = 128
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = S
  const ctx = canvas.getContext("2d")!
  ctx.translate(S * 0.16, S * 0.16)
  ctx.scale((S * 0.68) / 24, (S * 0.68) / 24)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  // Soft glow pass, then a crisp stroke on top.
  ctx.shadowColor = glow
  ctx.shadowBlur = 14
  ctx.strokeStyle = glow
  ctx.lineWidth = 2
  for (const d of paths) ctx.stroke(new Path2D(d))
  ctx.shadowBlur = 0
  ctx.strokeStyle = color
  ctx.lineWidth = 1.7
  for (const d of paths) ctx.stroke(new Path2D(d))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function radialTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.35, "rgba(255,255,255,0.28)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

/* ─────────────── Card shader: rounded glass photo + scan + markers ─────────────── */

const CARD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const CARD_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform mat3 uMapTransform;
  uniform float uHasMap;
  uniform float uAspect;
  uniform float uScan;
  uniform float uMark;
  uniform float uVerified;
  uniform float uHover;
  uniform float uDim;
  uniform float uIntro;
  uniform float uTime;
  uniform vec3 uAccent;
  uniform vec3 uMarkColor;
  uniform vec3 uMarks[3];
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 b = vec2(uAspect, 1.0) * 0.5 - 0.07;
    float d = length(max(abs(p) - b, 0.0)) - 0.07;
    float alpha = 1.0 - smoothstep(-0.002, 0.004, d);
    if (alpha < 0.01) discard;

    vec3 col;
    if (gl_FrontFacing) {
      col = mix(vec3(0.06, 0.16, 0.13), texture2D(uMap, (uMapTransform * vec3(vUv, 1.0)).xy).rgb, uHasMap);
      // Cinematic grade: a touch desaturated and cool, lifted on hover.
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(lum), col, 0.82) * vec3(0.94, 1.0, 0.98);
      col *= mix(1.0, 0.32, uDim) * (0.92 + uHover * 0.12);

      // Scan line sweeping top → bottom with a faint trail and grid.
      float y = 1.0 - vUv.y;
      float band = exp(-pow((y - uScan) * 34.0, 2.0));
      float trail = smoothstep(uScan - 0.22, uScan, y) * step(y, uScan);
      vec2 grid = abs(fract(vUv * vec2(uAspect, 1.0) * 14.0) - 0.5);
      float gridLine = smoothstep(0.47, 0.5, max(grid.x, grid.y));
      col += uAccent * (band * 1.1 + trail * (0.1 + gridLine * 0.18));

      // Damage markers: pulsing rings + centre dot.
      for (int i = 0; i < 3; i++) {
        vec3 m = uMarks[i];
        float dd = length((vUv - m.xy) * vec2(uAspect, 1.0));
        float r = m.z * (0.7 + 0.3 * uMark) * (1.0 + 0.08 * sin(uTime * 4.0 + float(i)));
        float ring = smoothstep(0.009, 0.0, abs(dd - r));
        float dot_ = smoothstep(0.012, 0.004, dd);
        float halo = smoothstep(r * 1.8, r, dd) * 0.25;
        col = mix(col, uMarkColor, clamp((ring + dot_) * uMark, 0.0, 1.0));
        col += uMarkColor * halo * uMark;
      }
    } else {
      // Back of the card: a dim, mirrored glimpse of the photo through tinted glass.
      vec2 backUv = vec2(1.0 - vUv.x, vUv.y);
      vec3 photo = mix(vec3(0.06, 0.16, 0.13), texture2D(uMap, (uMapTransform * vec3(backUv, 1.0)).xy).rgb, uHasMap);
      col = mix(vec3(0.02, 0.08, 0.06), photo * vec3(0.55, 0.85, 0.75), 0.38) + uAccent * 0.03;
    }

    // Edge light: white glass rim, mint once verified, brighter on hover.
    float edge = 1.0 - smoothstep(0.0, 0.014, abs(d + 0.006));
    vec3 rim = mix(vec3(0.85), uAccent, uVerified);
    col += rim * edge * (0.35 + uVerified * 0.5 + uHover * 0.6);

    gl_FragColor = vec4(col, alpha * uIntro);
  }
`

const DUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (10.0 / -mv.z);
    vAlpha = aAlpha;
  }
`
const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha);
  }
`

/**
 * "Evidence ring" for the auth pages: real field photos as glass cards on a
 * slowly turning 3D ring, each swept by an AI scan that drops damage
 * markers. Line-art tool icons (no backgrounds) drift through the depth
 * around it. Cards earn a verified badge as the form fills in; while the
 * request verifies the ring speeds up and closes in (the claim file
 * assembling). Hover a card to pull it forward with its caption.
 */
export default function EvidenceScene({
  state,
  side,
  overhang = 0,
  className,
}: {
  state: AuthSceneState
  side: "left" | "right"
  overhang?: number
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef(state)
  const layoutRef = useRef({ side, overhang })
  const kickRef = useRef<(() => void) | null>(null)
  const errorRef = useRef(0)

  useEffect(() => {
    if (state.status === "error" && stateRef.current.status !== "error") errorRef.current = 1
    stateRef.current = state
    kickRef.current?.()
  }, [state])

  useEffect(() => {
    layoutRef.current = { side, overhang }
    kickRef.current?.()
  }, [side, overhang])

  useEffect(() => {
    const wrap = wrapRef.current
    const label = labelRef.current
    if (!wrap || !label) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const compact = wrap.clientWidth < 768

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      return // No WebGL — the aurora backdrop remains.
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1.3 : 1.75)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.style.cssText = "display:block;width:100%;height:100%;opacity:0;transition:opacity 1s ease"
    wrap.prepend(canvas)

    const disposables: { dispose: () => void }[] = []
    const keep = <T extends { dispose: () => void }>(item: T) => (disposables.push(item), item)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80)
    const world = new THREE.Group()
    scene.add(world)

    /* Ring of evidence cards */
    const R = 3.0
    const CARD_H = 1.34
    const CARD_W = CARD_H * 1.5
    const ring = new THREE.Group()
    ring.rotation.x = 0.06
    world.add(ring)

    const loader = new THREE.TextureLoader()
    const cardGeo = keep(new THREE.PlaneGeometry(CARD_W, CARD_H))
    const checkTex = keep(glyphTexture(CHECK_GLYPH, "#d1fae5", "#6ae8b0"))
    const badgeGeo = keep(new THREE.PlaneGeometry(0.3, 0.3))
    const cards = EVIDENCE.map((ev, index) => {
      const uniforms = {
        uMap: { value: null as THREE.Texture | null },
        uMapTransform: { value: new THREE.Matrix3() },
        uHasMap: { value: 0 },
        uAspect: { value: CARD_W / CARD_H },
        uScan: { value: -1 },
        uMark: { value: 0 },
        uVerified: { value: 0 },
        uHover: { value: 0 },
        uDim: { value: 0 },
        uIntro: { value: 0 },
        uTime: { value: 0 },
        uAccent: { value: MINT.clone() },
        uMarkColor: { value: AMBER.clone() },
        uMarks: { value: ev.marks.map(([x, y, r]) => new THREE.Vector3(x, y, r)) },
      }
      const texture = keep(
        loader.load(ev.src, (t) => {
          // Cover-fit the photo into the 3:2 card.
          const img = t.image as HTMLImageElement
          const imgAspect = img.width / img.height
          const cardAspect = CARD_W / CARD_H
          if (imgAspect > cardAspect) {
            t.repeat.set(cardAspect / imgAspect, 1)
            t.offset.set((1 - t.repeat.x) / 2, 0)
          } else {
            t.repeat.set(1, imgAspect / cardAspect)
            t.offset.set(0, (1 - t.repeat.y) / 2)
          }
          t.updateMatrix()
          uniforms.uMapTransform.value.copy(t.matrix)
          uniforms.uHasMap.value = 1
          kick()
        }),
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      uniforms.uMap.value = texture
      const material = keep(
        new THREE.ShaderMaterial({
          vertexShader: CARD_VERT,
          fragmentShader: CARD_FRAG,
          uniforms,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: true,
        }),
      )
      const mesh = new THREE.Mesh(cardGeo, material)
      mesh.userData.card = index

      const badgeMat = keep(
        new THREE.MeshBasicMaterial({ map: checkTex, transparent: true, depthWrite: false, opacity: 0 }),
      )
      const badge = new THREE.Mesh(badgeGeo, badgeMat)
      badge.position.set(CARD_W / 2 - 0.2, CARD_H / 2 - 0.2, 0.01)
      badge.scale.setScalar(0)
      mesh.add(badge)

      const holder = new THREE.Group()
      holder.add(mesh)
      ring.add(holder)
      return { ev, holder, mesh, uniforms, badge, badgeMat, hover: 0, verified: 0, phase: (index / EVIDENCE.length) * TAU }
    })
    const pickables = cards.map((c) => c.mesh)

    /* Floating line icons — no backgrounds */
    const iconTextures = GLYPHS.map((paths) => keep(glyphTexture(paths, "#ecfdf5", "#6ae8b0")))
    const ICONS = compact ? 10 : 18
    const icons = Array.from({ length: ICONS }, (_, i) => {
      const material = keep(
        new THREE.SpriteMaterial({ map: iconTextures[i % iconTextures.length], transparent: true, depthWrite: false, opacity: 0 }),
      )
      const sprite = new THREE.Sprite(material)
      const size = 0.32 + Math.random() * 0.26
      sprite.scale.setScalar(size)
      world.add(sprite)
      return {
        sprite,
        material,
        size,
        angle: Math.random() * TAU,
        radius: 3.9 + Math.random() * 1.8,
        // Above or below the card band, so icons never sit on the photos.
        y: i % 2 ? THREE.MathUtils.randFloat(1.05, 1.9) : THREE.MathUtils.randFloat(-1.75, -1.0),
        speed: (0.04 + Math.random() * 0.06) * (Math.random() < 0.5 ? -1 : 1),
        bob: Math.random() * TAU,
      }
    })

    /* Glow under the ring + dust */
    const glowTex = keep(radialTexture())
    const glowMat = keep(
      new THREE.MeshBasicMaterial({ map: glowTex, color: MINT, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }),
    )
    const glow = new THREE.Mesh(keep(new THREE.PlaneGeometry(9, 9)), glowMat)
    glow.rotation.x = -Math.PI / 2
    glow.position.y = -1.05
    world.add(glow)
    const coreMat = keep(
      new THREE.SpriteMaterial({ map: glowTex, color: MINT, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }),
    )
    const core = new THREE.Sprite(coreMat)
    core.scale.setScalar(5)
    core.position.z = -0.5
    world.add(core)

    const DUST = compact ? 60 : 140
    const dustPos = new Float32Array(DUST * 3)
    const dustSize = new Float32Array(DUST)
    const dustAlpha = new Float32Array(DUST)
    for (let i = 0; i < DUST; i++) {
      dustPos.set([THREE.MathUtils.randFloatSpread(12), THREE.MathUtils.randFloatSpread(7), THREE.MathUtils.randFloat(-6, 2)], i * 3)
      dustSize[i] = 2 + Math.random() * 6
      dustAlpha[i] = 0.06 + Math.random() * 0.22
    }
    const dustGeo = keep(new THREE.BufferGeometry())
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
    dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dustSize, 1))
    dustGeo.setAttribute("aAlpha", new THREE.BufferAttribute(dustAlpha, 1))
    const dustMat = keep(
      new THREE.ShaderMaterial({
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        uniforms: { uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color("#a7f3d0") } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    /* Sizing */
    let rect = wrap.getBoundingClientRect()
    let distance = 10
    let worldWidth = 8
    let lookY = 0
    const resize = () => {
      const w = Math.max(1, wrap.clientWidth)
      const h = Math.max(1, wrap.clientHeight)
      rect = wrap.getBoundingClientRect()
      camera.aspect = w / h
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const visibleAspect = camera.aspect * (1 - layoutRef.current.overhang)
      const tall = h >= 480 && !compact
      // Ring is ~6.6 units wide; leave the lower part of tall panels for the headline.
      distance = THREE.MathUtils.clamp(Math.max((tall ? 2.75 : 2.1) / tanHalf, 4.5 / (tanHalf * visibleAspect)), 7, 22)
      worldWidth = 2 * tanHalf * distance * camera.aspect
      lookY = tall ? -0.5 : 0
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      kick()
    }

    /* Pointer */
    const ndc = new THREE.Vector2()
    const smooth = new THREE.Vector2()
    let pointerInside = false
    const raycaster = new THREE.Raycaster()
    const onPointer = (event: PointerEvent) => {
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      pointerInside = event.pointerType === "mouse" && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1
      kick()
    }
    const onLeave = () => (pointerInside = false)
    const onScroll = () => (rect = wrap.getBoundingClientRect())
    window.addEventListener("pointermove", onPointer, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    window.addEventListener("scroll", onScroll, { passive: true })

    /* Loop */
    let last = performance.now()
    const introStart = performance.now()
    let time = 0
    let intro = reduceMotion ? 10 : 0
    let angle = 0
    let speed = 0.12
    let gather = 0
    let shift = Number.NaN
    let hovered = -1
    let raf = 0
    let visible = true
    let settleUntil = 0
    const tmp = new THREE.Vector3()
    const tint = new THREE.Color()

    const frame = () => {
      raf = 0
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!reduceMotion) {
        time += dt
        intro = (now - introStart) / 1000
      }
      const { progress, status, focus } = stateRef.current
      const verifying = status === "loading"
      errorRef.current = Math.max(0, errorRef.current - dt * 0.6)
      const err = errorRef.current
      tint.copy(MINT).lerp(CORAL, err)

      const { side: s, overhang: o } = layoutRef.current
      const shiftTarget = (s === "left" ? 1 : -1) * (o / 2) * worldWidth
      shift = Number.isNaN(shift) ? shiftTarget : damp(shift, shiftTarget, 3, dt)

      smooth.x = damp(smooth.x, pointerInside ? ndc.x : 0, 2.5, dt)
      smooth.y = damp(smooth.y, pointerInside ? ndc.y : 0, 2.5, dt)
      camera.position.set(shift + smooth.x * 0.6, lookY + 2.1 + smooth.y * 0.45, distance)
      camera.lookAt(shift, lookY, 0)
      world.position.x = shift
      scene.updateMatrixWorld()

      // Hover pick: only cards facing the viewer.
      let nextHovered = -1
      if (pointerInside && !reduceMotion) {
        raycaster.setFromCamera(ndc, camera)
        const hit = raycaster.intersectObjects(pickables, false).find((h) => h.face && h.face.normal.clone().transformDirection(h.object.matrixWorld).dot(raycaster.ray.direction) < 0)
        if (hit) nextHovered = hit.object.userData.card as number
      }
      if (nextHovered !== hovered) {
        hovered = nextHovered
        wrap.style.cursor = hovered >= 0 ? "pointer" : ""
      }
      const anyHover = hovered >= 0 ? 1 : 0

      // Ring motion: drift, faster as the form fills, fast + tight while verifying, paused on hover.
      const targetSpeed = reduceMotion ? 0 : anyHover ? 0 : verifying ? 1.3 : 0.12 + progress * 0.12 + (focus ? 0.04 : 0)
      speed = damp(speed, targetSpeed, 2.5, dt)
      angle += speed * dt
      gather = damp(gather, verifying ? 1 : 0, 2.2, dt)
      ring.rotation.y = -angle + smooth.x * 0.25
      ring.rotation.x = 0.06 - smooth.y * 0.08
      ring.rotation.z = reduceMotion ? 0 : Math.sin(time * 0.25) * 0.03

      const verifiedCount = verifying ? cards.length : Math.floor(progress * cards.length + 0.001)
      const scanPeriod = verifying ? 1.6 : 5.5

      cards.forEach((card, i) => {
        // Staggered entrance: each card unfolds into its slot.
        const e = smoothstep(0, 1, (intro - 0.25 - i * 0.09) / 0.9)
        const a = card.phase
        const isHovered = hovered === i
        card.hover = damp(card.hover, isHovered ? 1 : 0, 8, dt)
        const radius = THREE.MathUtils.lerp(R, 2.1, gather) * (0.75 + 0.25 * e) + card.hover * 0.55
        const wave = reduceMotion ? 0 : Math.sin(a * 2 + time * 0.7) * 0.16
        card.holder.position.set(Math.sin(a) * radius, wave + card.hover * 0.08 + (1 - e) * -0.6, Math.cos(a) * radius)
        card.holder.rotation.set(0, a, 0)
        card.holder.scale.setScalar((0.86 + 0.14 * e) * (1 + card.hover * 0.12))
        if (err > 0.5) card.holder.position.x += (Math.random() - 0.5) * (err - 0.5) * 0.06

        // Scan cycle, staggered per card.
        const cycle = reduceMotion ? 0.8 : (time / scanPeriod + i * 0.37) % 1
        card.uniforms.uScan.value = cycle * 1.5 - 0.15
        card.uniforms.uMark.value = reduceMotion ? 1 : smoothstep(0.35, 0.55, cycle) * (1 - smoothstep(0.88, 1, cycle))
        card.verified = damp(card.verified, i < verifiedCount ? 1 : 0, 6, dt)
        card.uniforms.uVerified.value = card.verified
        card.uniforms.uHover.value = card.hover
        card.uniforms.uDim.value = damp(card.uniforms.uDim.value, anyHover && !isHovered ? 0.55 : 0, 6, dt)
        card.uniforms.uIntro.value = e
        card.uniforms.uTime.value = time
        card.uniforms.uAccent.value.copy(tint)
        card.uniforms.uMarkColor.value.copy(AMBER).lerp(CORAL, err)

        const pop = card.verified
        card.badge.scale.setScalar(pop < 0.01 ? 0 : 0.6 + 0.4 * pop + Math.sin(Math.min(1, pop) * Math.PI) * 0.25)
        card.badgeMat.opacity = pop
      })

      // Floating icons drift around the ring, swirl inward while verifying.
      icons.forEach((icon, i) => {
        icon.angle += icon.speed * dt * (verifying ? 6 : 1)
        const r = icon.radius * (1 - gather * 0.25)
        const bob = reduceMotion ? 0 : Math.sin(time * 0.8 + icon.bob) * 0.15
        icon.sprite.position.set(Math.sin(icon.angle) * r, icon.y + bob, Math.cos(icon.angle) * r - 0.5)
        // Fade by depth so far icons recede.
        tmp.copy(icon.sprite.position)
        const depth = THREE.MathUtils.clamp((tmp.z + 6) / 8, 0, 1)
        const e = smoothstep(0, 1, (intro - 0.8 - i * 0.05) / 1)
        icon.material.opacity = (0.25 + 0.6 * depth) * e
        icon.material.color.copy(tint).lerp(new THREE.Color("#ffffff"), 0.55)
        icon.sprite.scale.setScalar(icon.size * (0.75 + 0.35 * depth))
      })

      glowMat.color.copy(tint)
      glowMat.opacity = 0.16 + progress * 0.1 + gather * 0.15
      coreMat.color.copy(tint)
      coreMat.opacity = (0.14 + gather * 0.25) * Math.min(1, intro)
      dust.rotation.y = reduceMotion ? 0 : time * 0.012

      // Caption over the hovered card
      const labelIndex = cards.findIndex((c) => c.hover > 0.12)
      if (labelIndex >= 0) {
        const card = cards[labelIndex]
        card.holder.updateMatrixWorld()
        tmp.set(0, CARD_H / 2 + 0.1, 0)
        card.mesh.localToWorld(tmp)
        tmp.project(camera)
        label.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * rect.width}px, ${(-tmp.y * 0.5 + 0.5) * rect.height}px) translate(-50%, -100%)`
        label.style.opacity = String(Math.min(1, card.hover * 1.3))
        if (label.dataset.card !== String(labelIndex)) {
          label.dataset.card = String(labelIndex)
          label.querySelector("[data-title]")!.textContent = card.ev.title
          label.querySelector("[data-detail]")!.textContent = card.ev.detail
        }
        label.querySelector("[data-state]")!.textContent = card.verified > 0.5 ? "Verified" : "Scanning"
      } else {
        label.style.opacity = "0"
      }

      renderer.render(scene, camera)
      if (intro > 0.05) canvas.style.opacity = "1"
      if (visible && (!reduceMotion || performance.now() < settleUntil)) raf = requestAnimationFrame(frame)
    }

    function kick() {
      settleUntil = performance.now() + 1500
      if (!raf && visible) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    kickRef.current = kick

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible"
      if (visible) kick()
    })
    io.observe(wrap)
    const onVisibility = () => {
      visible = document.visibilityState === "visible"
      if (visible) kick()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      kickRef.current = null
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("scroll", onScroll)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return (
    <div ref={wrapRef} aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      <div
        ref={labelRef}
        className="pointer-events-none absolute top-0 left-0 z-10 rounded-2xl border border-white/15 bg-[#04170f]/85 px-3.5 py-2.5 whitespace-nowrap opacity-0 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md transition-opacity duration-150"
      >
        <span className="flex items-center gap-2">
          <span className="block text-[13px] font-semibold tracking-tight text-white" data-title />
          <span className="rounded-full bg-[#6ae8b0]/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6ae8b0] uppercase" data-state />
        </span>
        <span className="mt-0.5 block text-[11px] text-white/60" data-detail />
      </div>
    </div>
  )
}
