import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { OBAMA_QUOTES } from '../data/eras'
import { RX, RZ } from '../model/geometry'
import type { FabricPattern, RugSpec, WallPattern } from '../model/types'

// Textures are shared between meshes. A bounded cache releases GPU resources for
// older entries; Three can upload an evicted texture again if it is still in use.
const cache = new Map<string, CanvasTexture>()
const MAX_TEXTURES = 64
function texture(key: unknown, size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void, repeat = false): CanvasTexture {
  const id = JSON.stringify(key)
  const existing = cache.get(id)
  if (existing) {
    cache.delete(id)
    cache.set(id, existing)
    return existing
  }
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  draw(ctx, size)
  const result = new CanvasTexture(canvas)
  result.colorSpace = SRGBColorSpace
  if (repeat) result.wrapS = result.wrapT = RepeatWrapping
  cache.set(id, result)
  // Large rug canvases are 16 MiB each, so keep fewer of them than tiles.
  if (size === 2048) {
    const rugs = [...cache.keys()].filter(entry => entry.startsWith('["rug",'))
    if (rugs.length > 4) {
      cache.get(rugs[0])?.dispose()
      cache.delete(rugs[0])
    }
  }
  if (cache.size > MAX_TEXTURES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) {
      cache.get(oldest)?.dispose()
      cache.delete(oldest)
    }
  }
  return result
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5
    const radius = i % 2 ? r * 0.42 : r
    const px = x + Math.cos(a) * radius, py = y + Math.sin(a) * radius
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

