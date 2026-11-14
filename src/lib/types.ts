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
  /** rozšířená anamnéza; u dříve založených psů chybí */
  anamnesis?: Anamnesis
}

export type YesNo = 'yes' | 'no' | null

export interface Anamnesis {
  clinic: string
  date: string
  ownerName: string
  ownerAddress: string
  ownerEmail: string
  ownerPhone: string
  species: string
  neuteredDate: string
  vaccination: string
  diet: string
  deworming: string
  environment: string
  /** důvod návštěvy slovy majitele */
  reason: string
  course: string
  onset: 'sudden' | 'gradual' | null
  progress: 'better' | 'same' | 'worse' | null
  medications: string
  allergies: string
  surgeries: string
  illnesses: string
  travel: string
  contacts: string
  recentBirth: string
  poisoning: string
  /** otázky podle systémů: id otázky → odpověď a poznámka */
  systems: Record<string, { answer: YesNo; note: string }>
}

export type PhotoView = 'left' | 'right' | 'front' | 'rear' | 'top'

/** Bod na fotce v podílu šířky/výšky (0–1). `by` říká, kdo ho naposledy umístil. */
export interface PhotoPoint {
  x: number
  y: number
  by: 'ai' | 'human'
}

export interface ExamPhoto {
  /** klíč obrazových dat v úložišti fotek */
  id: string
  view: PhotoView
  w: number
  h: number
  points: Record<string, PhotoPoint>
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
  /** nejvýše jedna fotka na pohled; u starších měření chybí */
  photos?: ExamPhoto[]
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
