import { CanvasTexture, SRGBColorSpace } from 'three'

const cache = new Map<string, CanvasTexture>()
const variants: Record<string, true> = { 'washington-peale': true, 'fdr-portrait': true, emancipation: true, 'hassam-flags': true }

export function historicalPaintingTexture(variant: string): CanvasTexture | undefined {
  if (!variants[variant]) return undefined
  const existing = cache.get(variant)
  if (existing) return existing
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 640
  const ctx = canvas.getContext('2d')!
  const fill = (color: string, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
  }
  const ellipse = (color: string, x: number, y: number, rx: number, ry: number) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (variant === 'emancipation') {
    fill('#c5b89b', 0, 0, 512, 640)
    fill('#f3e8cc', 28, 25, 456, 590)
    ctx.fillStyle = '#665c4c'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px Georgia'
    ctx.fillText('EMANCIPATION', 256, 87)
    ctx.font = '16px Georgia'
    ctx.fillText('PROCLAMATION', 256, 112)
    for (let y = 155; y < 535; y += 16) fill('#8d806c', 72, y, y % 48 === 11 ? 305 : 365, 2)
    ctx.font = 'italic 22px Georgia'
    ctx.fillText('Abraham Lincoln', 330, 568)
  } else if (variant === 'hassam-flags') {
    fill('#7b8990', 0, 0, 512, 640)
    fill('#4e5960', 0, 60, 130, 580)
    fill('#a3a9a5', 387, 20, 125, 620)
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 55
      fill(i % 2 ? '#c1c4bd' : '#59646a', x, 50, 17, 540)
    }
    ctx.strokeStyle = '#e3dfd2'
    ctx.lineWidth = 5
    for (let i = 0; i < 5; i++) {
      const x = 65 + i * 85
      const y = 110 + i * 34
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 94, y - 35); ctx.stroke()
      fill('#ece7d9', x + 19, y - 32, 64, 55)
      for (let j = 0; j < 4; j++) fill('#a33d39', x + 19, y - 32 + j * 14, 64, 7)
      fill('#33485e', x + 19, y - 32, 25, 23)
    }
    ctx.strokeStyle = 'rgba(230,235,230,.4)'
    ctx.lineWidth = 2
    for (let i = 0; i < 70; i++) { const x = (i * 83) % 512; const y = (i * 137) % 640; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 42); ctx.stroke() }
  } else {
    const washington = variant === 'washington-peale'
    fill(washington ? '#b5aba0' : '#393b37', 0, 0, 512, 640)
    if (washington) {
      ellipse('#ded6c7', 256, 320, 226, 300)
      ellipse('#77746c', 256, 320, 207, 280)
      ellipse('#32352f', 256, 320, 188, 262)
    }
    ellipse('#222a2d', 256, 535, 150, 155)
    ellipse('#c4a487', 256, 290, 76, 115)
    ellipse(washington ? '#d2c9b8' : '#77726a', 256, 205, 80, 44)
    if (washington) {
      ellipse('#d2c9b8', 180, 290, 27, 76)
      ellipse('#d2c9b8', 332, 290, 27, 76)
    }
    fill('#f0ece0', 235, 391, 42, 68)
    fill(washington ? '#d8d4c9' : '#7c3031', 245, 420, 22, 78)
    fill('#51443d', 219, 283, 15, 5)
    fill('#51443d', 278, 283, 15, 5)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  cache.set(variant, texture)
  return texture
}