function ellipseStroke(ctx: CanvasRenderingContext2D, radius: number, color: string, width: number) {
  ctx.beginPath()
  ctx.ellipse(1024, 1024, radius, radius, 0, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

function seal(ctx: CanvasRenderingContext2D, spec: RugSpec) {
  if (spec.seal === 'none') return
  ctx.save()
  ctx.translate(1024, 1024)
  ctx.scale((RZ - 0.45) / (RX - 0.45), 1)
  const tone = spec.seal === 'tone'
  const gold = spec.seal === 'gold'
  const ink = tone ? 'rgba(255,255,255,0.12)' : '#C9A43A'
  ctx.fillStyle = tone ? 'rgba(255,255,255,0.12)' : gold ? '#E2B33C' : '#1B2A5A'
  ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = tone ? ink : '#E2B33C'
  ctx.lineWidth = 8
  ctx.beginPath(); ctx.arc(0, 0, 208, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(0, 0, 168, 0, Math.PI * 2); ctx.stroke()
  if (!tone) {
    const text = 'SEAL OF THE PRESIDENT OF THE UNITED STATES'
    ctx.font = 'bold 15px Georgia, serif'
    ctx.fillStyle = gold ? '#1B2A5A' : '#E2B33C'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (let i = 0; i < text.length; i++) {
      const a = -Math.PI * 0.83 + i * Math.PI * 1.66 / (text.length - 1)
      ctx.save(); ctx.rotate(a); ctx.translate(0, -188); ctx.fillText(text[i], 0, 0); ctx.restore()
    }
  }
  ctx.fillStyle = tone ? ink : gold ? '#1B2A5A' : '#C9A43A'
  ctx.beginPath(); ctx.ellipse(0, 4, 34, 67, 0, 0, Math.PI * 2); ctx.fill()
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(side * 22, -25); ctx.lineTo(side * 137, -80); ctx.lineTo(side * 105, -10); ctx.lineTo(side * 35, 35); ctx.closePath(); ctx.fill()
  }
  ctx.beginPath(); ctx.arc(0, -70, 17, 0, Math.PI * 2); ctx.fill()
  if (!tone && !gold) {
    ctx.fillStyle = '#f6f2e6'; ctx.fillRect(-31, -20, 62, 65)
    ctx.fillStyle = '#b22234'
    for (let x = -27; x < 31; x += 16) ctx.fillRect(x, -20, 8, 65)
    ctx.fillStyle = '#1B2A5A'; ctx.fillRect(-31, -20, 62, 18)
  }
  ctx.restore()
}

export function rugTexture(spec: RugSpec): CanvasTexture {
  return texture(['rug', spec], 2048, ctx => {
    const { base, accent, border, pattern } = spec
    ctx.fillStyle = base; ctx.fillRect(0, 0, 2048, 2048)
    ctx.save()
    ctx.beginPath(); ctx.arc(1024, 1024, 930, 0, Math.PI * 2); ctx.clip()
    if (pattern === 'lattice') {
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.4; ctx.lineWidth = 5
      for (let i = -2048; i <= 4096; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 2048, 2048); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - 2048, 2048); ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (pattern === 'stars') {
      for (let y = 144; y < 2048; y += 160) for (let x = 144; x < 2048; x += 160) star(ctx, x, y, 25, accent)
    } else if (pattern === 'star-ring') {
      for (let i = 0; i < 48; i++) {
        const a = i * Math.PI * 2 / 48
        star(ctx, 1024 + Math.cos(a) * 840, 1024 + Math.sin(a) * 840, 28, accent)
      }
    } else if (pattern === 'sunburst' || pattern === 'sunburst-laurel') {
      ctx.fillStyle = accent
      for (let i = 0; i < 64; i++) {
        const a = i * Math.PI * 2 / 64
        ctx.beginPath(); ctx.moveTo(1024, 1024); ctx.arc(1024, 1024, 930, a, a + Math.PI / 128); ctx.closePath(); ctx.fill()
      }
    }
    ctx.restore()
    if (border.toLowerCase() !== base.toLowerCase() || pattern !== 'plain') {
      ellipseStroke(ctx, 942, pattern === 'sunburst-laurel' ? base : border, 90)
      ellipseStroke(ctx, 894, pattern === 'sunburst-laurel' ? border : accent, 6); ellipseStroke(ctx, 990, pattern === 'sunburst-laurel' ? border : accent, 6)
    }
    if (spec.borderStyle === 'double') {
      ellipseStroke(ctx, 918, accent, 7)
      ellipseStroke(ctx, 966, accent, 7)
    } else if (spec.borderStyle === 'greek-key') {
      ctx.strokeStyle = accent; ctx.lineWidth = 5
      for (let i = 0; i < 100; i++) {
        const a = i * Math.PI * 2 / 100
        ctx.save(); ctx.translate(1024 + Math.cos(a) * 942, 1024 + Math.sin(a) * 942); ctx.rotate(a + Math.PI / 2)
        ctx.beginPath(); ctx.moveTo(-22, -24); ctx.lineTo(18, -24); ctx.lineTo(18, 20); ctx.lineTo(-12, 20); ctx.lineTo(-12, -8); ctx.lineTo(6, -8); ctx.lineTo(6, 8); ctx.stroke(); ctx.restore()
      }
    } else if (spec.borderStyle === 'scallop') {
      ctx.strokeStyle = accent; ctx.lineWidth = 6
      for (let i = 0; i < 100; i++) {
        const a = i * Math.PI * 2 / 100
        ctx.save(); ctx.translate(1024 + Math.cos(a) * 942, 1024 + Math.sin(a) * 942); ctx.rotate(a)
        ctx.beginPath(); ctx.ellipse(0, 0, 22, 28, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke(); ctx.restore()
      }
    }
    if (pattern === 'laurel' || pattern === 'laurel-stars' || pattern === 'sunburst-laurel') {
      ctx.fillStyle = pattern === 'sunburst-laurel' ? border : accent
      for (let i = 0; i < 96; i++) {
        const a = i * Math.PI * 2 / 96
        ctx.save(); ctx.translate(1024 + Math.cos(a) * 942, 1024 + Math.sin(a) * 942); ctx.rotate(a + (i % 2 ? 0.55 : -0.55)); ctx.beginPath(); ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      }
      if (pattern === 'laurel-stars') for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6
        star(ctx, 1024 + Math.cos(a) * 860, 1024 + Math.sin(a) * 860, 28, accent)
      }
    }
    if (pattern === 'quotes') {
      // Fit the text (repeated if short) to one full ring with natural letter spacing.
      const radius = 850
      const circumference = Math.PI * 2 * radius
      const unit = (spec.text.trim() || OBAMA_QUOTES.join(' • ')) + ' • '
      ctx.font = 'bold 40px Georgia, serif'
      const repeats = spec.text.trim() ? Math.max(1, Math.floor(circumference / ctx.measureText(unit).width)) : 1
      const text = unit.repeat(repeats)
      const size = Math.min(64, 40 * circumference / ctx.measureText(text).width)
      ctx.font = `bold ${size.toFixed(1)}px Georgia, serif`
      const scale = circumference / ctx.measureText(text).width
      ctx.fillStyle = accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      let offset = 0
      for (const ch of text) {
        const w = ctx.measureText(ch).width * scale
        const a = -Math.PI / 2 + (offset + w / 2) / radius
        offset += w
        ctx.save(); ctx.translate(1024 + Math.cos(a) * radius, 1024 + Math.sin(a) * radius); ctx.rotate(a + Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore()
      }
    }
    seal(ctx, spec)
  })
}

export function wallTexture(pattern: WallPattern, color: string, accent: string): CanvasTexture {
  return texture(['wall', pattern, color, accent], 512, ctx => {
    ctx.fillStyle = color; ctx.fillRect(0, 0, 512, 512)
    ctx.fillStyle = accent; ctx.strokeStyle = accent
    if (pattern === 'stripe') for (let x = 0; x < 512; x += 128) ctx.fillRect(x, 0, 64, 512)
    if (pattern === 'damask') {
      for (let y = 64; y < 512; y += 128) for (let x = 64; x < 512; x += 128) {
        ctx.beginPath(); ctx.moveTo(x, y - 43); ctx.quadraticCurveTo(x + 13, y - 13, x + 34, y); ctx.quadraticCurveTo(x + 13, y + 13, x, y + 43); ctx.quadraticCurveTo(x - 13, y + 13, x - 34, y); ctx.quadraticCurveTo(x - 13, y - 13, x, y - 43); ctx.closePath(); ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1
      }
    }
    if (pattern === 'panel') {
      ctx.lineWidth = 7; ctx.strokeRect(18, 18, 476, 390); ctx.strokeRect(18, 430, 476, 64)
    }
    if (pattern === 'fleur') {
      for (let y = 64; y < 512; y += 128) for (let x = 64; x < 512; x += 128) {
        ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 0.7
        ctx.beginPath(); ctx.moveTo(0, -40); ctx.bezierCurveTo(28, -18, 8, 2, 0, 12); ctx.bezierCurveTo(-8, 2, -28, -18, 0, -40); ctx.fill()
        for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(side * 45, -12, side * 38, 28, side * 15, 18); ctx.quadraticCurveTo(side * 23, 8, 0, 18); ctx.fill() }
        ctx.fillRect(-22, 20, 44, 6); ctx.restore()
      }
    }
    if (pattern === 'trellis') {
      ctx.lineWidth = 7; ctx.globalAlpha = 0.65
      for (let i = -512; i <= 1024; i += 128) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 512, 512); ctx.moveTo(i, 0); ctx.lineTo(i - 512, 512); ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    if (pattern === 'grasscloth') {
      const random = mulberry32(862)
      for (let y = 0; y < 512; y += 3) {
        ctx.globalAlpha = 0.12 + random() * 0.22; ctx.lineWidth = 1 + random()
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y + random() * 2); ctx.stroke()
      }
      ctx.globalAlpha = 0.15
      for (let x = 0; x < 512; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke() }
      ctx.globalAlpha = 1
    }
  }, true)
}

export function marbleTexture(): CanvasTexture {
  return texture(['marble'], 512, ctx => {
    const random = mulberry32(495)
    ctx.fillStyle = '#f2efe8'; ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 18; i++) {
      const x = random() * 700 - 100
      ctx.strokeStyle = `rgba(117,108,96,${0.05 + random() * 0.12})`
      ctx.lineWidth = 0.7 + random() * 2
      ctx.beginPath(); ctx.moveTo(x, 0)
      ctx.bezierCurveTo(x + 100, 130, x - 100, 300, x + 100, 512); ctx.stroke()
    }
  }, true)
}

