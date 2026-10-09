// Small pill showing whether the backend + AI model are ready.
export default function StatusBadge({ health }) {
  let tone = 'bg-cream-dark text-ink-soft'
  let dot = 'bg-ink-soft/50'
  let text = 'Checking AI…'
  let title = ''

  if (health?.error) {
    tone = 'bg-clay-light text-soil'
    dot = 'bg-clay'
    text = 'Backend offline'
    title = health.error
  } else if (health?.data) {
    const h = health.data
    if (h.ollama_reachable && h.model_available) {
      tone = 'bg-moss-100 text-moss-900'
      dot = 'bg-moss-500'
      text = `${h.model} ready`
    } else {
      tone = 'bg-sun-light text-soil'
      dot = 'bg-sun'
      text = h.ollama_reachable ? 'Model not downloaded' : 'Ollama offline'
      title = h.detail || ''
    }
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
      title={title} role="status">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {text}
    </span>
  )
}
