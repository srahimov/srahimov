import { useEffect, useRef } from 'react'

// Distance bands (fraction of the available radius) — nodes cycle through them so
// neighbours sit at different distances from the center.
const RINGS = [0.45, 0.95, 0.7]

// Place nodes around the center, then push apart any that overlap.
function layout(count, w, h, d, centerD, gap) {
  const cx = w / 2
  const cy = h / 2
  const pad = d / 2 + 12
  const rx = w / 2 - pad
  const ry = h / 2 - pad
  const minR = centerD / 2 + d / 2 + gap
  const minT = Math.min(0.9, minR / Math.min(rx, ry))

  const nodes = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.08 : -0.08)
    const t = minT + RINGS[i % RINGS.length] * (1 - minT)
    return { x: cx + Math.cos(a) * rx * t, y: cy + Math.sin(a) * ry * t }
  })

  const minDist = d + gap
  for (let iter = 0; iter < 400; iter++) {
    let moved = false
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const A = nodes[i]
        const B = nodes[j]
        let dx = B.x - A.x
        let dy = B.y - A.y
        const dist = Math.hypot(dx, dy) || 0.01
        if (dist < minDist) {
          const push = (minDist - dist) / 2
          dx /= dist
          dy /= dist
          A.x -= dx * push
          A.y -= dy * push
          B.x += dx * push
          B.y += dy * push
          moved = true
        }
      }
    }
    for (const n of nodes) {
      const dx = n.x - cx
      const dy = n.y - cy
      const dist = Math.hypot(dx, dy) || 0.01
      if (dist < minR) {
        n.x = cx + (dx / dist) * minR
        n.y = cy + (dy / dist) * minR
        moved = true
      }
      n.x = Math.min(w - pad, Math.max(pad, n.x))
      n.y = Math.min(h - pad, Math.max(pad, n.y))
    }
    if (!moved) break
  }
  return nodes
}

export default function SkillGraph({ center, skills }) {
  const wrapRef = useRef(null)
  const centerRef = useRef(null)
  const nodeRefs = useRef([])
  const lineRefs = useRef([])
  const sparkRefs = useRef([])

  useEffect(() => {
    const wrap = wrapRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let homes = []
    let size = { w: 0, h: 0, d: 0, amp: 0 }
    let frame = 0
    let visible = true

    // Per-node drift: slow, out-of-phase wandering around each home position.
    const drift = skills.map((_, i) => ({
      sx: 0.18 + ((i * 37) % 10) / 50,
      sy: 0.16 + ((i * 53) % 10) / 50,
      px: i * 1.7,
      py: i * 2.3,
      spark: 0.12 + ((i * 29) % 10) / 80,
    }))

    const measure = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      const d = nodeRefs.current[0]?.offsetWidth || 96
      const centerD = centerRef.current?.offsetWidth || 150
      const amp = w < 600 ? 4 : 9
      size = { w, h, d, amp }
      homes = layout(skills.length, w, h, d, centerD, amp * 2 + 8)
    }

    const render = (time) => {
      const t = time / 1000
      const { w, h, d, amp } = size
      const cx = w / 2
      const cy = h / 2
      homes.forEach((home, i) => {
        const m = drift[i]
        const x = home.x + (reduceMotion ? 0 : Math.sin(t * m.sx + m.px) * amp)
        const y = home.y + (reduceMotion ? 0 : Math.cos(t * m.sy + m.py) * amp)
        const node = nodeRefs.current[i]
        if (node) node.style.transform = `translate(${x - d / 2}px, ${y - d / 2}px)`
        const line = lineRefs.current[i]
        if (line) {
          line.setAttribute('x1', cx)
          line.setAttribute('y1', cy)
          line.setAttribute('x2', x)
          line.setAttribute('y2', y)
        }
        const spark = sparkRefs.current[i]
        if (spark) {
          const p = reduceMotion ? 0.5 : (t * m.spark + i / skills.length) % 1
          spark.setAttribute('cx', cx + (x - cx) * p)
          spark.setAttribute('cy', cy + (y - cy) * p)
          spark.setAttribute('opacity', Math.sin(p * Math.PI) * 0.9)
        }
      })
    }

    const tick = (time) => {
      render(time)
      if (visible && !reduceMotion) frame = requestAnimationFrame(tick)
    }

    measure()
    render(performance.now())
    wrap.classList.add('is-ready')
    if (!reduceMotion) frame = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      measure()
      render(performance.now())
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible && !reduceMotion) frame = requestAnimationFrame(tick)
    })
    io.observe(wrap)

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
    }
  }, [skills])

  const highlight = (i, on) => lineRefs.current[i]?.classList.toggle('is-hot', on)

  return (
    <div className="skill-graph" ref={wrapRef}>
      <svg className="skill-lines" aria-hidden="true">
        {skills.map((s, i) => (
          <line key={s} ref={(el) => (lineRefs.current[i] = el)} />
        ))}
        {skills.map((s, i) => (
          <circle key={s} className="skill-spark" r="2.5" ref={(el) => (sparkRefs.current[i] = el)} />
        ))}
      </svg>

      <div className="skill-center" ref={centerRef}>
        <span className="skill-center-ring" aria-hidden="true" />
        <span className="skill-center-ring delay" aria-hidden="true" />
        <span className="skill-center-label">{center}</span>
      </div>

      <ul className="skill-nodes" aria-label="Skills">
        {skills.map((s, i) => (
          <li
            key={s}
            className="skill-node"
            ref={(el) => (nodeRefs.current[i] = el)}
            onMouseEnter={() => highlight(i, true)}
            onMouseLeave={() => highlight(i, false)}
          >
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
