import { useNavigate } from 'react-router-dom'
import { TemplateCard } from '../components/TemplateCard'
import { Button, Card, Field, NumInput, inputCls } from '../components/ui'
import { BreedPicker } from '../components/BreedPicker'
import { ARCHETYPES } from '../lib/breeds'
import { useStore } from '../lib/store'
import type { Archetype, Dog } from '../lib/types'
import { useDog } from './DogLayout'

const TEMPLATES_LABEL = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a.label.toLowerCase()]))

export default function ProfilePage() {
  const { dog, breed, tpl } = useDog()
  const { updateDog, deleteDog } = useStore()
  const navigate = useNavigate()
  const set = (patch: Partial<Dog>) => updateDog(dog.id, patch)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Profil psa">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jméno">
            <input className={inputCls} value={dog.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Plemeno">
            <BreedPicker value={dog.breedId} onChange={(b) => set({ breedId: b.id, archetype: b.archetype })} />
          </Field>
          <Field label="Biomechanický archetyp" hint={!breed || breed.fciGroup === 0 ? 'U křížence zvolte typ podle stavby těla.' : breed.archetype !== dog.archetype ? `Upraveno – výchozí pro plemeno je ${TEMPLATES_LABEL[breed.archetype]}.` : undefined}>
            <select className={inputCls} value={dog.archetype} onChange={(e) => set({ archetype: e.target.value as Archetype })}>
              {ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </Field>
          <Field label="Pohlaví">
            <select className={inputCls} value={`${dog.sex}-${dog.neutered}`} onChange={(e) => {
              const [sex, n] = e.target.value.split('-')
              set({ sex: sex as Dog['sex'], neutered: n === 'true' })
            }}>
              <option value="male-false">Pes</option>
              <option value="male-true">Pes, kastrovaný</option>
              <option value="female-false">Fena</option>
              <option value="female-true">Fena, kastrovaná</option>
            </select>
          </Field>
          <Field label="Věk (roky)"><NumInput value={dog.ageYears} onChange={(v) => set({ ageYears: v })} /></Field>
          <Field label="Hmotnost (kg)"><NumInput value={dog.weightKg} onChange={(v) => set({ weightKg: v })} /></Field>
          <Field label="Výška v kohoutku (cm)"><NumInput value={dog.heightCm} onChange={(v) => set({ heightCm: v })} /></Field>
          <Field label="Sport / aktivita">
            <input className={inputCls} value={dog.sport} onChange={(e) => set({ sport: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Poznámky" hint="Podrobná anamnéza (majitel, důvod návštěvy, otázky podle systémů) je na záložce Anamnéza.">
              <textarea rows={4} className={inputCls} value={dog.history} onChange={(e) => set({ history: e.target.value })} />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-between gap-3 border-t border-line pt-4">
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(`Smazat psa ${dog.name} včetně všech měření?`)) {
                deleteDog(dog.id)
                navigate('/')
              }
            }}
          >
            Smazat psa
          </Button>
          <Button onClick={() => navigate('static')}>Pokračovat na statickou analýzu →</Button>
        </div>
      </Card>
      <Card title={tpl.label} hint="Biomechanická šablona, se kterou se měření porovnávají">
        <TemplateCard tpl={tpl} />
      </Card>
    </div>
  )
}
