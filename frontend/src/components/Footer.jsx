import { BookOpen, Github, Sprout } from 'lucide-react'

const REPO_URL = 'https://github.com/yogesh968/hacktoberfest'

export default function Footer() {
  return (
    <footer className="border-t border-cream-dark bg-cream-dark/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-moss-900">
            <Sprout size={18} className="text-moss-600" aria-hidden="true" /> AI Garden Buddy
          </p>
          <p className="mt-1 text-sm text-ink-soft">Less scrolling. More growing. Built for Hacktoberfest 2026.</p>
        </div>
        <nav className="flex gap-5 md:ml-auto" aria-label="Footer">
          <a href={REPO_URL} className="inline-flex items-center gap-2 text-sm font-medium text-moss-700 hover:underline"
            target="_blank" rel="noreferrer">
            <Github size={16} aria-hidden="true" /> GitHub
          </a>
          <a href={`${REPO_URL}#readme`} className="inline-flex items-center gap-2 text-sm font-medium text-moss-700 hover:underline"
            target="_blank" rel="noreferrer">
            <BookOpen size={16} aria-hidden="true" /> Documentation
          </a>
        </nav>
      </div>
    </footer>
  )
}
