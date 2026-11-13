import type { ArchetypeTemplate, Finding, GaitExam, GaitJoint, GaitType, Level, Limb, Num, Pair, Range, StandingJoint, StaticExam } from './types'

export const LIMB_LABEL: Record<Limb, string> = { fl: 'LH', fr: 'PH', hl: 'LP', hr: 'PP' }
export const LIMB_NAME: Record<Limb, string> = {
  fl: 'levá hrudní',
  fr: 'pravá hrudní',
  hl: 'levá pánevní',
  hr: 'pravá pánevní',
}
export const JOINT_LABEL: Record<GaitJoint, string> = {
  shoulder: 'Rameno',
  elbow: 'Loket',
  carpus: 'Zápěstí',
  hip: 'Kyčel',
  stifle: 'Koleno',
  hock: 'Hlezno',
}
export const STANDING_JOINTS: StandingJoint[] = ['shoulder', 'elbow', 'stifle', 'hock']
export const GAIT_JOINTS: GaitJoint[] = ['shoulder', 'elbow', 'carpus', 'hip', 'stifle', 'hock']
export const LIMBS: Limb[] = ['fl', 'fr', 'hl', 'hr']

/** Orientační podíl stojné fáze podle chodu, % cyklu kroku. */
export const STANCE_REF: Record<GaitType, Range> = { walk: [55, 65], trot: [38, 50] }
export const GAIT_LABEL: Record<GaitType, string> = { walk: 'Krok', trot: 'Klus' }

export const LEVEL_LABEL: Record<Level, string> = { ok: 'V normě', mild: 'Mírná odchylka', sig: 'Významná odchylka' }

/** Index symetrie: rozdíl stran vztažený k jejich průměru, %. */
export function symmetryIndex(l: Num, r: Num): Num {
  if (l == null || r == null || l + r === 0) return null
  return (Math.abs(l - r) / ((l + r) / 2)) * 100
}

/** 0–5 % fyziologická, 5–10 % mírná, >10 % klinicky významná asymetrie. */
export function siLevel(si: number): Level {
  return si < 5 ? 'ok' : si <= 10 ? 'mild' : 'sig'
}

export function rangeLevel(v: number, [min, max]: Range, tolerance = 5): Level {
  if (v >= min && v <= max) return 'ok'
  const off = v < min ? min - v : v - max
  return off <= tolerance ? 'mild' : 'sig'
}

const fmt = (n: number, d = 0) => n.toLocaleString('cs-CZ', { maximumFractionDigits: d, minimumFractionDigits: d })
const side = (p: Pair) => ((p.l ?? 0) < (p.r ?? 0) ? 'vlevo' : 'vpravo')

/** Zatížení končetin přepočtené na podíly v %; null, pokud chybí některá hodnota. */
export function loadShares(load: Record<Limb, Num>): Record<Limb, number> | null {
  if (LIMBS.some((k) => load[k] == null)) return null
  const total = LIMBS.reduce((s, k) => s + (load[k] as number), 0)
  if (total <= 0) return null
  return Object.fromEntries(LIMBS.map((k) => [k, ((load[k] as number) / total) * 100])) as Record<Limb, number>
}

export function bcsLabel(bcs: number): { level: Level; text: string } {
  if (bcs <= 3) return { level: bcs <= 2 ? 'sig' : 'mild', text: 'podváha' }
  if (bcs <= 5) return { level: 'ok', text: 'ideální kondice' }
  if (bcs <= 7) return { level: 'mild', text: 'nadváha' }
  return { level: 'sig', text: 'obezita' }
}

