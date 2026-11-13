import { useMemo, useState } from 'react'
import { TemplateCard } from '../components/TemplateCard'
import { Card, inputCls } from '../components/ui'
import { ARCHETYPES, FCI_BREEDS, FCI_GROUPS, FCI_SECTIONS, TEMPLATES, searchBreeds } from '../lib/breeds'
import type { Archetype, Breed } from '../lib/types'

const GROUPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function Breeds() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('all')
  const [archetype, setArchetype] = useState<Archetype>('trotter')
  const [picked, setPicked] = useState<Breed | null>(null)

  const sections = useMemo(() => {
    const list = searchBreeds(q, [...FCI_BREEDS]).filter((b) => group === 'all' || b.fciGroup === Number(group))
    const map = new Map<string, Breed[]>()
    for (const b of [...list].sort((x, y) => x.fciGroup - y.fciGroup || (x.section || 99) - (y.section || 99) || x.name.localeCompare(y.name, 'cs'))) {
      const key = `${b.fciGroup}.${b.section}`
      map.set(key, [...(map.get(key) ?? []), b])
    }
    return { count: list.length, groups: [...map.entries()] }
  }, [q, group])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Databáze plemen</h1>
        <p className="text-sm text-muted">
          Úplná nomenklatura FCI: {FCI_BREEDS.filter((b) => !b.provisional).length} definitivně a {FCI_BREEDS.filter((b) => b.provisional).length} prozatímně uznaných plemen. Všechno ostatní se vede jako kříženec.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="Název nebo číslo standardu…" aria-label="Hledat plemeno" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={inputCls} aria-label="Skupina FCI" value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="all">Všechny skupiny FCI</option>
              {GROUPS.map((n) => <option key={n} value={n}>{n} – {FCI_GROUPS[n]}</option>)}
            </select>
          </div>
          <p className="mb-2 text-xs text-muted">Nalezeno: {sections.count}</p>
          <div className="max-h-[36rem] overflow-y-auto">
            {sections.groups.map(([key, list]) => {
              const [g, s] = key.split('.')
              return (
                <div key={key}>
                  <h3 className="sticky top-0 bg-paper px-2 py-1.5 text-xs font-semibold text-muted">
                    Skupina {g} · {s === '0' ? (g === '4' ? FCI_GROUPS[4] : 'prozatímně uznaná plemena') : `sekce ${s} – ${FCI_SECTIONS[key]}`}
                  </h3>
                  <ul className="divide-y divide-line">
                    {list.map((b) => (
                      <li key={b.id}>
                        <button
                          onClick={() => { setArchetype(b.archetype); setPicked(b) }}
                          className={`flex w-full items-start justify-between gap-3 px-2 py-2 text-left text-sm hover:bg-paper ${picked?.id === b.id ? 'bg-brand-soft' : ''}`}
                        >
                          <span className="min-w-0">
                            <span className="font-medium">{b.name}</span>
                            <span className="block truncate text-xs text-muted">č. {b.fciNumber} · {b.nameFci}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted">{TEMPLATES[b.archetype].label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {sections.count === 0 && <p className="py-6 text-center text-sm text-muted">Žádné plemeno neodpovídá.</p>}
          </div>
        </Card>
        <Card
          title={TEMPLATES[archetype].label}
          hint={picked && picked.archetype === archetype ? `Biomechanická šablona pro: ${picked.name}` : 'Biomechanická šablona archetypu'}
          action={
            <select className={`${inputCls} w-auto`} aria-label="Archetyp" value={archetype} onChange={(e) => setArchetype(e.target.value as Archetype)}>
              {ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          }
        >
          <TemplateCard tpl={TEMPLATES[archetype]} />
        </Card>
      </div>
    </div>
  )
}
