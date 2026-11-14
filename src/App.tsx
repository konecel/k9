import { useEffect } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useSession } from './lib/auth'
import { CLOUD_ENABLED } from './lib/cloud-config'
import { supabase } from './lib/supabase'
import { hasUnsavedChanges, retrySync, useSync } from './lib/sync'
import { useStore } from './lib/store'
import { useTrial } from './lib/trial'
import Login from './pages/Login'
import AnamnesisPage from './pages/AnamnesisPage'
import Breeds from './pages/Breeds'
import Dashboard from './pages/Dashboard'
import DogLayout from './pages/DogLayout'
import GaitPage from './pages/GaitPage'
import ProfilePage from './pages/ProfilePage'
import ReportPage from './pages/ReportPage'
import StaticPage from './pages/StaticPage'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'}`

export default function App() {
  const session = useSession()
  const navigate = useNavigate()
  const sync = useSync()
  const trial = useTrial()
  const inTrial = CLOUD_ENABLED && !session && trial.active

  // don't let the tab close while a change is still on its way to the cloud
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      const trialData = useTrial.getState().active && useStore.getState().dogs.length > 0
      if (hasUnsavedChanges() || trialData) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const signedIn = Boolean(session)
  const ready = !CLOUD_ENABLED || (signedIn && sync.state !== 'loading')

  return (
    <div className="min-h-screen" data-trial={inTrial || undefined}>
      <header className="no-print sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm text-white">K9</span>
            <span className="hidden sm:inline">Biomechanika</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            {(!CLOUD_ENABLED || signedIn || inTrial) && (
              <>
                <NavLink to="/" end className={navCls}>Psi</NavLink>
                <NavLink to="/breeds" className={navCls}>Plemena</NavLink>
              </>
            )}
            {!CLOUD_ENABLED && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs text-muted" title="Data jsou uložená jen v tomto prohlížeči">Místní režim</span>}
            {inTrial && <button className="ml-2 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white" onClick={() => { navigate('/'); trial.stop() }}>Přihlásit se</button>}
            {session && (
              <>
                <span className="ml-2 hidden max-w-40 truncate text-xs text-muted md:inline">{session.user.email}</span>
                <button className="rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-ink" onClick={() => { navigate('/'); void supabase?.auth.signOut() }}>Odhlásit</button>
              </>
            )}
          </nav>
        </div>
      </header>
      {sync.state === 'error' && (
        <div role="alert" className="no-print border-b border-sig/30 bg-sig/10 px-4 py-2 text-center text-sm">
          Změny se nepodařilo uložit do cloudu ({sync.error}). <button className="font-medium underline" onClick={retrySync}>Zkusit znovu</button>
        </div>
      )}
      {inTrial && (
        <div className="no-print border-b border-mild/40 bg-mild/15 px-4 py-2 text-center text-sm">
          <strong>Zkušební režim.</strong> Nic se neukládá – po zavření nebo obnovení stránky data zmizí. Tisk a export reportu jsou dostupné po přihlášení.
        </div>
      )}
      <p className="trial-print-note hidden p-8 text-center">Tisk a export reportu jsou dostupné po přihlášení.</p>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {session === undefined || (signedIn && !ready && sync.state === 'loading') ? (
          <p className="py-16 text-center text-sm text-muted">Načítám…</p>
        ) : CLOUD_ENABLED && !signedIn && !inTrial ? (
          <Login />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/breeds" element={<Breeds />} />
            <Route path="/dog/:id" element={<DogLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="anamnesis" element={<AnamnesisPage />} />
              <Route path="static" element={<StaticPage />} />
              <Route path="gait" element={<GaitPage />} />
              <Route path="report" element={<ReportPage />} />
            </Route>
          </Routes>
        )}
      </main>
    </div>
  )
}
