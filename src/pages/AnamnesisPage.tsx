import { Card, Field, inputCls } from '../components/ui'
import { ONSET_LABEL, PROGRESS_LABEL, SYSTEM_QUESTIONS, emptyAnamnesis } from '../lib/anamnesis'
import { useStore } from '../lib/store'
import type { Anamnesis, YesNo } from '../lib/types'
import { useDog } from './DogLayout'

function Choice<T extends string>({ legend, value, options, onChange }: { legend: string; value: T | null; options: Record<T, string>; onChange: (v: T | null) => void }) {
  return (
    <fieldset>
      <legend className="mb-1 text-xs font-medium text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(options) as [T, string][]).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(value === k ? null : k)}
            className={`rounded-md border px-3 py-1.5 text-sm ${value === k ? 'border-brand bg-brand-soft font-medium text-brand' : 'border-line bg-white hover:bg-paper'}`}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default function AnamnesisPage() {
  const { dog, breed } = useDog()
  const updateDog = useStore((s) => s.updateDog)
  const a = dog.anamnesis ?? emptyAnamnesis()
  const set = (patch: Partial<Anamnesis>) => updateDog(dog.id, { anamnesis: { ...a, ...patch } })
  const text = (key: keyof Anamnesis, label: string, opts: { rows?: number; type?: string; hint?: string } = {}) => (
    <Field label={label} hint={opts.hint}>
      {opts.rows
        ? <textarea rows={opts.rows} className={inputCls} value={a[key] as string} onChange={(e) => set({ [key]: e.target.value })} />
        : <input type={opts.type ?? 'text'} className={inputCls} value={a[key] as string} onChange={(e) => set({ [key]: e.target.value })} />}
    </Field>
  )
  const setSystem = (id: string, patch: Partial<{ answer: YesNo; note: string }>) =>
    set({ systems: { ...a.systems, [id]: { ...(a.systems[id] ?? { answer: null, note: '' }), ...patch } } })

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Návštěva">
          <div className="grid gap-4 sm:grid-cols-2">
            {text('clinic', 'Klinika nebo ordinace')}
            {text('date', 'Datum', { type: 'date' })}
          </div>
        </Card>
        <Card title="Majitel">
          <div className="grid gap-4 sm:grid-cols-2">
            {text('ownerName', 'Jméno majitele')}
            {text('ownerAddress', 'Adresa nebo chov')}
            {text('ownerEmail', 'E-mail', { type: 'email' })}
            {text('ownerPhone', 'Telefon', { type: 'tel' })}
          </div>
        </Card>
      </div>

      <Card title="Zvíře" hint="Jméno, plemeno, pohlaví, věk a hmotnost se přebírají z Profilu.">
        <dl className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
          {[
            ['Jméno', dog.name],
            ['Plemeno', breed?.name ?? '–'],
            ['Pohlaví', `${dog.sex === 'male' ? 'pes' : 'fena'}${dog.neutered ? ', kastr.' : ''}`],
            ['Věk', dog.ageYears != null ? `${dog.ageYears} let` : '–'],
            ['Hmotnost', dog.weightKg != null ? `${dog.weightKg} kg` : '–'],
          ].map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        </dl>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {text('species', 'Druh')}
          {text('neuteredDate', 'Datum kastrace', { type: 'date', hint: dog.neutered ? undefined : 'V Profilu je zvíře vedeno jako nekastrované.' })}
          {text('vaccination', 'Očkování – datum posledního', { type: 'date' })}
          {text('deworming', 'Odčervení – datum a přípravek')}
          {text('diet', 'Strava')}
          {text('environment', 'Prostředí a spolubydlící zvířata')}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Důvod návštěvy" hint="Slovy majitele.">
          <textarea rows={4} className={inputCls} aria-label="Důvod návštěvy" value={a.reason} onChange={(e) => set({ reason: e.target.value })} />
        </Card>
        <Card title="Začátek a průběh" hint="Od kdy; co bylo uděláno, co se změnilo, předchozí epizody.">
          <div className="space-y-4">
            <textarea rows={3} className={inputCls} aria-label="Začátek a průběh" value={a.course} onChange={(e) => set({ course: e.target.value })} />
            <div className="flex flex-wrap gap-6">
              <Choice legend="Začátek" value={a.onset} options={ONSET_LABEL} onChange={(onset) => set({ onset })} />
              <Choice legend="Průběh" value={a.progress} options={PROGRESS_LABEL} onChange={(progress) => set({ progress })} />
            </div>
          </div>
        </Card>
        <Card title="Současné léky a alergie">
          <div className="space-y-4">
            {text('medications', 'Léky a doplňky, které zvíře dostává', { rows: 2, hint: 'Jen název, bez dávek.' })}
            {text('allergies', 'Známé alergie nebo reakce', { rows: 2 })}
          </div>
        </Card>
        <Card title="Předchozí anamnéza">
          <div className="grid gap-4 sm:grid-cols-2">
            {text('surgeries', 'Operace', { rows: 2 })}
            {text('illnesses', 'Dřívější nemoci', { rows: 2 })}
            {text('travel', 'Cesty', { rows: 2 })}
            {text('contacts', 'Kontakt s jinými zvířaty', { rows: 2 })}
            {text('recentBirth', 'Nedávný porod', { rows: 2 })}
            {text('poisoning', 'Možná otrava', { rows: 2 })}
          </div>
        </Card>
      </div>

      <Card title="Otázky podle systémů" hint="Krátký formulář k vyplnění po telefonu nebo v čekárně.">
        <ul className="divide-y divide-line">
          {SYSTEM_QUESTIONS.map((q) => {
            const s = a.systems[q.id] ?? { answer: null, note: '' }
            return (
              <li key={q.id} className="grid items-center gap-2 py-2.5 sm:grid-cols-[minmax(0,2fr)_auto_minmax(0,2fr)] sm:gap-4">
                <span className="text-sm">{q.text}</span>
                <span role="group" aria-label={q.text} className="flex gap-2">
                  {([['yes', 'Ano'], ['no', 'Ne']] as const).map(([v, label]) => (
                    <button key={v} type="button" aria-pressed={s.answer === v} onClick={() => setSystem(q.id, { answer: s.answer === v ? null : v })}
                      className={`w-14 rounded-md border py-1.5 text-sm ${s.answer === v ? 'border-brand bg-brand-soft font-medium text-brand' : 'border-line bg-white hover:bg-paper'}`}>
                      {label}
                    </button>
                  ))}
                </span>
                <input className={inputCls} placeholder="Poznámka" aria-label={`Poznámka: ${q.text}`} value={s.note} onChange={(e) => setSystem(q.id, { note: e.target.value })} />
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
