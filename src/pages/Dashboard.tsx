import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BreedPicker } from '../components/BreedPicker'
import { Button, Card, Field, inputCls } from '../components/ui'
import { ARCHETYPES, FCI_GROUPS, TEMPLATES, breedMeta, getBreed } from '../lib/breeds'
import type { Archetype } from '../lib/types'
import { byDog, useStore } from '../lib/store'

export default function Dashboard() {
  const { dogs, staticExams, gaitExams, addDog } = useStore()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [breedId, setBreedId] = useState('')
  const [archetype, setArchetype] = useState<Archetype>('trotter')
  const breed = getBreed(breedId)

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !breed) return
    const id = addDog({
      name: name.trim(), breedId: breed.id, archetype, sex: 'male', neutered: false,
      ageYears: null, weightKg: null, heightCm: null, sport: '', history: '',
    })
    navigate(`/dog/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Psi</h1>
          <p className="text-sm text-muted">Každý pes má vlastní profil, statická a dynamická měření.</p>
        </div>
        {!adding && <Button onClick={() => setAdding(true)}>+ Přidat psa</Button>}
      </div>

      {adding && (
        <Card title="Nový pes">
          <form onSubmit={create} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Jméno">
              <input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Plemeno">
              <BreedPicker value={breedId} onChange={(b) => { setBreedId(b.id); setArchetype(b.archetype) }} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" disabled={!name.trim() || !breed}>Vytvořit</Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>Zrušit</Button>
            </div>
          </form>
          {breed && (
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <p className="text-sm text-muted">
                {breed.fciGroup ? <>{breedMeta(breed)}<br />{FCI_GROUPS[breed.fciGroup]}</> : 'Kříženec nemá standard FCI – vyberte archetyp podle stavby těla.'}
              </p>
              <Field label="Biomechanický archetyp" hint={TEMPLATES[archetype].summary}>
                <select className={inputCls} value={archetype} onChange={(e) => setArchetype(e.target.value as Archetype)}>
                  {ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </Field>
            </div>
          )}
        </Card>
      )}

      {dogs.length === 0 && !adding ? (
        <div className="rounded-xl border-2 border-dashed border-line p-12 text-center">
          <p className="mb-4 text-muted">Zatím tu není žádný pes.</p>
          <Button onClick={() => setAdding(true)}>Přidat prvního psa</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((d) => {
            const b = getBreed(d.breedId)
            const st = byDog(staticExams, d.id)
            const ga = byDog(gaitExams, d.id)
            const last = [st[0]?.date, ga[0]?.date].filter(Boolean).sort().pop()
            return (
              <Link key={d.id} to={`/dog/${d.id}`} className="rounded-xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{d.name}</h2>
                  <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">{b?.fciGroup ? `FCI ${b.fciGroup}` : 'Kříženec'}</span>
                </div>
                <p className="text-sm text-muted">{b?.name ?? 'Plemeno neurčeno'}</p>
                <p className="mt-2 text-sm">{TEMPLATES[d.archetype].label}</p>
                <p className="mt-3 text-xs text-muted">
                  Statická: {st.length} · Dynamická: {ga.length}
                  {last && ` · poslední ${new Date(last).toLocaleDateString('cs-CZ')}`}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
