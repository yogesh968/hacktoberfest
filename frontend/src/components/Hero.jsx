import { ArrowRight, CalendarCheck, Leaf, Sun } from 'lucide-react'
import { SAMPLE_PREVIEW } from '../data/samplePlan.js'
import { LeafSprig, PottedPlant, SunBlob } from './Decor.jsx'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <LeafSprig className="pointer-events-none absolute -left-6 top-24 hidden h-56 w-auto opacity-40 lg:block" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
        <div className="animate-rise">
          <p className="eyebrow mb-4">Hacktoberfest 2026 · Touch Grass</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Less scrolling.<br />
            <span className="italic text-moss-600">More growing.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Tell AI Garden Buddy about your space: balcony, terrace, backyard or windowsill. An open-weight AI
            model running on your own computer turns that into a plant list, a gentle 7-day plan and one small
            task to do <em>outside</em>, today.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#plan" className="btn-primary">
              Plan My Garden <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="#how-it-works" className="font-medium text-moss-700 underline-offset-4 hover:underline">
              How it works
            </a>
          </div>
        </div>

        {/* Preview card — clearly labelled sample data */}
        <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:120ms]">
          <SunBlob className="absolute -right-8 -top-10 h-36 w-36" />
          <PottedPlant className="absolute -bottom-10 -left-14 hidden h-44 w-auto sm:block" />
          <div className="card relative p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">Example plan</p>
              <span className="rounded-full bg-cream-dark px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                Sample · not AI output
              </span>
            </div>
            <p className="mb-4 text-sm text-ink-soft">{SAMPLE_PREVIEW.location}</p>
            <ul className="space-y-2">
              {SAMPLE_PREVIEW.plants.map((p) => (
                <li key={p.name} className="flex items-center gap-3 rounded-2xl bg-moss-50 px-3 py-2.5">
                  <Leaf size={18} className="shrink-0 text-moss-600" aria-hidden="true" />
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-auto text-xs text-ink-soft">{p.note}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3 rounded-2xl bg-sun-light p-3">
              <Sun size={18} className="mt-0.5 shrink-0 text-soil" aria-hidden="true" />
              <p className="text-sm text-ink"><strong>Today:</strong> {SAMPLE_PREVIEW.today}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
              <CalendarCheck size={14} aria-hidden="true" /> + a 7-day plan, tools list and safety notes
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
