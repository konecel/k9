import { JOINT_LABEL } from '../lib/analysis'
import { ANATOMY, ANATOMY_SOURCE } from '../lib/anatomy'
import type { GaitJoint } from '../lib/types'

/**
 * Anatomical background for the given joints.
 * `measure` = what the joint is and where to measure it (input pages),
 * `consider` = what a deviation may relate to (report).
 */
export function AnatomyNotes({ joints, mode }: { joints: GaitJoint[]; mode: 'measure' | 'consider' }) {
  return (
    <div className="space-y-4 text-sm">
      {joints.map((j) => {
        const a = ANATOMY[j]
        return (
          <div key={j}>
            <h4 className="font-semibold">{JOINT_LABEL[j]}</h4>
            <p className="mt-0.5">{a.structure}</p>
            <dl className="mt-1.5 grid gap-x-4 gap-y-1 sm:grid-cols-[9rem_1fr]">
              <dt className="text-xs text-muted sm:pt-0.5">Hmatné body</dt><dd>{a.landmarks}</dd>
              <dt className="text-xs text-muted sm:pt-0.5">Natahují (extenze)</dt><dd>{a.extensors}</dd>
              <dt className="text-xs text-muted sm:pt-0.5">Ohýbají (flexe)</dt><dd>{a.flexors}</dd>
            </dl>
            {mode === 'consider' && (
              <>
                <p className="mt-2 text-xs font-medium text-muted">Možné souvislosti k ověření vyšetřením</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">{a.consider.map((c) => <li key={c}>{c}</li>)}</ul>
              </>
            )}
          </div>
        )
      })}
      <p className="border-t border-line pt-2 text-xs text-muted">
        {mode === 'consider' && 'Nejde o diagnózu – výčet slouží jako vodítko pro další vyšetření a vždy se porovnává s druhou stranou. '}
        Zdroj: {ANATOMY_SOURCE}
      </p>
    </div>
  )
}
