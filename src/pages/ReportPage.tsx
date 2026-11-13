import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RangeChart, SiChart, type RangeRow } from '../components/charts'
import { Button, Card, Field, FindingList, inputCls } from '../components/ui'
import { GAIT_JOINTS, GAIT_LABEL, JOINT_LABEL, STANCE_REF, STANDING_JOINTS, gaitFindings, gaitSymmetry, hasGaitData, hasStaticData, loadShares, staticFindings } from '../lib/analysis'
import { byDog, useStore } from '../lib/store'
import type { Range } from '../lib/types'
import { useDog } from './DogLayout'

const date = (d: string) => new Date(d).toLocaleDateString('cs-CZ')
const measured = (rows: RangeRow[]) => rows.filter((r) => r.l != null || r.r != null)

function ChartCard({ title, hint, rows, unit, refLabel }: { title: string; hint: string; rows: RangeRow[]; unit: string; refLabel?: string }) {
  const data = measured(rows)
  return (
    <Card title={title} hint={hint}>
      {data.length ? <RangeChart rows={data} unit={unit} refLabel={refLabel} /> : <p className="text-sm text-muted">Nezměřeno.</p>}
    </Card>
  )
}

function Empty({ text, to, cta }: { text: string; to: string; cta: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-line p-8 text-center text-sm text-muted">
      {text} <Link to={to} className="no-print font-medium text-brand underline">{cta}</Link>
    </div>
  )
}

