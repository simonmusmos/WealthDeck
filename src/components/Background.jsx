import './Background.css'

// SVG grain as a data URI
const grainSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
  <filter id='grain'>
    <feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
  </filter>
  <rect width='200' height='200' filter='url(%23grain)' opacity='1'/>
</svg>`

const grainDataUri = `data:image/svg+xml,${grainSvg}`

export default function Background() {
  return (
    <div className="bg-root" aria-hidden="true">
      {/* Layer 1 — Radial glow (top-right) */}
      <div className="bg-glow" />
      {/* Layer 2 — Dot grid */}
      <div className="bg-dots" />
      {/* Layer 3 — SVG grain */}
      <div className="bg-grain" style={{ backgroundImage: `url("${grainDataUri}")` }} />
    </div>
  )
}
