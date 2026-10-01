"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"
import * as THREE from "three"

import { cn } from "@/lib/utils"

/** Brand greens — forest → emerald → mint */
const COLORS = [
  new THREE.Color("#0a4b37"),
  new THREE.Color("#12b76a"),
  new THREE.Color("#6ae8b0"),
  new THREE.Color("#2f9e6e"),
  new THREE.Color("#8ce0b0"),
]

type Orb = {
  mesh: THREE.Mesh
  base: THREE.Vector3
  speed: number
  phase: number
  amp: number
}

/**
 * Soft Three.js ambient field for the hero — floating translucent orbs
 * in brand greens. Sits behind the phone; pointer-events none.
 * No-ops under prefers-reduced-motion.
 */
export function HeroAmbientCanvas({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduceMotion) return

    const wrap = wrapRef.current
    if (!wrap) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    wrap.appendChild(renderer.domElement)

    const light = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(light)
    const key = new THREE.DirectionalLight(0xb8f0d0, 0.55)
    key.position.set(2, 3, 4)
    scene.add(key)

    const geometry = new THREE.SphereGeometry(1, 24, 24)
    const orbs: Orb[] = []
    const count = 18

    for (let i = 0; i < count; i++) {
      const color = COLORS[i % COLORS.length]
      const material = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.08 + Math.random() * 0.1,
        roughness: 0.55,
        metalness: 0.05,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geometry, material)
      const scale = 0.12 + Math.random() * 0.38
      mesh.scale.setScalar(scale)

      // Bias toward right / behind phone
      const x = -0.4 + Math.random() * 3.4
      const y = -2.2 + Math.random() * 4.4
      const z = -2.5 + Math.random() * 2.2
      mesh.position.set(x, y, z)
      scene.add(mesh)

      orbs.push({
        mesh,
        base: mesh.position.clone(),
        speed: 0.18 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        amp: 0.12 + Math.random() * 0.22,
      })
    }

    // Soft connecting line arcs (subtle depth)
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#12b76a"),
      transparent: true,
      opacity: 0.08,
    })
    const lineGeos: THREE.BufferGeometry[] = []
    for (let i = 0; i < 4; i++) {
      const points = [
        new THREE.Vector3(-0.2 + Math.random() * 2.8, -1.5 + Math.random() * 3, -1.5),
        new THREE.Vector3(-0.2 + Math.random() * 2.8, -1.5 + Math.random() * 3, -0.8),
      ]
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      lineGeos.push(geo)
      scene.add(new THREE.Line(geo, lineMat))
    }

    let raf = 0
    let running = true
    const clock = new THREE.Clock()

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect()
      const w = Math.max(1, width)
      const h = Math.max(1, height)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = "100%"
      renderer.domElement.style.height = "100%"
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const tick = () => {
      if (!running) return
      const t = clock.getElapsedTime()

      for (const orb of orbs) {
        orb.mesh.position.x =
          orb.base.x + Math.sin(t * orb.speed + orb.phase) * orb.amp
        orb.mesh.position.y =
          orb.base.y + Math.cos(t * orb.speed * 0.85 + orb.phase) * orb.amp * 1.15
        orb.mesh.position.z =
          orb.base.z + Math.sin(t * orb.speed * 0.55 + orb.phase * 0.7) * orb.amp * 0.4
        const mat = orb.mesh.material as THREE.MeshStandardMaterial
        mat.opacity = 0.07 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.7 + orb.phase))
      }

      camera.position.x = Math.sin(t * 0.08) * 0.15
      camera.position.y = Math.cos(t * 0.06) * 0.1
      camera.lookAt(0.8, 0, 0)

      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      running = false
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      for (const orb of orbs) {
        ;(orb.mesh.material as THREE.Material).dispose()
        scene.remove(orb.mesh)
      }
      geometry.dispose()
      for (const geo of lineGeos) geo.dispose()
      lineMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === wrap) {
        wrap.removeChild(renderer.domElement)
      }
    }
  }, [reduceMotion])

  if (reduceMotion) return null

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] overflow-hidden",
        className,
      )}
    />
  )
}
