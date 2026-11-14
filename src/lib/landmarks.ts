import { JOINT_LABEL, siLevel, symmetryIndex } from './analysis'
import type { ExamPhoto, Finding, Level, Pair, PhotoView, StandingJoint, StaticExam } from './types'

export interface Landmark {
  id: string
  label: string
  /** kde bod hledat – zobrazí se člověku */
  hint: string
  /** popis pro AI */
  en: string
}

export const VIEWS: { id: PhotoView; label: string; tip: string }[] = [
  { id: 'left', label: 'Levý bok', tip: 'Pes stojí rovně na rovné podložce, foťte kolmo na bok z výšky hrudníku. Všechny čtyři tlapky musí být vidět.' },
  { id: 'right', label: 'Pravý bok', tip: 'Stejně jako levý bok, z druhé strany – ideálně ze stejné vzdálenosti.' },
  { id: 'front', label: 'Zepředu', tip: 'Foťte z výšky hrudníku přesně v ose psa. Levá strana psa je na fotce vpravo.' },
  { id: 'rear', label: 'Zezadu', tip: 'Foťte z výšky pánve přesně v ose psa, ocas stranou, pokud zakrývá sedací hrboly.' },
  { id: 'top', label: 'Shora', tip: 'Foťte kolmo shora nad středem hřbetu, pes se dívá rovně před sebe.' },
]
export const VIEW_LABEL = Object.fromEntries(VIEWS.map((v) => [v.id, v.label])) as Record<PhotoView, string>

const SIDE: Landmark[] = [
  { id: 'withers', label: 'Kohoutek', hint: 'Nejvyšší bod lopatky na hřbetě.', en: 'withers: highest point of the scapula (dorsal border) on the topline' },
  { id: 'shoulder', label: 'Ramenní kloub', hint: 'Hrot ramene – velký hrbol pažní kosti.', en: 'point of shoulder: greater tubercle of the humerus (shoulder joint) on the limb facing the camera' },
  { id: 'elbow', label: 'Loket', hint: 'Laterální epikondyl pažní kosti.', en: 'elbow joint: lateral epicondyle of the humerus, forelimb facing the camera' },
  { id: 'carpus', label: 'Zápěstí', hint: 'Střed zápěstního kloubu z boku.', en: 'carpus (wrist) joint centre, forelimb facing the camera' },
  { id: 'frontPaw', label: 'Hrudní tlapka', hint: 'Místo, kde se tlapka dotýká země.', en: 'ground contact point of the front paw facing the camera' },
  { id: 'ischium', label: 'Sedací hrbol', hint: 'Nejzazší bod pánve pod kořenem ocasu.', en: 'ischial tuberosity: rearmost point of the pelvis below the tail base' },
  { id: 'hip', label: 'Kyčel', hint: 'Velký chocholík stehenní kosti.', en: 'hip joint: greater trochanter of the femur, hindlimb facing the camera' },
  { id: 'stifle', label: 'Koleno', hint: 'Střed kolenního kloubu z boku.', en: 'stifle (knee) joint centre, hindlimb facing the camera' },
  { id: 'hock', label: 'Hlezno', hint: 'Laterální kotník – střed hlezenního kloubu.', en: 'hock (tarsal) joint: lateral malleolus, hindlimb facing the camera' },
  { id: 'hindPaw', label: 'Pánevní tlapka', hint: 'Místo, kde se tlapka dotýká země.', en: 'ground contact point of the hind paw facing the camera' },
]

const lr = (id: string, label: string, hint: string, en: string): Landmark[] => [
  { id: `${id}L`, label: `${label} – levá strana psa`, hint, en: `${en}, on the DOG'S LEFT side` },
  { id: `${id}R`, label: `${label} – pravá strana psa`, hint, en: `${en}, on the DOG'S RIGHT side` },
]

