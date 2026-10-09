// Choices for the form. `value` must match the backend's allowed values (backend/app/schemas.py).
export const GARDEN_TYPES = [
  { value: 'balcony', label: 'Balcony', hint: 'Pots & railings' },
  { value: 'terrace', label: 'Terrace', hint: 'Rooftop or patio' },
  { value: 'backyard', label: 'Backyard', hint: 'Ground beds' },
  { value: 'indoor', label: 'Indoor', hint: 'Windowsills' },
]

export const SUNLIGHT = [
  { value: 'full_sun', label: 'Full sun', hint: '6+ hrs direct' },
  { value: 'partial_sun', label: 'Partial sun', hint: '3–6 hrs' },
  { value: 'shade', label: 'Shade', hint: 'Under 3 hrs' },
]

export const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner', hint: 'New to plants' },
  { value: 'intermediate', label: 'Intermediate', hint: 'Kept a few alive' },
  { value: 'experienced', label: 'Experienced', hint: 'Green thumb' },
]

export const labelFor = (list, value) => list.find((o) => o.value === value)?.label ?? value

// Shown ONLY when the AI is unavailable, and always labelled as NOT AI-generated.
// Simple, general advice written by the project author.
export const STARTER_TIPS = [
  'Watch your space for a day: note when direct sun arrives and leaves. This decides what you can grow.',
  'Use pots with drainage holes. Most container plants die from soggy roots, not thirst.',
  'Check soil with your finger: water when the top 2–3 cm feel dry.',
  'Start with 2–3 plants rather than ten. Visit a local nursery and ask what grows well in your area right now.',
  'Wash your hands after handling soil and keep sharp tools and fertiliser away from kids and pets.',
]
