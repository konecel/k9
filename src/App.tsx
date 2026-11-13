import { NavLink, Route, Routes } from 'react-router-dom'
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
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm text-white">K9</span>
            <span className="hidden sm:inline">Biomechanika</span>
          </NavLink>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navCls}>Psi</NavLink>
            <NavLink to="/breeds" className={navCls}>Plemena</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/breeds" element={<Breeds />} />
          <Route path="/dog/:id" element={<DogLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="static" element={<StaticPage />} />
            <Route path="gait" element={<GaitPage />} />
            <Route path="report" element={<ReportPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}