export const LANDMARKS: Record<PhotoView, Landmark[]> = {
  left: SIDE,
  right: SIDE,
  front: [
    ...lr('shoulder', 'Hrot ramene', 'Při pohledu zepředu je levá strana psa na fotce vpravo.', 'point of shoulder (greater tubercle of the humerus)'),
    ...lr('elbow', 'Loket', 'Střed lokte zepředu.', 'elbow, centre of the limb at elbow height'),
    ...lr('carpus', 'Zápěstí', 'Střed zápěstí zepředu.', 'carpus (wrist), centre of the joint'),
    ...lr('paw', 'Tlapka', 'Střed tlapky u země.', 'centre of the front paw at the ground'),
  ],
  rear: [
    ...lr('ischium', 'Sedací hrbol', 'Při pohledu zezadu je levá strana psa na fotce vlevo.', 'ischial tuberosity'),
    ...lr('hock', 'Hlezno', 'Vrchol patní kosti.', 'point of hock (calcaneal tuber)'),
    ...lr('paw', 'Tlapka', 'Střed tlapky u země.', 'centre of the hind paw at the ground'),
  ],
  top: [
    { id: 'occiput', label: 'Týl', hint: 'Týlní hrbol na hlavě.', en: 'occiput (back of the skull)' },
    { id: 'withers', label: 'Kohoutek', hint: 'Střed mezi lopatkami.', en: 'withers: midline between the shoulder blades' },
    { id: 'midback', label: 'Přechod hrudní a bederní páteře', hint: 'Střed hřbetu za posledním žebrem.', en: 'thoracolumbar junction on the dorsal midline, just behind the last rib' },
    { id: 'sacrum', label: 'Křížová kost', hint: 'Střed mezi kyčelními hrboly.', en: 'sacrum on the dorsal midline, between the hip bones' },
    { id: 'tailBase', label: 'Kořen ocasu', hint: 'Nasazení ocasu.', en: 'base of the tail on the midline' },
    ...lr('shoulder', 'Obrys v ramenou', 'Nejširší místo obrysu v úrovni lopatek.', 'body outline at its widest point at shoulder level'),
    ...lr('waist', 'Obrys v pase', 'Nejužší místo obrysu za žebry.', 'body outline at the waist (narrowest point behind the ribs)'),
    ...lr('hip', 'Obrys v kyčlích', 'Nejširší místo obrysu v úrovni kyčlí.', 'body outline at its widest point at hip level'),
  ],
}

const SIDE_SEG: [string, string][] = [['withers', 'shoulder'], ['shoulder', 'elbow'], ['elbow', 'carpus'], ['carpus', 'frontPaw'], ['hip', 'stifle'], ['stifle', 'hock'], ['hock', 'hindPaw'], ['shoulder', 'ischium']]
const both = (pairs: [string, string][]): [string, string][] => pairs.flatMap(([a, b]) => [[`${a}L`, `${b}L`], [`${a}R`, `${b}R`]] as [string, string][])

/** Spojnice bodů, které se kreslí přes fotku. */
export const SEGMENTS: Record<PhotoView, [string, string][]> = {
  left: SIDE_SEG,
  right: SIDE_SEG,
  front: [...both([['shoulder', 'elbow'], ['elbow', 'carpus'], ['carpus', 'paw']]), ['shoulderL', 'shoulderR']],
  rear: [...both([['ischium', 'hock'], ['hock', 'paw']]), ['ischiumL', 'ischiumR']],
  top: [['occiput', 'withers'], ['withers', 'midback'], ['midback', 'sacrum'], ['sacrum', 'tailBase'], ['shoulderL', 'shoulderR'], ['waistL', 'waistR'], ['hipL', 'hipR']],
}

export interface Measure {
  key: string
  label: string
  value: number
  unit: string
  /** jen u hodnot, které mají orientační mez */
  level?: Level
  note?: string
}

type P = { x: number; y: number }
const sub = (a: P, b: P): P => ({ x: a.x - b.x, y: a.y - b.y })
const len = (a: P) => Math.hypot(a.x, a.y)
const dot = (a: P, b: P) => a.x * b.x + a.y * b.y
const cross = (a: P, b: P) => a.x * b.y - a.y * b.x
const deg = (r: number) => (r * 180) / Math.PI

