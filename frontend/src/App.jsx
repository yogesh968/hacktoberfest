import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import GardenForm from './components/GardenForm.jsx'
import PlanView from './components/PlanView.jsx'
import { EmptyState, ErrorState, LoadingState } from './components/PlanStates.jsx'
import { HowItWorks, Limitations, TechStack, WhyOpenSource } from './components/InfoSections.jsx'
import Footer from './components/Footer.jsx'
import { createGardenPlan, getHealth } from './services/api.js'
import { EXPERIENCE, GARDEN_TYPES, SUNLIGHT, labelFor } from './data/gardenOptions.js'

// Single page app: the sections are anchors on one page, so React Router isn't needed.
export default function App() {
  const [health, setHealth] = useState(null) // { data } or { error }
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null) // { plan, meta }
  const [error, setError] = useState(null)
  const [lastProfile, setLastProfile] = useState(null)
  const resultsRef = useRef(null)
  const abortRef = useRef(null)

  const refreshHealth = () =>
    getHealth().then((data) => setHealth({ data })).catch((e) => setHealth({ error: e.message }))

  useEffect(() => { refreshHealth() }, [])

  const generate = async (profile) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLastProfile(profile)
    setStatus('loading')
    setError(null)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    try {
      const data = await createGardenPlan(profile, { signal: controller.signal })
      setResult(data)
      setStatus('success')
    } catch (e) {
      if (e.name === 'AbortError') return
      setError(e)
      setStatus('error')
      refreshHealth()
    }
  }

  const profileLabel = lastProfile
    ? `${lastProfile.city} · ${labelFor(GARDEN_TYPES, lastProfile.garden_type)} · ${labelFor(SUNLIGHT, lastProfile.sunlight)} · ${labelFor(EXPERIENCE, lastProfile.experience)}`
    : ''

  return (
    <>
      <a href="#plan" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-moss-700 focus:px-4 focus:py-2 focus:text-cream">
        Skip to garden planner
      </a>
      <Navbar health={health} />
      <main>
        <Hero />
        <HowItWorks />

        <section id="plan" className="bg-cream-dark/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="eyebrow mb-3">Plan my garden</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">Let’s plan something you can grow</h2>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
              <div className="lg:sticky lg:top-24">
                <GardenForm onSubmit={generate} loading={status === 'loading'} serverFieldErrors={error?.fields} />
              </div>
              <div ref={resultsRef} className="scroll-mt-24" aria-live="polite">
                {status === 'idle' && <EmptyState />}
                {status === 'loading' && <LoadingState model={health?.data?.model} />}
                {status === 'error' && (
                  <ErrorState error={error} onRetry={error?.code === 'invalid_input' ? null : () => generate(lastProfile)} />
                )}
                {status === 'success' && result && (
                  <PlanView plan={result.plan} meta={result.meta} profileLabel={profileLabel}
                    onRegenerate={() => generate(lastProfile)} loading={false} />
                )}
              </div>
            </div>
          </div>
        </section>

        <WhyOpenSource />
        <TechStack />
        <Limitations />
      </main>
      <Footer />
    </>
  )
}
