// Hand-made SVG plant illustrations (no external assets needed).

export function LeafSprig({ className = '' }) {
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden="true" fill="none">
      <path d="M60 158C60 110 58 70 64 20" stroke="#457040" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 60C40 58 22 44 18 22c22 2 40 16 44 38z" fill="#9cc58a" />
      <path d="M63 88c22-4 38-20 40-42-22 4-38 20-40 42z" fill="#5a8a4f" />
      <path d="M61 118c-20-2-36-14-40-34 20 2 36 14 40 34z" fill="#c3d9b5" />
      <path d="M64 24c8-8 18-12 28-12-2 12-12 20-28 22z" fill="#5a8a4f" />
    </svg>
  )
}

export function PottedPlant({ className = '' }) {
  return (
    <svg viewBox="0 0 200 220" className={className} aria-hidden="true" fill="none">
      <ellipse cx="100" cy="208" rx="70" ry="8" fill="#26302a" opacity="0.08" />
      <g className="animate-sway" style={{ transformBox: 'view-box', transformOrigin: '100px 140px' }}>
        <path d="M100 140V60" stroke="#457040" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 100c-30 0-52-18-56-46 30 0 52 18 56 46z" fill="#9cc58a" />
        <path d="M100 82c28-2 48-22 50-50-28 2-48 22-50 50z" fill="#5a8a4f" />
        <path d="M100 124c24 0 42-14 46-36-24 0-42 14-46 36z" fill="#c3d9b5" />
        <path d="M100 64c-6-16-2-32 10-44 6 16 2 32-10 44z" fill="#2f5d3a" />
      </g>
      <path d="M52 140h96l-12 66H64z" fill="#c9784f" />
      <rect x="46" y="132" width="108" height="16" rx="6" fill="#b5653f" />
    </svg>
  )
}

export function SunBlob({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="#e8b44a" opacity="0.35" />
      <circle cx="50" cy="50" r="26" fill="#e8b44a" opacity="0.55" />
    </svg>
  )
}