/** Úhel ve vrcholu b, ve stupních. */
export function angleAt(a: P, b: P, c: P): number | null {
  const u = sub(a, b)
  const v = sub(c, b)
  if (!len(u) || !len(v)) return null
  return deg(Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (len(u) * len(v))))))
}

const step = (v: number, mild: number, sig: number): Level => (v <= mild ? 'ok' : v <= sig ? 'mild' : 'sig')

const SIDE_ANGLES: [StandingJoint, string, string, string][] = [
  ['shoulder', 'withers', 'shoulder', 'elbow'],
  ['elbow', 'shoulder', 'elbow', 'carpus'],
  ['stifle', 'hip', 'stifle', 'hock'],
  ['hock', 'stifle', 'hock', 'hindPaw'],
]

/** Všechno, co lze z bodů jedné fotky spočítat. Chybějící body = chybějící řádek. */
export function photoMeasures(photo: ExamPhoto): Measure[] {
  const pt = (id: string): P | null => {
    const p = photo.points[id]
    return p ? { x: p.x * photo.w, y: p.y * photo.h } : null
  }
  const out: Measure[] = []

  if (photo.view === 'left' || photo.view === 'right') {
    for (const [joint, a, b, c] of SIDE_ANGLES) {
      const [pa, pb, pc] = [pt(a), pt(b), pt(c)]
      const v = pa && pb && pc ? angleAt(pa, pb, pc) : null
      if (v != null) out.push({ key: joint, label: `${JOINT_LABEL[joint]} – úhel`, value: v, unit: '°' })
    }
    const [w, s, i, f, h] = [pt('withers'), pt('shoulder'), pt('ischium'), pt('frontPaw'), pt('hindPaw')]
    if (w && s && i && f) {
      // podložka = spojnice tlapek; bez pánevní tlapky se bere vodorovně
      const g = h && len(sub(h, f)) ? sub(h, f) : { x: 1, y: 0 }
      const height = Math.abs(cross(sub(w, f), g)) / len(g)
      const length = Math.abs(dot(sub(i, s), g)) / len(g)
      if (height > 0) out.push({ key: 'ratio', label: 'Délka těla : výška v kohoutku', value: length / height, unit: '' })
    }
  }

  if (photo.view === 'front' || photo.view === 'rear') {
    const [prox, mid] = photo.view === 'front' ? ['elbow', 'carpus'] : ['ischium', 'hock']
    const axisLabel = photo.view === 'front' ? 'Osa zápěstí' : 'Osa hlezna'
    const [pl, pr] = [pt(`${prox}L`), pt(`${prox}R`)]
    const midX = pl && pr ? (pl.x + pr.x) / 2 : null
    for (const [sfx, name] of [['L', 'vlevo'], ['R', 'vpravo']] as const) {
      const [a, b, c] = [pt(`${prox}${sfx}`), pt(`${mid}${sfx}`), pt(`paw${sfx}`)]
      const ang = a && b && c ? angleAt(a, b, c) : null
      if (ang == null || !a || !b || !c) continue
      const dev = 180 - ang
      let note: string | undefined
      if (midX != null && b.y !== a.y && dev > 2) {
        const expected = a.x + ((c.y - a.y) / (b.y - a.y)) * (b.x - a.x)
        note = Math.sign(c.x - expected) === Math.sign(a.x - midX) ? 'tlapka vybočuje ven' : 'tlapka vybočuje dovnitř'
      }
      out.push({ key: `axis${sfx}`, label: `${axisLabel} ${name} – odchylka`, value: dev, unit: '°', level: step(dev, 5, 10), note })
    }
    const [wl, wr] = [pt('pawL'), pt('pawR')]
    if (photo.view === 'front') {
      const [sl, sr] = [pt('shoulderL'), pt('shoulderR')]
      if (sl && sr && wl && wr && len(sub(sl, sr))) out.push({ key: 'width', label: 'Šířka postoje (tlapky : ramena)', value: len(sub(wl, wr)) / len(sub(sl, sr)), unit: '' })
    } else {
      const [hl, hr] = [pt('hockL'), pt('hockR')]
      if (hl && hr && wl && wr && len(sub(wl, wr))) {
        const v = len(sub(hl, hr)) / len(sub(wl, wr))
        out.push({ key: 'hocks', label: 'Rozestup hlezen : tlapek', value: v, unit: '', level: v < 0.8 || v > 1.25 ? 'mild' : 'ok', note: v < 0.8 ? 'hlezna sbíhavá' : v > 1.25 ? 'hlezna rozbíhavá' : undefined })
      }
      if (pl && pr) {
        const ground = wl && wr ? Math.atan2(wr.y - wl.y, wr.x - wl.x) : 0
        const tilt = deg(Math.atan2(pr.y - pl.y, pr.x - pl.x) - ground)
        out.push({ key: 'pelvis', label: 'Sklon pánve vůči podložce', value: Math.abs(tilt), unit: '°', level: step(Math.abs(tilt), 3, 6), note: Math.abs(tilt) > 1 ? `níže ${tilt > 0 ? 'pravá' : 'levá'} strana` : undefined })
      }
    }
  }

  if (photo.view === 'top') {
    const [w, t] = [pt('withers'), pt('tailBase')]
    if (w && t && len(sub(w, t))) {
      const head = sub(w, t)
      // kladná hodnota = vpravo od osy při pohledu směrem k hlavě
      const off = (p: P) => cross(head, sub(p, t)) / len(head)
      const devs = [pt('midback'), pt('sacrum')].filter((p): p is P => !!p).map(off)
      if (devs.length) {
        const worst = devs.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a))
        const pct = (Math.abs(worst) / len(head)) * 100
        out.push({ key: 'spine', label: 'Vybočení páteře z osy kohoutek–ocas', value: pct, unit: ' %', level: step(pct, 2, 4), note: pct > 1 ? `vybočení ${worst > 0 ? 'vpravo' : 'vlevo'}` : undefined })
      }
      for (const [id, name] of [['shoulder', 'v ramenou'], ['waist', 'v pase'], ['hip', 'v kyčlích']] as const) {
        const [l, r] = [pt(`${id}L`), pt(`${id}R`)]
        if (!l || !r) continue
        const [dl, dr] = [Math.abs(off(l)), Math.abs(off(r))]
        const si = symmetryIndex(dl, dr)
        if (si != null) out.push({ key: `sym-${id}`, label: `Asymetrie obrysu ${name}`, value: si, unit: ' %', level: siLevel(si), note: siLevel(si) !== 'ok' ? `užší ${dl < dr ? 'vlevo' : 'vpravo'}` : undefined })
      }
    }
  }
  return out
}