export default function ReportPage() {
  const { dog, breed, tpl } = useDog()
  const statics = byDog(useStore((s) => s.staticExams), dog.id).filter(hasStaticData)
  const gaits = byDog(useStore((s) => s.gaitExams), dog.id).filter(hasGaitData)
  const [staticId, setStaticId] = useState<string | null>(null)
  const [gaitId, setGaitId] = useState<string | null>(null)
  const st = statics.find((e) => e.id === staticId) ?? statics[0]
  const ga = gaits.find((e) => e.id === gaitId) ?? gaits[0]

  const shares = st ? loadShares(st.load) : null
  const half = (r: Range): Range => [r[0] / 2, r[1] / 2]
  const hindRef: Range = [100 - tpl.frontLoadPct[1], 100 - tpl.frontLoadPct[0]]

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-end gap-3">
        {statics.length > 0 && (
          <Field label="Statické měření">
            <select className={inputCls} value={st?.id} onChange={(e) => setStaticId(e.target.value)}>
              {statics.map((e) => <option key={e.id} value={e.id}>{date(e.date)}</option>)}
            </select>
          </Field>
        )}
        {gaits.length > 0 && (
          <Field label="Dynamické měření">
            <select className={inputCls} value={ga?.id} onChange={(e) => setGaitId(e.target.value)}>
              {gaits.map((e) => <option key={e.id} value={e.id}>{date(e.date)} · {GAIT_LABEL[e.gait]}</option>)}
            </select>
          </Field>
        )}
        <div className="ml-auto"><Button variant="ghost" onClick={() => window.print()}>Tisk / PDF</Button></div>
      </div>

      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          {[
            ['Plemeno', breed?.name ?? '–'],
            ['Archetyp', tpl.label],
            ['Věk', dog.ageYears != null ? `${dog.ageYears} let` : '–'],
            ['Hmotnost', dog.weightKg != null ? `${dog.weightKg} kg` : '–'],
            ['Pohlaví', `${dog.sex === 'male' ? 'pes' : 'fena'}${dog.neutered ? ', kastr.' : ''}`],
            ['Výška', dog.heightCm != null ? `${dog.heightCm} cm` : '–'],
            ['Sport', dog.sport || '–'],
            ['BCS', st?.bcs != null ? `${st.bcs}/9` : '–'],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
          ))}
        </dl>
        {dog.history && <p className="mt-4 border-t border-line pt-3 text-sm"><span className="text-xs text-muted">Anamnéza: </span>{dog.history}</p>}
      </Card>

      <section className="space-y-5">
        <h2 className="text-xl font-bold">Statická analýza {st && <span className="text-sm font-normal text-muted">· {date(st.date)}</span>}</h2>
        {!st ? (
          <Empty text="Statické měření zatím není vyplněné." to="../static" cta="Zadat měření" />
        ) : (
          <>
            <Card title="Nálezy ve stoji">
              <FindingList findings={staticFindings(st, tpl)} empty="Bez nálezů." />
              {st.notes && <p className="mt-3 border-t border-line pt-3 text-sm whitespace-pre-wrap"><span className="text-xs text-muted">Poznámky: </span>{st.notes}</p>}
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Zatížení končetin" hint="Podíl tělesné hmotnosti na každé končetině. Šedý pás = očekávání pro typ.">
                {shares ? (
                  <RangeChart
                    unit=" %"
                    rows={[
                      { label: 'Hrudní končetiny', band: half(tpl.frontLoadPct), l: shares.fl, r: shares.fr },
                      { label: 'Pánevní končetiny', band: half(hindRef), l: shares.hl, r: shares.hr },
                    ]}
                  />
                ) : <p className="text-sm text-muted">Nezměřeno.</p>}
              </Card>
              <ChartCard
                title="Úhly kloubů ve stoji"
                hint="Šedý pás = rozsah typu, body = naměřená levá a pravá strana."
                unit="°"
                rows={STANDING_JOINTS.map((j) => ({ label: JOINT_LABEL[j], band: tpl.standing[j], ...st.angles[j] }))}
              />
            </div>
          </>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-bold">Dynamická analýza {ga && <span className="text-sm font-normal text-muted">· {date(ga.date)} · {GAIT_LABEL[ga.gait].toLowerCase()}</span>}</h2>
        {!ga ? (
          <Empty text="Dynamické měření zatím není vyplněné." to="../gait" cta="Zadat měření" />
        ) : (
          <>
            <Card title="Nálezy v pohybu">
              <FindingList findings={gaitFindings(ga, tpl)} empty="Bez nálezů." />
              {ga.notes && <p className="mt-3 border-t border-line pt-3 text-sm whitespace-pre-wrap"><span className="text-xs text-muted">Poznámky: </span>{ga.notes}</p>}
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <ChartCard
                title="Rozsah pohybu kloubů (ROM)"
                hint="Šedý pás = rozsah typu v klusu, body = naměřená levá a pravá strana."
                unit="°"
                rows={GAIT_JOINTS.map((j) => ({ label: JOINT_LABEL[j], band: tpl.rom[j], ...ga.rom[j] }))}
              />
              <ChartCard
                title="Stojná fáze"
                hint="Podíl stojné fáze na cyklu kroku. Zbytek do 100 % je švihová fáze."
                unit=" %"
                refLabel={`Orientačně pro ${GAIT_LABEL[ga.gait].toLowerCase()}`}
                rows={[
                  { label: 'Hrudní končetiny', band: STANCE_REF[ga.gait], l: ga.stancePct.fl, r: ga.stancePct.fr },
                  { label: 'Pánevní končetiny', band: STANCE_REF[ga.gait], l: ga.stancePct.hl, r: ga.stancePct.hr },
                ]}
              />
            </div>
            <Card title="Index symetrie" hint="Rozdíl levé a pravé strany v % jejich průměru. Do 5 % fyziologická, 5–10 % mírná, nad 10 % klinicky významná asymetrie.">
              {gaitSymmetry(ga).length ? <SiChart rows={gaitSymmetry(ga)} /> : <p className="text-sm text-muted">Nezměřeno – zadejte hodnoty pro levou i pravou stranu.</p>}
            </Card>
          </>
        )}
      </section>

      <p className="text-xs text-muted">Report je podpůrný nástroj pro fyzioterapeuta a nenahrazuje veterinární diagnózu. Referenční rozsahy jsou orientační.</p>
    </div>
  )
}
