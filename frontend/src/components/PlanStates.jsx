// Empty, loading and error states for the plan area.
import { useEffect, useState } from 'react'
import { AlertCircle, BookOpen, RefreshCw, Sprout } from 'lucide-react'
import { STARTER_TIPS } from '../data/gardenOptions.js'
import { PottedPlant } from './Decor.jsx'

export function EmptyState() {
  return (
    <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
      <PottedPlant className="h-36 w-auto" />
      <h3 className="mt-4 text-2xl font-semibold">Your plan will grow here</h3>
      <p className="mt-2 max-w-sm text-ink-soft">
        Fill in your garden profile and the AI model will suggest plants, a 7-day plan and one outdoor task for today.
      </p>
    </div>
  )
}

const LOADING_STEPS = [
  'Sending your garden profile to the local model…',
  'Thinking about plants for your light and space…',
  'Writing a gentle 7-day plan…',
  'Picking one outdoor task for today…',
  'Still working. Small models on a laptop can take a minute or two.',
]

export function LoadingState({ model }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 6000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="card p-8" role="status" aria-live="polite">
      <div className="flex items-center gap-4">
        <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-moss-100">
          <Sprout className="animate-bounce text-moss-700" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-moss-900">Growing your plan{model ? ` with ${model}` : ''}</p>
          <p className="text-sm text-ink-soft">{LOADING_STEPS[step]}</p>
        </div>
      </div>
      <div className="mt-8 space-y-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-cream-dark/70 p-5">
            <div className="h-4 w-1/3 rounded bg-cream-dark" />
            <div className="mt-3 h-3 w-full rounded bg-cream-dark" />
            <div className="mt-2 h-3 w-4/5 rounded bg-cream-dark" />
          </div>
        ))}
      </div>
    </div>
  )
}

const TROUBLESHOOTING = {
  backend_unreachable: ['Open a terminal in the backend folder.', 'Activate the venv: .venv\\Scripts\\activate', 'Run: uvicorn app.main:app --reload --port 8000'],
  ollama_unreachable: ['Open the Ollama app (or run "ollama serve" in a terminal).', 'Check it responds: open http://localhost:11434 in your browser.', 'Then click Try again.'],
  model_not_found: ['Download the model in a terminal (the exact command is shown above).', 'Or change OLLAMA_MODEL in backend/.env to a model you have ("ollama list").', 'Restart the backend after editing .env.'],
  model_timeout: ['The first run loads the model into memory, so try once more.', 'Close other heavy apps to free RAM.', 'Use a smaller model (gemma3:1b) or raise OLLAMA_TIMEOUT_SECONDS.'],
  invalid_model_output: ['Click Try again. Model output varies between runs.', 'Larger models (gemma3:4b+) follow the format more reliably.'],
}

export function ErrorState({ error, onRetry }) {
  const steps = TROUBLESHOOTING[error.code]
  return (
    <div className="space-y-6">
      <div className="card border-clay/40 p-6 sm:p-8" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-clay" aria-hidden="true" />
          <div>
            <h3 className="text-xl font-semibold">We couldn't generate your plan</h3>
            <p className="mt-1 text-ink">{error.message}</p>
            {error.hint && <p className="mt-2 rounded-xl bg-cream-dark/60 px-3 py-2 font-mono text-sm">{error.hint}</p>}
          </div>
        </div>
        {steps && (
          <div className="mt-5">
            <p className="text-sm font-semibold">Try this:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
              {steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>
        )}
        {onRetry && (
          <button type="button" className="btn-secondary mt-6" onClick={onRetry}>
            <RefreshCw size={16} aria-hidden="true" /> Try again
          </button>
        )}
      </div>

      {/* Non-AI fallback — explicitly labelled */}
      <section className="rounded-3xl border border-dashed border-ink-soft/30 bg-paper/60 p-6" aria-labelledby="tips-title">
        <div className="flex flex-wrap items-center gap-2">
          <BookOpen size={18} className="text-ink-soft" aria-hidden="true" />
          <h3 id="tips-title" className="font-sans text-base font-semibold text-ink">General starter tips</h3>
          <span className="rounded-full bg-cream-dark px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
            Not AI-generated · same for everyone
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">While the AI is unavailable, here are a few basics you can do outside right now:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          {STARTER_TIPS.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>
    </div>
  )
}
