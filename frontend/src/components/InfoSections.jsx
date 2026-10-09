import { ClipboardList, Cpu, Eye, HardDrive, Footprints, Lock, ShieldAlert, Sprout, Users } from 'lucide-react'

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-ink-soft">{children}</p>}
    </div>
  )
}

export function HowItWorks() {
  const steps = [
    { icon: ClipboardList, title: 'Describe your space', text: 'City, garden type, sunlight, experience and how much time you have.' },
    { icon: Cpu, title: 'A local AI plans it', text: 'An open-weight Gemma model running in Ollama on your computer writes a structured plan.' },
    { icon: Footprints, title: 'Go outside', text: 'Do today’s small task, tick it off and jot down what you noticed.' },
  ]
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="How it works" title="From screen to soil in three steps" />
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="card relative p-6">
            <span className="absolute right-6 top-5 font-display text-5xl font-semibold text-moss-100">{i + 1}</span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-moss-100 text-moss-700">
              <Icon aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function WhyOpenSource() {
  const points = [
    { icon: HardDrive, title: 'Runs on your machine', text: 'With the default setup, your garden profile goes from your browser to your own backend and a model on localhost. No cloud AI API is called.' },
    { icon: Lock, title: 'No API keys or per-request fees', text: 'Once the model is downloaded, generating a plan doesn’t need an account, a key or a paid API. You pay in your own electricity and RAM.' },
    { icon: Eye, title: 'Inspectable & swappable', text: 'The weights, prompt and output schema are all visible. Swap in a different Ollama model with one environment variable.' },
    { icon: Users, title: 'Community-driven', text: 'Open-weight models can be studied, fine-tuned and improved by anyone, for example on regional plant knowledge.' },
  ]
  return (
    <section id="open-source" className="bg-moss-900 py-20 text-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow mb-3 text-moss-300">Why open-source AI matters</p>
          <h2 className="text-3xl font-semibold text-cream sm:text-4xl">Your garden, your model</h2>
          <p className="mt-4 text-moss-200">
            Gemma models are <em>open-weight</em>: you can download and run them yourself. Licences differ by
            version: Gemma 3 uses Google’s Gemma Terms of Use, and Gemma 4 is published under Apache 2.0. See the README for details.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-moss-700 bg-moss-700/30 p-6">
              <Icon className="text-moss-300" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold text-cream">{title}</h3>
              <p className="mt-2 text-moss-100/80">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TechStack() {
  const stack = [
    ['React + Vite', 'Fast, component-based UI'],
    ['Tailwind CSS', 'Utility-first styling'],
    ['Lucide icons', 'Open-source icon set'],
    ['FastAPI', 'Python REST API'],
    ['Pydantic', 'Validates inputs & AI output'],
    ['Ollama', 'Local model runtime'],
    ['Gemma', 'Open-weight LLM by Google'],
    ['JSON Schema', 'Structured model output'],
  ]
  return (
    <section id="stack" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Technology stack" title="Built with open tools" />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stack.map(([name, desc]) => (
          <li key={name} className="card p-5">
            <p className="font-semibold text-moss-900">{name}</p>
            <p className="mt-1 text-sm text-ink-soft">{desc}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Limitations() {
  const items = [
    'No live weather, climate or frost data is used. The model only knows what you type plus its general training knowledge.',
    'Small local models can be wrong or overconfident. Treat plans as a friendly starting point, not expert horticultural advice.',
    'Always check whether a plant is toxic before growing it around pets or children.',
    'Generation speed depends on your hardware. Expect anywhere from ~20 seconds to a few minutes on a laptop.',
    'Your task completion and reflections are stored only in this browser (localStorage) and are never uploaded.',
    'The city you type is sent to the backend and the model, but it isn’t stored or logged by this app.',
  ]
  return (
    <section id="limitations" className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
      <div className="card p-6 sm:p-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-clay" aria-hidden="true" />
          <h2 className="text-2xl font-semibold sm:text-3xl">Limitations & responsible use</h2>
        </div>
        <ul className="mt-6 space-y-3">
          {items.map((t) => (
            <li key={t} className="flex gap-3 leading-relaxed text-ink-soft">
              <Sprout size={18} className="mt-1 shrink-0 text-moss-500" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
