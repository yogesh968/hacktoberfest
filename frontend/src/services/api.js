// All communication with the FastAPI backend lives here.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

// An error the UI can show nicely: message + practical hint.
export class ApiError extends Error {
  constructor(code, message, hint, fields) {
    super(message)
    this.code = code
    this.hint = hint
    this.fields = fields
  }
}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(
      'backend_unreachable',
      `Can't reach the AI Garden Buddy backend at ${API_BASE}.`,
      'Start it with: cd backend, then .venv\\Scripts\\activate and uvicorn app.main:app --reload --port 8000',
    )
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      body?.code || `http_${res.status}`,
      body?.message || `The server returned an error (${res.status}).`,
      body?.hint,
      body?.fields,
    )
  }
  return body
}

export function getHealth() {
  return request('/api/health')
}

export function createGardenPlan(profile, { signal } = {}) {
  return request('/api/garden-plan', { method: 'POST', body: JSON.stringify(profile), signal })
}
