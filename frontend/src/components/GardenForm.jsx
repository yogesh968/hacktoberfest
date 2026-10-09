import { useState } from 'react'
import { Loader2, MapPin, Sparkles } from 'lucide-react'
import { EXPERIENCE, GARDEN_TYPES, SUNLIGHT } from '../data/gardenOptions.js'

const EMPTY = { city: '', garden_type: '', sunlight: '', experience: '', minutes_per_day: '' }

// Client-side checks mirror the backend rules (backend/app/schemas.py) for instant feedback.
function validate(v) {
  const errors = {}
  if (v.city.trim().length < 2) errors.city = 'Enter your city or region (at least 2 characters).'
  else if (v.city.trim().length > 80) errors.city = 'Please keep this under 80 characters.'
  if (!v.garden_type) errors.garden_type = 'Choose where you will garden.'
  if (!v.sunlight) errors.sunlight = 'Choose how much sun the spot gets.'
  if (!v.experience) errors.experience = 'Choose your experience level.'
  if (v.minutes_per_day !== '') {
    const n = Number(v.minutes_per_day)
    if (!Number.isInteger(n) || n < 5 || n > 240) errors.minutes_per_day = 'Use a whole number from 5 to 240, or leave blank.'
  }
  return errors
}

export default function GardenForm({ onSubmit, loading, serverFieldErrors }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const allErrors = { ...serverFieldErrors, ...errors }

  const update = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus()
      return
    }
    onSubmit({
      city: values.city.trim(),
      garden_type: values.garden_type,
      sunlight: values.sunlight,
      experience: values.experience,
      minutes_per_day: values.minutes_per_day === '' ? null : Number(values.minutes_per_day),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-7 p-6 sm:p-8" aria-label="Garden profile">
      <div>
        <h3 className="text-2xl font-semibold">Your garden profile</h3>
        <p className="mt-1 text-sm text-ink-soft">Four quick questions. Fields marked * are required.</p>
      </div>

      <div>
        <label htmlFor="field-city" className="mb-2 block font-medium">City or region *</label>
        <div className="relative">
          <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            id="field-city"
            type="text"
            autoComplete="address-level2"
            placeholder="e.g. Pune, Lisbon, Toronto"
            value={values.city}
            onChange={(e) => update('city', e.target.value)}
            aria-invalid={!!allErrors.city}
            aria-describedby={allErrors.city ? 'err-city' : 'help-city'}
            className={`w-full rounded-2xl border bg-cream/40 py-3 pl-11 pr-4 outline-none transition focus:border-moss-500 focus:bg-paper focus:ring-4 focus:ring-moss-100 ${allErrors.city ? 'border-clay' : 'border-cream-dark'}`}
          />
        </div>
        {allErrors.city
          ? <p id="err-city" className="mt-1.5 text-sm text-clay">{allErrors.city}</p>
          : <p id="help-city" className="mt-1.5 text-xs text-ink-soft">Used only in the prompt to the AI. No live weather is looked up.</p>}
      </div>

      <ChoiceGroup name="garden_type" legend="Garden type *" options={GARDEN_TYPES}
        value={values.garden_type} onChange={update} error={allErrors.garden_type} cols="sm:grid-cols-4" />
      <ChoiceGroup name="sunlight" legend="Sunlight *" options={SUNLIGHT}
        value={values.sunlight} onChange={update} error={allErrors.sunlight} cols="sm:grid-cols-3" />
      <ChoiceGroup name="experience" legend="Gardening experience *" options={EXPERIENCE}
        value={values.experience} onChange={update} error={allErrors.experience} cols="sm:grid-cols-3" />

      <div>
        <label htmlFor="field-minutes_per_day" className="mb-2 block font-medium">
          Time per day <span className="font-normal text-ink-soft">(optional, minutes)</span>
        </label>
        <input
          id="field-minutes_per_day"
          type="number"
          inputMode="numeric"
          min={5}
          max={240}
          placeholder="15"
          value={values.minutes_per_day}
          onChange={(e) => update('minutes_per_day', e.target.value)}
          aria-invalid={!!allErrors.minutes_per_day}
          aria-describedby={allErrors.minutes_per_day ? 'err-minutes_per_day' : undefined}
          className={`w-32 rounded-2xl border bg-cream/40 px-4 py-3 outline-none transition focus:border-moss-500 focus:bg-paper focus:ring-4 focus:ring-moss-100 ${allErrors.minutes_per_day ? 'border-clay' : 'border-cream-dark'}`}
        />
        {allErrors.minutes_per_day && <p id="err-minutes_per_day" className="mt-1.5 text-sm text-clay">{allErrors.minutes_per_day}</p>}
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
        {loading
          ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Growing your plan…</>
          : <><Sparkles size={18} aria-hidden="true" /> Generate my garden plan</>}
      </button>
    </form>
  )
}

function ChoiceGroup({ name, legend, options, value, onChange, error, cols }) {
  return (
    <fieldset aria-describedby={error ? `err-${name}` : undefined}>
      <legend className="mb-2 font-medium">{legend}</legend>
      <div className={`grid grid-cols-2 gap-2.5 ${cols}`}>
        {options.map((o, i) => {
          const checked = value === o.value
          return (
            <label key={o.value}
              className={`cursor-pointer rounded-2xl border px-4 py-3 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-moss-200 ${
                checked ? 'border-moss-600 bg-moss-50 shadow-soft' : 'border-cream-dark bg-cream/40 hover:border-moss-200'
              }`}>
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(name, o.value)}
                id={i === 0 ? `field-${name}` : undefined}
                className="sr-only"
              />
              <span className="block font-semibold text-moss-900">{o.label}</span>
              <span className="block text-xs text-ink-soft">{o.hint}</span>
            </label>
          )
        })}
      </div>
      {error && <p id={`err-${name}`} className="mt-1.5 text-sm text-clay">{error}</p>}
    </fieldset>
  )
}
