/**
 * Root component.
 *
 * FASE 1 — placeholder shell. The routing tree, auth providers and layout
 * are assembled here in FASE 2 following ARCHITECTURE.md.
 */

import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (import.meta.env.PROD) {
      registerSW({ immediate: true })
    }
    setReady(true)
  }, [])

  if (!ready) {
    return null
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-canvas text-ink">
      <div className="text-center px-6">
        <Logo />
        <h1 className="font-display text-3xl font-semibold tracking-tight mt-6">
          Nuestro Money
        </h1>
        <p className="text-ink-2 mt-2 text-sm">
          Vuestra banca privada digital. Una única cuenta compartida.
        </p>
      </div>
    </main>
  )
}

function Logo() {
  return (
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-lg shadow-brand-500/25">
      <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
        <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
          <circle cx="19" cy="24" r="10" />
          <circle cx="29" cy="24" r="10" />
          <path d="M19 14 L29 34" strokeDasharray="2.5 4" opacity="0.55" />
        </g>
      </svg>
    </div>
  )
}

export default App
