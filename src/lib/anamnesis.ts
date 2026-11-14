import type { Anamnesis } from './types'

/** Otázky podle systémů. `normal` = odpověď, která je v pořádku; opačná se v reportu zvýrazní. */
export const SYSTEM_QUESTIONS: { id: string; text: string; normal: 'yes' | 'no' }[] = [
  { id: 'appetite', text: 'Žere s normální chutí?', normal: 'yes' },
  { id: 'thirst', text: 'Pije víc než obvykle?', normal: 'no' },
  { id: 'urination', text: 'Močí víc, méně nebo s bolestí?', normal: 'no' },
  { id: 'stool', text: 'Je stolice normální?', normal: 'yes' },
  { id: 'vomiting', text: 'Zvrací nebo regurgituje?', normal: 'no' },
  { id: 'cough', text: 'Kašle nebo kýchá?', normal: 'no' },
  { id: 'breathing', text: 'Dýchá s námahou nebo s otevřenou tlamou?', normal: 'no' },
  { id: 'lameness', text: 'Kulhá nebo mu dělá potíže vstát?', normal: 'no' },
  { id: 'seizures', text: 'Měl křeče, kolapsy nebo ztrátu rovnováhy?', normal: 'no' },
  { id: 'skin', text: 'Škrábe se, olizuje se nebo má kožní léze?', normal: 'no' },
  { id: 'ears', text: 'Třese hlavou nebo má zápach z ucha?', normal: 'no' },
  { id: 'eyes', text: 'Má výtok nebo bolest očí?', normal: 'no' },
  { id: 'lethargy', text: 'Je skleslé nebo spí víc než obvykle?', normal: 'no' },
  { id: 'reproduction', text: 'Hárání, porod nebo nedávný výtok z vulvy?', normal: 'no' },
  { id: 'toxin', text: 'Mohlo sníst něco toxického nebo předmět?', normal: 'no' },
]

export const ONSET_LABEL = { sudden: 'náhlý', gradual: 'postupný' }
export const PROGRESS_LABEL = { better: 'zlepšuje se', same: 'beze změny', worse: 'zhoršuje se' }

export const emptyAnamnesis = (): Anamnesis => ({
  clinic: '', date: new Date().toISOString().slice(0, 10),
  ownerName: '', ownerAddress: '', ownerEmail: '', ownerPhone: '',
  species: 'pes', neuteredDate: '', vaccination: '', diet: '', deworming: '', environment: '',
  reason: '', course: '', onset: null, progress: null,
  medications: '', allergies: '',
  surgeries: '', illnesses: '', travel: '', contacts: '', recentBirth: '', poisoning: '',
  systems: {},
})

/** Textová pole anamnézy v pořadí formuláře, pro výpis v reportu. */
export const TEXT_FIELDS: [keyof Anamnesis, string][] = [
  ['reason', 'Důvod návštěvy'],
  ['course', 'Začátek a průběh'],
  ['medications', 'Léky a doplňky'],
  ['allergies', 'Alergie nebo reakce'],
  ['surgeries', 'Operace'],
  ['illnesses', 'Dřívější nemoci'],
  ['travel', 'Cesty'],
  ['contacts', 'Kontakt s jinými zvířaty'],
  ['recentBirth', 'Nedávný porod'],
  ['poisoning', 'Možná otrava'],
  ['diet', 'Strava'],
  ['vaccination', 'Očkování'],
  ['deworming', 'Odčervení'],
  ['environment', 'Prostředí a spolubydlící zvířata'],
]

export const hasAnamnesis = (a: Anamnesis | undefined): a is Anamnesis =>
  !!a && (TEXT_FIELDS.some(([k]) => a[k]) || !!a.onset || !!a.progress || Object.values(a.systems).some((s) => s.answer || s.note))
