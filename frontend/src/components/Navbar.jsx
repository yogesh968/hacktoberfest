import { useState } from 'react'
import { Menu, Sprout, X } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#plan', label: 'Plan my garden' },
  { href: '#open-source', label: 'Open-source AI' },
  { href: '#limitations', label: 'Limitations' },
]

export default function Navbar({ health }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-cream-dark/70 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-semibold text-moss-900">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-moss-700 text-cream">
            <Sprout size={18} aria-hidden="true" />
          </span>
          AI Garden Buddy
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink-soft hover:text-moss-700">
              {l.label}
            </a>
          ))}
          <StatusBadge health={health} />
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-moss-700 hover:bg-moss-50 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-cream-dark px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 font-medium text-ink hover:bg-moss-50">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="px-3 pt-2"><StatusBadge health={health} /></div>
        </div>
      )}
    </header>
  )
}