export function staticFindings(exam: StaticExam, tpl: ArchetypeTemplate): Finding[] {
  const out: Finding[] = []

  const shares = loadShares(exam.load)
  if (shares) {
    const front = shares.fl + shares.fr
    const lvl = rangeLevel(front, tpl.frontLoadPct, 3)
    out.push({
      level: lvl,
      text:
        lvl === 'ok'
          ? `Hrudní končetiny nesou ${fmt(front)} % hmotnosti – odpovídá typu (${tpl.frontLoadPct[0]}–${tpl.frontLoadPct[1]} %).`
          : front > tpl.frontLoadPct[1]
            ? `Přesun hmotnosti kraniálně: hrudní končetiny nesou ${fmt(front)} % (očekáváno ${tpl.frontLoadPct[0]}–${tpl.frontLoadPct[1]} %). Možné odlehčování pánevních končetin.`
            : `Přesun hmotnosti kaudálně: hrudní končetiny nesou jen ${fmt(front)} % (očekáváno ${tpl.frontLoadPct[0]}–${tpl.frontLoadPct[1]} %). Možné odlehčování hrudních končetin.`,
    })
    for (const [a, c, name] of [['fl', 'fr', 'hrudních'], ['hl', 'hr', 'pánevních']] as const) {
      const si = symmetryIndex(shares[a], shares[c])!
      const lvl2 = siLevel(si)
      if (lvl2 !== 'ok') {
        const lighter = shares[a] < shares[c] ? a : c
        out.push({ level: lvl2, text: `Asymetrie zatížení ${name} končetin ${fmt(si, 1)} % – odlehčována ${LIMB_NAME[lighter]}.` })
      }
    }
  }

  if (exam.bodyLengthCm != null && exam.heightCm != null && exam.heightCm > 0) {
    const ratio = exam.bodyLengthCm / exam.heightCm
    const lvl = rangeLevel(ratio, tpl.bodyRatio, 0.05)
    out.push({
      level: lvl === 'sig' ? 'mild' : lvl,
      text: `Poměr délky těla k výšce ${fmt(ratio, 2)} (typ ${fmt(tpl.bodyRatio[0], 2)}–${fmt(tpl.bodyRatio[1], 2)})${lvl === 'ok' ? '.' : ' – stavba se liší od šablony, zvažte jiný archetyp.'}`,
    })
  }

  for (const j of STANDING_JOINTS) {
    const p = exam.angles[j]
    const ref = tpl.standing[j]
    for (const [val, label] of [[p.l, 'vlevo'], [p.r, 'vpravo']] as const) {
      if (val == null) continue
      const lvl = rangeLevel(val, ref)
      if (lvl !== 'ok')
        out.push({ level: lvl, text: `${JOINT_LABEL[j]} ${label}: úhel ve stoji ${fmt(val)}° je ${val < ref[0] ? 'ostřejší' : 'otevřenější'} než rozsah typu (${ref[0]}–${ref[1]}°).` })
    }
    if (p.l != null && p.r != null && Math.abs(p.l - p.r) > 5)
      out.push({ level: Math.abs(p.l - p.r) > 10 ? 'sig' : 'mild', text: `${JOINT_LABEL[j]}: stranový rozdíl úhlu ve stoji ${fmt(Math.abs(p.l - p.r))}°.` })
  }

  for (const [p, name] of [[exam.thighCm, 'stehna'], [exam.armCm, 'paže']] as const) {
    const si = symmetryIndex(p.l, p.r)
    if (si == null) continue
    const lvl = siLevel(si)
    out.push({
      level: lvl,
      text: lvl === 'ok' ? `Obvod ${name} symetrický (rozdíl ${fmt(si, 1)} %).` : `Asymetrie obvodu ${name} ${fmt(si, 1)} % – menší svalová hmota ${side(p)}.`,
    })
  }

  if (exam.bcs != null) {
    const { level, text } = bcsLabel(exam.bcs)
    out.push({ level, text: `BCS ${exam.bcs}/9 – ${text}.` })
  }

  return out
}

export interface SiRow {
  key: string
  label: string
  si: number
  level: Level
}

/** Indexy symetrie všech změřených levo-pravých párů chůze. */
export function gaitSymmetry(exam: GaitExam): SiRow[] {
  const rows: SiRow[] = []
  const add = (key: string, label: string, l: Num, r: Num) => {
    const si = symmetryIndex(l, r)
    if (si != null) rows.push({ key, label, si, level: siLevel(si) })
  }
  for (const j of GAIT_JOINTS) add(`rom-${j}`, `ROM ${JOINT_LABEL[j].toLowerCase()}`, exam.rom[j].l, exam.rom[j].r)
  add('stance-f', 'Stojná fáze hrudní', exam.stancePct.fl, exam.stancePct.fr)
  add('stance-h', 'Stojná fáze pánevní', exam.stancePct.hl, exam.stancePct.hr)
  add('stride-f', 'Délka kroku hrudní', exam.strideCm.fl, exam.strideCm.fr)
  add('stride-h', 'Délka kroku pánevní', exam.strideCm.hl, exam.strideCm.hr)
  return rows
}

