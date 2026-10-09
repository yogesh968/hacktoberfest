import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Clock, Footprints } from 'lucide-react'

// Saves completion + reflection in this browser only (localStorage). Nothing is sent to a server.
const STORAGE_KEY = 'garden-buddy:today-task'

function load(taskId) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.taskId === taskId) return saved
  } catch { /* storage unavailable or corrupt — start fresh */ }
  return { taskId, done: false, reflection: '', completedAt: null }
}

export default function TodayTaskCard({ task, taskId }) {
  const [state, setState] = useState(() => load(taskId))

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const toggleDone = () =>
    setState((s) => ({ ...s, done: !s.done, completedAt: s.done ? null : new Date().toISOString() }))

  return (
    <article className="card relative overflow-hidden border-sun/40 bg-sun-light/60 p-6 sm:p-8" aria-labelledby="today-title">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sun text-moss-900">
          <Footprints size={20} aria-hidden="true" />
        </span>
        <p className="eyebrow text-soil">Your outdoor task for today</p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-soil">
          <Clock size={13} aria-hidden="true" /> ~{task.duration_minutes} min
        </span>
      </div>

      <h3 id="today-title" className="mt-4 text-2xl font-semibold">{task.title}</h3>
      <ol className="mt-4 space-y-2">
        {task.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paper text-xs font-bold text-soil">{i + 1}</span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm font-medium text-soil">Put the phone down, go do it, then come back and tick it off. 🌱</p>

      <div className="mt-6 flex flex-col gap-4 border-t border-sun/40 pt-6">
        <button type="button" onClick={toggleDone} aria-pressed={state.done}
          className={`inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition ${
            state.done ? 'bg-moss-700 text-cream' : 'border border-moss-600 bg-paper text-moss-700 hover:bg-moss-50'
          }`}>
          {state.done ? <CheckCircle2 size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
          {state.done ? 'Done — nice work outside!' : 'Mark as done'}
        </button>
        {state.done && state.completedAt && (
          <p className="text-xs text-ink-soft">Completed {new Date(state.completedAt).toLocaleString()}</p>
        )}

        <div>
          <label htmlFor="reflection" className="mb-1.5 block text-sm font-medium">
            Quick reflection <span className="font-normal text-ink-soft">(optional, saved only in this browser)</span>
          </label>
          <textarea id="reflection" rows={3} maxLength={500}
            placeholder="What did you notice? How did it feel to be outside?"
            value={state.reflection}
            onChange={(e) => setState((s) => ({ ...s, reflection: e.target.value }))}
            className="w-full rounded-2xl border border-sun/40 bg-paper px-4 py-3 outline-none focus:border-moss-500 focus:ring-4 focus:ring-moss-100" />
        </div>
      </div>
    </article>
  )
}
