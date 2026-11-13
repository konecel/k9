import type { ReactNode } from 'react'
import { LEVEL_LABEL } from '../lib/analysis'
import type { Finding, Level, Num } from '../lib/types'

export const inputCls =
  'w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

export function Card({ title, hint, children, action }: { title?: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-line bg-white p-5">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
        {children}
      </label>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

/** Number input where an empty field means "not measured" (null), never 0. */
export function NumInput({ value, onChange, label, min = 0, max, step = 'any' }: { value: Num; onChange: (v: Num) => void; label?: string; min?: number; max?: number; step?: number | 'any' }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={label}
      className={inputCls}
      value={value ?? ''}
      min={min}
      max={max}
      step={step}
      placeholder="–"
      onChange={(e) => {
        const n = e.target.value === '' ? null : Number(e.target.value)
        onChange(n == null || Number.isNaN(n) ? null : n)
      }}
    />
  )
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger'; type?: 'button' | 'submit'; disabled?: boolean }) {
  const cls = {
    primary: 'bg-brand text-white hover:bg-brand/90',
    ghost: 'border border-line bg-white text-ink hover:bg-paper',
    danger: 'border border-line bg-white text-sig hover:bg-sig/5',
  }[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 ${cls}`}>
      {children}
    </button>
  )
}

const LEVEL_STYLE: Record<Level, { dot: string; icon: string }> = {
  ok: { dot: 'bg-ok', icon: '✓' },
  mild: { dot: 'bg-mild', icon: '!' },
  sig: { dot: 'bg-sig', icon: '✕' },
}

export function LevelBadge({ level }: { level: Level }) {
  const s = LEVEL_STYLE[level]
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink">
      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${s.dot}`}>{s.icon}</span>
      {LEVEL_LABEL[level]}
    </span>
  )
}

export function FindingList({ findings, empty }: { findings: Finding[]; empty: string }) {
  if (!findings.length) return <p className="text-sm text-muted">{empty}</p>
  const order: Level[] = ['sig', 'mild', 'ok']
  const sorted = [...findings].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level))
  return (
    <ul className="divide-y divide-line">
      {sorted.map((f, i) => (
        <li key={i} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:gap-4">
          <span className="sm:w-40"><LevelBadge level={f.level} /></span>
          <span className="text-sm">{f.text}</span>
        </li>
      ))}
    </ul>
  )
}

/** Picker + new/delete for the dated measurements of one dog. */
export function ExamBar<T extends { id: string; date: string }>({ exams, currentId, onSelect, onNew, onDelete, onDate }: { exams: T[]; currentId: string; onSelect: (id: string) => void; onNew: () => void; onDelete: () => void; onDate: (date: string) => void }) {
  const current = exams.find((e) => e.id === currentId)
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Měření">
        <select className={inputCls} value={currentId} onChange={(e) => onSelect(e.target.value)}>
          {exams.map((e, i) => (
            <option key={e.id} value={e.id}>
              {new Date(e.date).toLocaleDateString('cs-CZ')} {i === 0 ? '(nejnovější)' : ''}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Datum">
        <input type="date" className={inputCls} value={current?.date ?? ''} onChange={(e) => e.target.value && onDate(e.target.value)} />
      </Field>
      <Button variant="ghost" onClick={onNew}>+ Nové měření</Button>
      <Button variant="danger" onClick={() => confirm('Smazat toto měření?') && onDelete()}>Smazat</Button>
    </div>
  )
}
