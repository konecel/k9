import { useEffect, useMemo, useRef, useState } from 'react'
import { BREEDS, breedMeta, getBreed, searchBreeds } from '../lib/breeds'
import type { Breed } from '../lib/types'
import { inputCls } from './ui'

/** Searchable breed field over the full FCI list (diacritics-insensitive). */
export function BreedPicker({ value, onChange }: { value: string; onChange: (b: Breed) => void }) {
  const current = getBreed(value)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchBreeds(q, [...BREEDS]).slice(0, 60), [q])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const pick = (b: Breed) => {
    onChange(b)
    setOpen(false)
    setQ('')
  }

  return (
    <div ref={root} className="relative">
      <input
        role="combobox"
        aria-label="Plemeno"
        aria-expanded={open}
        aria-controls="breed-options"
        className={inputCls}
        placeholder="Začněte psát název plemene…"
        value={open ? q : (current?.name ?? '')}
        onFocus={() => { setOpen(true); setQ(''); setActive(0) }}
        onChange={(e) => { setQ(e.target.value); setActive(0); setOpen(true) }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
          else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); pick(results[active]) }
          else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && (
        <ul id="breed-options" role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-line bg-white py-1 shadow-lg">
          {results.map((b, i) => (
            <li
              key={b.id}
              role="option"
              aria-selected={b.id === value}
              onMouseDown={(e) => { e.preventDefault(); pick(b) }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-1.5 text-sm ${i === active ? 'bg-brand-soft' : ''}`}
            >
              <span className="font-medium">{b.name}</span>
              <span className="block text-xs text-muted">{breedMeta(b)}</span>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-2 text-sm text-muted">Plemeno v nomenklatuře FCI není – zvolte „Kříženec“.</li>}
        </ul>
      )}
    </div>
  )
}