export const fmtMeasure = (m: Measure) =>
  `${m.value.toLocaleString('cs-CZ', { maximumFractionDigits: m.unit === '' ? 2 : m.unit === '°' ? 0 : 1 })}${m.unit}`

/** Nálezy z fotek zepředu, zezadu a shora (úhly z boku se přenášejí do tabulky úhlů). */
export function photoFindings(exam: StaticExam): Finding[] {
  return (exam.photos ?? []).flatMap((photo) =>
    photoMeasures(photo)
      .filter((m) => m.level && m.level !== 'ok')
      .map((m) => ({ level: m.level!, text: `Foto ${VIEW_LABEL[photo.view].toLowerCase()}: ${m.label.toLowerCase()} ${fmtMeasure(m)}${m.note ? ` – ${m.note}` : ''}.` })),
  )
}

/** Úhly z fotek z boku jako hodnoty pro tabulku měření: levý bok → levá strana, pravý bok → pravá. */
export function anglesFromPhotos(exam: StaticExam): { angles: Record<StandingJoint, Pair>; ratio: number | null; count: number } {
  const angles = structuredClone(exam.angles)
  let ratio: number | null = null
  let count = 0
  for (const [view, sideKey] of [['left', 'l'], ['right', 'r']] as const) {
    const photo = exam.photos?.find((p) => p.view === view)
    if (!photo) continue
    for (const m of photoMeasures(photo)) {
      if (m.key === 'ratio') ratio ??= m.value
      else { angles[m.key as StandingJoint][sideKey] = Math.round(m.value); count++ }
    }
  }
  return { angles, ratio, count }
}
