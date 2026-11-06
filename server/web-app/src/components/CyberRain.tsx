import { useEffect, useRef } from 'react'

const glyphs = '01ã‚¢ã‚¤ã‚¦ã‚¨ã‚ªã‚«ã‚­ã‚¯ã‚±ã‚³ã‚µã‚·ã‚¹ã‚»ã‚½ã‚¿ãƒãƒ„ãƒ†ãƒˆãƒŠãƒ‹ãƒŒãƒãƒŽ<>/{}[]'

export default function CyberRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let lastFrame = 0
    let columns: number[] = []
    let width = 0
    let height = 0
    const fontSize = 15

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      context.setTransform(scale, 0, 0, scale, 0, 0)
      columns = Array.from(
        { length: Math.ceil(width / fontSize) },
        () => -Math.floor(Math.random() * (height / fontSize)),
      )
      context.clearRect(0, 0, width, height)
    }

    const draw = (time: number) => {
      if (time - lastFrame < 48) {
        frame = window.requestAnimationFrame(draw)
        return
      }
      lastFrame = time
      context.fillStyle = 'rgba(5, 7, 11, 0.075)'
      context.fillRect(0, 0, width, height)
      context.font = `500 ${fontSize}px "IBM Plex Mono", monospace`

      columns.forEach((y, index) => {
        const x = index * fontSize
        const visibleAtEdge = Math.min(x / 150, (width - x) / 150, 1)
        if (visibleAtEdge > 0.08 && Math.random() > 0.12) {
          context.globalAlpha = (0.12 + Math.random() * 0.34) * visibleAtEdge
          context.fillStyle = Math.random() > 0.94 ? '#ff5974' : '#39d9ae'
          context.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], x, y * fontSize)
        }
        if (y * fontSize > height && Math.random() > 0.975) columns[index] = 0
        else columns[index] = y + 1
      })

      context.globalAlpha = 1
      frame = window.requestAnimationFrame(draw)
    }

    const start = () => {
      window.cancelAnimationFrame(frame)
      if (reducedMotion.matches) {
        context.clearRect(0, 0, width, height)
        return
      }
      lastFrame = 0
      frame = window.requestAnimationFrame(draw)
    }

    resize()
    start()
    window.addEventListener('resize', resize)
    reducedMotion.addEventListener('change', start)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      reducedMotion.removeEventListener('change', start)
    }
  }, [])

  return <canvas ref={canvasRef} className="matrix-rain" aria-hidden="true" />
}