export function plankTexture(color: string): CanvasTexture {
  return texture(['plank', color], 512, ctx => {
    const random = mulberry32(187)
    ctx.fillStyle = color; ctx.fillRect(0, 0, 512, 512)
    // One repeat spans a meter, so each plank is about 18 cm wide.
    for (let x = 0; x < 512; x += 92) {
      const shade = random() < 0.5 ? '0,0,0' : '255,255,255'
      ctx.fillStyle = `rgba(${shade},${random() * 0.06})`; ctx.fillRect(x, 0, 91, 512)
      ctx.strokeStyle = 'rgba(25,12,5,0.25)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512)
      const offset = random() * 260
      for (let y = offset; y < 512; y += 260) { ctx.moveTo(x, y); ctx.lineTo(x + 92, y) }
      ctx.stroke()
    }
  }, true)
}

export function fabricTexture(pattern: FabricPattern, color: string, accent: string): CanvasTexture {
  return texture(['fabric', pattern, color, accent], 512, ctx => {
    ctx.fillStyle = color; ctx.fillRect(0, 0, 512, 512)
    ctx.fillStyle = accent
    if (pattern === 'stripe') for (let x = 0; x < 512; x += 128) ctx.fillRect(x, 0, 32, 512)
    if (pattern === 'floral') {
      const random = mulberry32(904)
      for (let i = 0; i < 42; i++) {
        const x = random() * 512, y = random() * 512, r = 5 + random() * 8
        for (let j = 0; j < 5; j++) {
          const a = j * Math.PI * 2 / 5
          ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r, r * 0.55, a, 0, Math.PI * 2); ctx.fill()
        }
      }
    }
  }, true)
}

