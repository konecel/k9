import { useState } from 'react'
import { Button, Card, ExamBar, Field, FindingList, NumInput, inputCls } from '../components/ui'
import { JOINT_LABEL, LIMBS, LIMB_LABEL, LIMB_NAME, STANDING_JOINTS, bcsLabel, loadShares, staticFindings } from '../lib/analysis'
import { byDog, useStore } from '../lib/store'
import type { Pair, StaticExam } from '../lib/types'
import { useDog } from './DogLayout'

function PairInputs({ value, onChange, label }: { value: Pair; onChange: (p: Pair) => void; label: string }) {
  return (
    <>
      <td className="py-1.5 pr-2"><NumInput label={`${label} vlevo`} value={value.l} onChange={(l) => onChange({ ...value, l })} /></td>
      <td className="py-1.5 pr-2"><NumInput label={`${label} vpravo`} value={value.r} onChange={(r) => onChange({ ...value, r })} /></td>
    </>
  )
}

export default function StaticPage() {
  const { dog, tpl } = useDog()
  const { staticExams, addStatic, updateStatic, deleteStatic } = useStore()
  const exams = byDog(staticExams, dog.id)
  const [selected, setSelected] = useState<string | null>(null)
  const exam = exams.find((e) => e.id === selected) ?? exams[0]

  if (!exam) {
    return (
      <div className="rounded-xl border-2 border-dashed border-line p-12 text-center">
        <p className="mb-4 text-muted">Statická analýza hodnotí stoj: zatížení končetin, úhly kloubů, symetrii svalů a kondici.</p>
        <Button onClick={() => setSelected(addStatic(dog.id))}>Začít statické měření</Button>
      </div>
    )
  }

  const set = (patch: Partial<StaticExam>) => updateStatic(exam.id, patch)
  const shares = loadShares(exam.load)
  const findings = staticFindings(exam, tpl)

  return (
    <div className="space-y-5">
      <ExamBar
        exams={exams}
        currentId={exam.id}
        onSelect={setSelected}
        onNew={() => setSelected(addStatic(dog.id))}
        onDelete={() => { deleteStatic(exam.id); setSelected(null) }}
        onDate={(date) => set({ date })}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Zatížení končetin" hint="Hodnoty z vah v kg nebo v % – přepočítají se na podíly.">
          <div className="grid grid-cols-2 gap-3">
            {LIMBS.map((k) => (
              <Field key={k} label={`${LIMB_LABEL[k]} – ${LIMB_NAME[k]}`}>
                <NumInput value={exam.load[k]} onChange={(v) => set({ load: { ...exam.load, [k]: v } })} />
              </Field>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            {shares
              ? <>Hrudní : pánevní <strong className="text-ink tabular-nums">{Math.round(shares.fl + shares.fr)} : {Math.round(shares.hl + shares.hr)}</strong> · levá : pravá <strong className="text-ink tabular-nums">{Math.round(shares.fl + shares.hl)} : {Math.round(shares.fr + shares.hr)}</strong></>
              : 'Vyplňte všechny čtyři končetiny pro výpočet rozložení.'}
          </p>
        </Card>

        <Card title="Rozměry a kondice">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Délka těla (cm)" hint="Hrot ramene – hrbol sedací">
              <NumInput value={exam.bodyLengthCm} onChange={(v) => set({ bodyLengthCm: v })} />
            </Field>
            <Field label="Výška v kohoutku (cm)">
              <NumInput value={exam.heightCm} onChange={(v) => set({ heightCm: v })} />
            </Field>
            <div className="col-span-2">
              <Field label="BCS – Body Condition Score (1–9)" hint={exam.bcs != null ? `${exam.bcs}/9 – ${bcsLabel(exam.bcs).text}` : '4–5 je ideální kondice'}>
                <select className={inputCls} value={exam.bcs ?? ''} onChange={(e) => set({ bcs: e.target.value === '' ? null : Number(e.target.value) })}>
                  <option value="">Nehodnoceno</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n} – {bcsLabel(n).text}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Úhly kloubů ve stoji" hint="Ve stupních, měřeno goniometrem nebo z fotografie z boku.">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-1 font-medium">Kloub</th><th className="pb-1 font-medium">Levá (°)</th><th className="pb-1 font-medium">Pravá (°)</th><th className="pb-1 text-right font-medium">Typ</th>
              </tr>
            </thead>
            <tbody>
              {STANDING_JOINTS.map((j) => (
                <tr key={j}>
                  <td className="py-1.5 pr-2">{JOINT_LABEL[j]}</td>
                  <PairInputs label={JOINT_LABEL[j]} value={exam.angles[j]} onChange={(p) => set({ angles: { ...exam.angles, [j]: p } })} />
                  <td className="py-1.5 text-right text-xs text-muted tabular-nums">{tpl.standing[j][0]}–{tpl.standing[j][1]}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Obvody svalů" hint="V centimetrech, měřeno ve stejné výšce na obou stranách.">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-1 font-medium">Místo</th><th className="pb-1 font-medium">Levá (cm)</th><th className="pb-1 font-medium">Pravá (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="py-1.5 pr-2">Stehno</td><PairInputs label="Stehno" value={exam.thighCm} onChange={(p) => set({ thighCm: p })} /></tr>
              <tr><td className="py-1.5 pr-2">Paže</td><PairInputs label="Paže" value={exam.armCm} onChange={(p) => set({ armCm: p })} /></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Poznámky ke stoji" hint="Postoj, linie hřbetu, palpační nález…">
        <textarea rows={3} className={inputCls} aria-label="Poznámky ke stoji" value={exam.notes} onChange={(e) => set({ notes: e.target.value })} />
      </Card>

      <Card title="Průběžné vyhodnocení" hint={`Porovnání se šablonou: ${tpl.label}`}>
        <FindingList findings={findings} empty="Zadejte měření – vyhodnocení se zobrazí hned." />
      </Card>
    </div>
  )
}
