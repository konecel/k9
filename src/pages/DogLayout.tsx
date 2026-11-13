import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { FCI_GROUPS, TEMPLATES, breedMeta, getBreed } from '../lib/breeds'
import { useStore } from '../lib/store'
import type { ArchetypeTemplate, Breed, Dog } from '../lib/types'

export interface DogContext {
  dog: Dog
  breed: Breed | undefined
  tpl: ArchetypeTemplate
}
export const useDog = () => useOutletContext<DogContext>()

const tabCls = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${isActive ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`

function SavedIndicator() {
  const savedAt = useStore((s) => s.savedAt)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (!savedAt) return
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 1500)
    return () => clearTimeout(t)
  }, [savedAt])
  return (
    <span className={`text-xs transition-opacity ${flash ? 'text-brand' : 'text-muted'}`} aria-live="polite">
      ✓ {flash ? 'Uloženo' : 'Změny se ukládají automaticky'}
    </span>
  )
}

export default function DogLayout() {
  const { id } = useParams()
  const dog = useStore((s) => s.dogs.find((d) => d.id === id))
  if (!dog) {
    return (
      <p className="text-muted">
        Pes nebyl nalezen. <Link className="text-brand underline" to="/">Zpět na přehled</Link>
      </p>
    )
  }
  const breed = getBreed(dog.breedId)
  const tpl = TEMPLATES[dog.archetype]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/" className="no-print text-xs text-muted hover:text-ink">← Všichni psi</Link>
          <h1 className="text-2xl font-bold">{dog.name}</h1>
          <p className="text-sm text-muted">
            {breed ? `${breed.name} · ${breedMeta(breed)}${breed.fciGroup ? ` · ${FCI_GROUPS[breed.fciGroup]}` : ''}` : 'Plemeno neurčeno'} · {tpl.label}
          </p>
        </div>
        <span className="no-print"><SavedIndicator /></span>
      </div>
      <nav className="no-print flex overflow-x-auto border-b border-line">
        <NavLink to="." end className={tabCls}>Profil</NavLink>
        <NavLink to="static" className={tabCls}>Statická analýza</NavLink>
        <NavLink to="gait" className={tabCls}>Dynamická analýza</NavLink>
        <NavLink to="report" className={tabCls}>Report</NavLink>
      </nav>
      {/* key = dog id: switching dogs remounts every page, no state carries over */}
      <Outlet key={dog.id} context={{ dog, breed, tpl } satisfies DogContext} />
    </div>
  )
}
