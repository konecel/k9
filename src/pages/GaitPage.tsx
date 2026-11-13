import { useState } from 'react'
import { AnatomyNotes } from '../components/AnatomyNotes'
import { Button, Card, ExamBar, Field, FindingList, LevelBadge, NumInput, inputCls } from '../components/ui'
import { GAIT_JOINTS, GAIT_LABEL, JOINT_LABEL, LIMBS, LIMB_LABEL, LIMB_NAME, STANCE_REF, gaitFindings, siLevel, symmetryIndex } from '../lib/analysis'
import { byDog, useStore } from '../lib/store'
import type { GaitExam, GaitType } from '../lib/types'
import { useDog } from './DogLayout'

const FLAGS: { key: 'headBob' | 'pelvicAsymmetry' | 'bunnyHop'; label: string; hint: string }[] = [
  { key: 'headBob', label: 'Kývání hlavou (head bob)', hint: 'kulhání hrudní končetiny' },
  { key: 'pelvicAsymmetry', label: 'Asymetrický pohyb pánve', hint: 'kulhání pánevní končetiny' },
  { key: 'bunnyHop', label: 'Souběžný odraz pánevních končetin', hint: 'tzv. bunny hopping' },
]

export default function GaitPage() {
  const { dog, tpl } = useDog()
  const { gaitExams, addGait, updateGait, deleteGait } = useStore()
  const exams = byDog(gaitExams, dog.id)
  const [selected, setSelected] = useState<string | null>(null)
  const exam = exams.find((e) => e.id === selected) ?? exams[0]

  if (!exam) {
    return (
      <div className="rounded-xl border-2 border-dashed border-line p-12 text-center">
        <p className="mb-4 text-muted">Dynamická analýza hodnotí pohyb: rozsah pohybu kloubů, stojnou a švihovou fázi a symetrii.</p>
        <Button onClick={() => setSelected(addGait(dog.id))}>Začít dynamické měření</Button>
      </div>
    )
  }

  const set = (patch: Partial<GaitExam>) => updateGait(exam.id, patch)
  const stanceRef = STANCE_REF[exam.gait]
  const findings = gaitFindings(exam, tpl)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <ExamBar
          exams={exams}
          currentId={exam.id}
          onSelect={setSelected}
          onNew={() => setSelected(addGait(dog.id))}
          onDelete={() => { deleteGait(exam.id); setSelected(null) }}
          onDate={(date) => set({ date })}
        />
        <Field label="Chod">
          <select className={inputCls} value={exam.gait} onChange={(e) => set({ gait: e.target.value as GaitType })}>
            {(Object.keys(GAIT_LABEL) as GaitType[]).map((g) => <option key={g} value={g}>{GAIT_LABEL[g]}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Fáze kroku a délka kroku" hint={`Stojná fáze v % cyklu (${GAIT_LABEL[exam.gait].toLowerCase()} orientačně ${stanceRef[0]}–${stanceRef[1]} %). Švihová fáze se dopočítá.`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-1 font-medium">Končetina</th><th className="pb-1 font-medium">Stojná (%)</th><th className="pb-1 font-medium">Švihová (%)</th><th className="pb-1 font-medium">Krok (cm)</th>
              </tr>
            </thead>
            <tbody>
              {LIMBS.map((k) => (
                <tr key={k}>
                  <td className="py-1.5 pr-2" title={LIMB_NAME[k]}><strong>{LIMB_LABEL[k]}</strong> <span className="hidden text-xs text-muted sm:inline">{LIMB_NAME[k]}</span></td>
                  <td className="py-1.5 pr-2"><NumInput label={`Stojná fáze ${LIMB_NAME[k]}`} max={100} value={exam.stancePct[k]} onChange={(v) => set({ stancePct: { ...exam.stancePct, [k]: v } })} /></td>
                  <td className="py-1.5 pr-2 tabular-nums text-muted">{exam.stancePct[k] != null ? 100 - exam.stancePct[k]! : '–'}</td>
                  <td className="py-1.5"><NumInput label={`Délka kroku ${LIMB_NAME[k]}`} value={exam.strideCm[k]} onChange={(v) => set({ strideCm: { ...exam.strideCm, [k]: v } })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Rozsah pohybu kloubů (ROM)" hint="Rozdíl maximální flexe a extenze během cyklu kroku, ve stupních.">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-1 font-medium">Kloub</th><th className="pb-1 font-medium">Levá (°)</th><th className="pb-1 font-medium">Pravá (°)</th><th className="pb-1 font-medium">Symetrie</th><th className="pb-1 text-right font-medium">Typ</th>
              </tr>
            </thead>
            <tbody>
              {GAIT_JOINTS.map((j) => {
                const p = exam.rom[j]
                const si = symmetryIndex(p.l, p.r)
                return (
                  <tr key={j}>
                    <td className="py-1.5 pr-2">{JOINT_LABEL[j]}</td>
                    <td className="py-1.5 pr-2"><NumInput label={`ROM ${JOINT_LABEL[j]} vlevo`} value={p.l} onChange={(l) => set({ rom: { ...exam.rom, [j]: { ...p, l } } })} /></td>
                    <td className="py-1.5 pr-2"><NumInput label={`ROM ${JOINT_LABEL[j]} vpravo`} value={p.r} onChange={(r) => set({ rom: { ...exam.rom, [j]: { ...p, r } } })} /></td>
                    <td className="py-1.5 pr-2 text-xs">
                      {si == null ? <span className="text-muted">–</span> : <span className="flex flex-col"><span className="tabular-nums">{si.toFixed(1).replace('.', ',')} %</span><span className="hidden xl:inline"><LevelBadge level={siLevel(si)} /></span></span>}
                    </td>
                    <td className="py-1.5 text-right text-xs text-muted tabular-nums">{tpl.rom[j][0]}–{tpl.rom[j][1]}°</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <details className="mt-3 rounded-lg border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium text-brand">Anatomie kloubů a kde měřit</summary>
            <div className="mt-3"><AnatomyNotes joints={GAIT_JOINTS} mode="measure" /></div>
          </details>
        </Card>
      </div>

      <Card title="Pozorování v pohybu">
        <div className="grid gap-3 sm:grid-cols-3">
          {FLAGS.map((f) => (
            <label key={f.key} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="checkbox" className="mt-0.5 accent-[var(--color-brand)]" checked={exam[f.key]} onChange={(e) => set({ [f.key]: e.target.checked })} />
              <span><span className="font-medium">{f.label}</span><span className="block text-xs text-muted">{f.hint}</span></span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Poznámky k pohybu">
            <textarea rows={3} className={inputCls} value={exam.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="Průběžné vyhodnocení" hint={`Porovnání se šablonou: ${tpl.label}`}>
        <FindingList findings={findings} empty="Zadejte měření – vyhodnocení se zobrazí hned." />
      </Card>
    </div>
  )
}