export function flagTexture(variant: string): CanvasTexture {
  return texture(['flag', variant], 512, ctx => {
    const colors: Record<string, string> = { presidential: '#1B2A5A', army: '#F4F4F4', navy: '#1B2A5A', 'air-force': '#2C5AA0', marines: '#B22234', 'coast-guard': '#F4F4F4', 'space-force': '#1B2A5A' }
    if (variant === 'us') {
      ctx.fillStyle = '#F7F5ED'; ctx.fillRect(0, 0, 512, 512)
      ctx.fillStyle = '#B22234'
      for (let i = 0; i < 13; i += 2) ctx.fillRect(0, i * 512 / 13, 512, 512 / 13)
      ctx.fillStyle = '#1B2A5A'; ctx.fillRect(0, 0, 225, 7 * 512 / 13)
      for (let row = 0; row < 9; row++) for (let col = 0; col < (row % 2 ? 5 : 6); col++) star(ctx, 20 + col * 36 + (row % 2 ? 18 : 0), 16 + row * 29, 8, '#FFFFFF')
    } else {
      ctx.fillStyle = colors[variant] ?? '#1B2A5A'; ctx.fillRect(0, 0, 512, 512)
      ctx.strokeStyle = '#E2B33C'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(256, 256, 105, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#E2B33C'; ctx.beginPath(); ctx.arc(256, 256, 68, 0, Math.PI * 2); ctx.fill()
      star(ctx, 256, 256, 48, colors[variant] ?? '#1B2A5A')
    }
  })
}

export function paintingTexture(variant: string): CanvasTexture {
  return texture(['painting', variant], 512, ctx => {
    if (variant === 'portrait') {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512); gradient.addColorStop(0, '#37372f'); gradient.addColorStop(1, '#171c20'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512)
      ctx.fillStyle = '#262d36'; ctx.beginPath(); ctx.ellipse(256, 460, 145, 185, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#c39a74'; ctx.beginPath(); ctx.ellipse(256, 210, 65, 92, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#514037'; ctx.beginPath(); ctx.ellipse(256, 150, 68, 40, 0, Math.PI, Math.PI * 2); ctx.fill()
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512)
      gradient.addColorStop(0, '#829eaf'); gradient.addColorStop(0.55, '#d8d6c1'); gradient.addColorStop(0.56, variant === 'seascape' ? '#54798b' : '#78906a'); gradient.addColorStop(1, variant === 'seascape' ? '#2e5267' : '#384e31')
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512)
      if (variant === 'seascape') {
        ctx.fillStyle = '#f1e8d4'; ctx.beginPath(); ctx.moveTo(270, 175); ctx.lineTo(270, 340); ctx.lineTo(350, 330); ctx.closePath(); ctx.fill()
        ctx.fillStyle = '#4a352a'; ctx.beginPath(); ctx.moveTo(235, 345); ctx.lineTo(365, 345); ctx.lineTo(340, 365); ctx.lineTo(255, 365); ctx.closePath(); ctx.fill()
      } else {
        ctx.fillStyle = '#546a4c'; ctx.beginPath(); ctx.moveTo(0, 325); ctx.lineTo(110, 235); ctx.lineTo(205, 315); ctx.lineTo(325, 220); ctx.lineTo(512, 330); ctx.lineTo(512, 512); ctx.lineTo(0, 512); ctx.closePath(); ctx.fill()
      }
    }
  })
}
