import { GAIT_JOINTS, JOINT_LABEL, STANDING_JOINTS } from '../lib/analysis'
import type { ArchetypeTemplate } from '../lib/types'

const n = (v: number) => v.toLocaleString('cs-CZ')
const r = (x: [number, number], unit = '°') => `${n(x[0])}–${n(x[1])}${unit}`

export function TemplateCard({ tpl }: { tpl: ArchetypeTemplate }) {
  return (
    <div className="space-y-4 text-sm">
      <p>{tpl.summary}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Stoj</h4>
          <table className="w-full">
            <tbody className="divide-y divide-line">
              <tr><td className="py-1">Délka těla : výška</td><td className="py-1 text-right tabular-nums">{r(tpl.bodyRatio, '')}</td></tr>
              <tr><td className="py-1">Zatížení hrudních končetin</td><td className="py-1 text-right tabular-nums">{r(tpl.frontLoadPct, ' %')}</td></tr>
              {STANDING_JOINTS.map((j) => (
                <tr key={j}><td className="py-1">{JOINT_LABEL[j]} – úhel</td><td className="py-1 text-right tabular-nums">{r(tpl.standing[j])}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Klus – rozsah pohybu</h4>
          <table className="w-full">
            <tbody className="divide-y divide-line">
              {GAIT_JOINTS.map((j) => (
                <tr key={j}><td className="py-1">{JOINT_LABEL[j]}</td><td className="py-1 text-right tabular-nums">{r(tpl.rom[j])}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Silné stránky</h4>
          <ul className="list-disc space-y-1 pl-4">{tpl.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Rizika a typické kompenzace</h4>
          <ul className="list-disc space-y-1 pl-4">{tpl.risks.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
      <p className="text-xs text-muted">Referenční rozsahy jsou orientační a čekají na odbornou revizi.</p>
    </div>
  )
}