export function gaitFindings(exam: GaitExam, tpl: ArchetypeTemplate): Finding[] {
  const out: Finding[] = []
  const sym = gaitSymmetry(exam)

  if (sym.length) {
    const mean = sym.reduce((s, r) => s + r.si, 0) / sym.length
    const lvl = siLevel(mean)
    out.push({
      level: lvl,
      text: `Průměrný index symetrie ${fmt(mean, 1)} % – ${lvl === 'ok' ? 'fyziologická symetrie' : lvl === 'mild' ? 'mírná asymetrie' : 'klinicky významná asymetrie'}.`,
    })
  }

  for (const j of GAIT_JOINTS) {
    const p = exam.rom[j]
    const ref = tpl.rom[j]
    for (const [val, label] of [[p.l, 'vlevo'], [p.r, 'vpravo']] as const) {
      if (val == null) continue
      const lvl = rangeLevel(val, ref)
      if (lvl !== 'ok')
        out.push({ level: lvl, text: `${JOINT_LABEL[j]} ${label}: ROM ${fmt(val)}° je ${val < ref[0] ? 'snížený' : 'zvýšený'} oproti rozsahu typu (${ref[0]}–${ref[1]}°).` })
    }
    const si = symmetryIndex(p.l, p.r)
    if (si != null && siLevel(si) !== 'ok')
      out.push({ level: siLevel(si), text: `${JOINT_LABEL[j]}: asymetrie ROM ${fmt(si, 1)} % – menší rozsah ${side(p)}.` })
  }

  const ref = STANCE_REF[exam.gait]
  for (const k of LIMBS) {
    const v = exam.stancePct[k]
    if (v == null) continue
    const lvl = rangeLevel(v, ref)
    if (lvl !== 'ok')
      out.push({ level: lvl, text: `Stojná fáze – ${LIMB_NAME[k]}: ${fmt(v)} % cyklu (${GAIT_LABEL[exam.gait].toLowerCase()} orientačně ${ref[0]}–${ref[1]} %).` })
  }
  for (const [a, c, name] of [['fl', 'fr', 'hrudních'], ['hl', 'hr', 'pánevních']] as const) {
    const st = symmetryIndex(exam.stancePct[a], exam.stancePct[c])
    if (st != null && siLevel(st) !== 'ok') {
      const shorter = (exam.stancePct[a] as number) < (exam.stancePct[c] as number) ? a : c
      out.push({ level: siLevel(st), text: `Asymetrie stojné fáze ${name} končetin ${fmt(st, 1)} % – kratší opora: ${LIMB_NAME[shorter]} (možné odlehčování).` })
    }
    const sl = symmetryIndex(exam.strideCm[a], exam.strideCm[c])
    if (sl != null && siLevel(sl) !== 'ok') {
      const shorter = (exam.strideCm[a] as number) < (exam.strideCm[c] as number) ? a : c
      out.push({ level: siLevel(sl), text: `Asymetrie délky kroku ${name} končetin ${fmt(sl, 1)} % – kratší krok: ${LIMB_NAME[shorter]}.` })
    }
  }

  if (exam.headBob) out.push({ level: 'sig', text: 'Kývání hlavou (head bob) – typický znak kulhání hrudní končetiny; hlava klesá při došlapu zdravé končetiny.' })
  if (exam.pelvicAsymmetry) out.push({ level: 'sig', text: 'Asymetrický pohyb pánve (hip hike / pelvic drop) – typický znak kulhání pánevní končetiny.' })
  if (exam.bunnyHop) out.push({ level: 'sig', text: 'Souběžný odraz pánevních končetin (bunny hopping) – často při bolesti kyčlí nebo lumbosakrální oblasti.' })

  return out
}

export const hasStaticData = (e: StaticExam) =>
  [...LIMBS.map((k) => e.load[k]), e.bodyLengthCm, e.bcs, e.thighCm.l, e.thighCm.r, e.armCm.l, e.armCm.r, ...STANDING_JOINTS.flatMap((j) => [e.angles[j].l, e.angles[j].r])].some((v) => v != null)

export const hasGaitData = (e: GaitExam) =>
  [...LIMBS.flatMap((k) => [e.stancePct[k], e.strideCm[k]]), ...GAIT_JOINTS.flatMap((j) => [e.rom[j].l, e.rom[j].r])].some((v) => v != null) ||
  e.headBob || e.pelvicAsymmetry || e.bunnyHop

/** Joints of a static exam that deviate from the template or differ between sides. */
export function flaggedStandingJoints(exam: StaticExam, tpl: ArchetypeTemplate): StandingJoint[] {
  return STANDING_JOINTS.filter((j) => {
    const p = exam.angles[j]
    const off = [p.l, p.r].some((v) => v != null && rangeLevel(v, tpl.standing[j]) !== 'ok')
    return off || (p.l != null && p.r != null && Math.abs(p.l - p.r) > 5)
  })
}

/** Joints of a gait exam with ROM outside the template or asymmetric; observed signs add the joints they point to. */
export function flaggedGaitJoints(exam: GaitExam, tpl: ArchetypeTemplate): GaitJoint[] {
  const flagged = new Set<GaitJoint>(
    GAIT_JOINTS.filter((j) => {
      const p = exam.rom[j]
      const si = symmetryIndex(p.l, p.r)
      return [p.l, p.r].some((v) => v != null && rangeLevel(v, tpl.rom[j]) !== 'ok') || (si != null && siLevel(si) !== 'ok')
    }),
  )
  if (exam.headBob) { flagged.add('shoulder'); flagged.add('elbow') }
  if (exam.pelvicAsymmetry || exam.bunnyHop) flagged.add('hip')
  return GAIT_JOINTS.filter((j) => flagged.has(j))
}
