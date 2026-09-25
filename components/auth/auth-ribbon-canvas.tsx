"use client"

import { useEffect, useRef } from "react"

/**
 * Full-bleed WebGL ribbon behind the auth form.
 * One fragment shader, no libraries — 44 parallel lines in 3 brand greens,
 * sweeping in from the lower right then undulating forever.
 */
const VERT = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform float u_time;
out vec4 fragColor;

/* Brand greens: deep forest → emerald → mint */
vec3 greenA() { return vec3(0.024, 0.216, 0.157); } /* #063728 */
vec3 greenB() { return vec3(0.071, 0.718, 0.416); } /* #12b76a */
vec3 greenC() { return vec3(0.416, 0.910, 0.690); } /* #6ae8b0 */

vec3 ribbonColor(float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.5) {
    return mix(greenA(), greenB(), t * 2.0);
  }
  return mix(greenB(), greenC(), (t - 0.5) * 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / max(u_res.y, 1.0);

  /* Origin lower-right: x grows leftward for the sweep feel */
  vec2 p = vec2((1.0 - uv.x) * aspect, uv.y);
  float t = u_time * 0.22;

  /* Entrance: ribbon slides in from lower-right over ~2.4s then stays */
  float enter = smoothstep(0.0, 2.4, u_time);

  /* Flowing centerline — gentle multi-frequency undulation */
  float path =
    0.18
    + 0.11 * sin(p.x * 2.15 + t)
    + 0.055 * sin(p.x * 4.6 - t * 1.35)
    + 0.028 * sin(p.x * 9.2 + t * 0.7);

  /* Bias path upward as it travels left (diagonal sweep) */
  path += p.x * 0.12;
  path = mix(path - 0.55, path, enter);

  float d = p.y - path;
  float halfW = mix(0.0, 0.195, enter);

  /* Soft ribbon envelope */
  float envelope = 1.0 - smoothstep(halfW * 0.92, halfW, abs(d));
  envelope *= smoothstep(0.0, 0.04, halfW);

  /* 44 parallel strands across the ribbon width */
  const float LINES = 44.0;
  float across = (d / max(halfW, 1e-4) + 1.0) * 0.5; /* 0..1 across ribbon */
  float strand = across * LINES;
  float id = floor(strand);
  float f = fract(strand);

  /* Thin fiber with soft glow */
  float core = smoothstep(0.42, 0.18, abs(f - 0.5));
  float glow = smoothstep(0.55, 0.0, abs(f - 0.5)) * 0.35;
  float line = core + glow;

  /* Fade strand ends along the sweep for a taper */
  float taper = smoothstep(0.0, 0.12, p.x) * smoothstep(2.8, 1.4, p.x);

  float shadeT = id / (LINES - 1.0);
  /* Flip so mint sits on the inner/lower edge like yellow in the reference */
  shadeT = 1.0 - shadeT;
  vec3 col = ribbonColor(shadeT);

  /* Slight per-strand brightness variation */
  float flicker = 0.85 + 0.15 * sin(id * 1.7 + t * 2.0);
  col *= flicker;

  float alpha = envelope * line * taper;
  /* Dark canvas behind — near black with a hint of forest */
  vec3 bg = vec3(0.02, 0.04, 0.035);
  vec3 outCol = mix(bg, col, clamp(alpha * 1.35, 0.0, 1.0));

  /* Soft vignette so the form card stays readable in the center */
  vec2 vc = uv - 0.5;
  float vignette = smoothstep(0.95, 0.25, dot(vc, vc) * 2.8);
  outCol = mix(bg, outCol, 0.55 + 0.45 * vignette);

  fragColor = vec4(outCol, 1.0);
}`

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[auth-ribbon]", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function AuthRibbonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    })
    if (!gl) return

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[auth-ribbon]", gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const loc = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")

    let raf = 0
    let running = true
    const start = performance.now()

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const draw = (now: number) => {
      if (!running) return
      const elapsed = reduceMotion ? 2.5 : (now - start) / 1000
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!reduceMotion) {
        raf = requestAnimationFrame(draw)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    raf = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 size-full"
    />
  )
}
