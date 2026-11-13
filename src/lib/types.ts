/** A measured value. `null` means "not measured" – never treated as zero. */
export type Num = number | null
export type Range = [number, number]
export type Pair = { l: Num; r: Num }

export type Archetype = 'trotter' | 'galloper' | 'power' | 'chondro' | 'terrier' | 'toy'
export type Limb = 'fl' | 'fr' | 'hl' | 'hr'
export type StandingJoint = 'shoulder' | 'elbow' | 'stifle' | 'hock'
export type GaitJoint = 'shoulder' | 'elbow' | 'carpus' | 'hip' | 'stifle' | 'hock'
export type GaitType = 'walk' | 'trot'

export interface Breed {
  id: string
  /** český název */
  name: string
  /** název přesně podle nomenklatury FCI; u křížence prázdný */
  nameFci: string
  /** číslo standardu FCI; 0 = kříženec */
  fciNumber: number
  /** 0 = kříženec */
  fciGroup: number
  /** 0 = sekce neuvedena (prozatímně uznaná plemena) */
  section: number
  provisional: boolean
  archetype: Archetype
}

export interface ArchetypeTemplate {
  id: Archetype
  label: string
  summary: string
  /** délka těla / výška v kohoutku */
  bodyRatio: Range
  /** podíl hmotnosti na hrudních končetinách ve stoji, % */
  frontLoadPct: Range
  /** úhly kloubů ve stoji, ° */
  standing: Record<StandingJoint, Range>
  /** rozsah pohybu kloubů v klusu, ° */
  rom: Record<GaitJoint, Range>
  strengths: string[]
  risks: string[]
}

export interface Dog {
  id: string
  name: string
  breedId: string
  /** archetyp lze u jedince přepsat (kříženci, atypická stavba) */
  archetype: Archetype
  sex: 'male' | 'female'
  neutered: boolean
  ageYears: Num
  weightKg: Num
  heightCm: Num
  sport: string
  history: string
  createdAt: string
}

export interface StaticExam {
  id: string
  dogId: string
  date: string
  /** zatížení končetin – v kg nebo %, přepočítá se na podíly */
  load: Record<Limb, Num>
  bodyLengthCm: Num
  heightCm: Num
  angles: Record<StandingJoint, Pair>
  /** obvod stehna, cm */
  thighCm: Pair
  /** obvod paže, cm */
  armCm: Pair
  bcs: Num
  notes: string
}

export interface GaitExam {
  id: string
  dogId: string
  date: string
  gait: GaitType
  stancePct: Record<Limb, Num>
  strideCm: Record<Limb, Num>
  rom: Record<GaitJoint, Pair>
  headBob: boolean
  pelvicAsymmetry: boolean
  bunnyHop: boolean
  notes: string
}

export type Level = 'ok' | 'mild' | 'sig'
export interface Finding {
  level: Level
  text: string
}
