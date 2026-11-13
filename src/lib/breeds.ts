import { FCI_ROWS } from './fci-data'
import type { Archetype, ArchetypeTemplate, Breed } from './types'

/**
 * Biomechanické šablony podle archetypu.
 *
 * POZOR: referenční rozsahy jsou orientační výchozí hodnoty pro V1 a čekají
 * na odbornou revizi. Všechny se upravují jen tady – zbytek aplikace je čte.
 */
export const TEMPLATES: Record<Archetype, ArchetypeTemplate> = {
  trotter: {
    id: 'trotter',
    label: 'Vytrvalostní typ',
    summary: 'Pes stavěný na vytrvalý klus: mírně obdélníkový rámec, vyvážené úhlení, úsporný prostorný pohyb s pevnou hřbetní linií.',
    bodyRatio: [1.0, 1.15],
    frontLoadPct: [58, 64],
    standing: { shoulder: [105, 120], elbow: [130, 145], stifle: [125, 140], hock: [135, 150] },
    rom: { shoulder: [25, 35], elbow: [45, 60], carpus: [90, 115], hip: [30, 40], stifle: [45, 60], hock: [35, 50] },
    strengths: ['Vytrvalost a ekonomika pohybu', 'Stabilní trup při přenosu síly z pánevních končetin'],
    risks: ['Při únavě nebo bolesti přechod do mimochodu', 'Zkrácení kroku pánevní končetiny při potížích kyčle / m. iliopsoas'],
  },
  galloper: {
    id: 'galloper',
    label: 'Rychlostní typ',
    summary: 'Pes stavěný na rychlý cval: lehká kostra, hluboký hrudník a pružná bederní páteř, cval se dvěma fázemi vznosu.',
    bodyRatio: [1.0, 1.1],
    frontLoadPct: [56, 62],
    standing: { shoulder: [110, 125], elbow: [135, 150], stifle: [125, 140], hock: [135, 150] },
    rom: { shoulder: [28, 40], elbow: [45, 60], carpus: [90, 120], hip: [32, 45], stifle: [45, 60], hock: [35, 50] },
    strengths: ['Vysoká rychlost a akcelerace', 'Velká flexe a extenze páteře'],
    risks: ['Přetížení bederní páteře a m. gracilis / hamstringů', 'Poranění karpu a prstů při zatáčení ve vysoké rychlosti'],
  },
  power: {
    id: 'power',
    label: 'Silový typ',
    summary: 'Pes stavěný na sílu: těžká kostra, široký hrudník, mohutné osvalení. Kratší krok a větší zatížení hrudních končetin.',
    bodyRatio: [1.0, 1.15],
    frontLoadPct: [60, 66],
    standing: { shoulder: [105, 120], elbow: [130, 145], stifle: [130, 145], hock: [140, 155] },
    rom: { shoulder: [22, 32], elbow: [40, 55], carpus: [85, 110], hip: [28, 38], stifle: [40, 55], hock: [30, 45] },
    strengths: ['Síla a stabilita', 'Dobrá tolerance statické zátěže'],
    risks: ['Loketní a kyčelní kloub (dysplazie)', 'Zkřížený vaz kolenního kloubu při strmém úhlení pánevních končetin'],
  },
  chondro: {
    id: 'chondro',
    label: 'Nízkonohý typ',
    summary: 'Dlouhý trup na krátkých končetinách (chondrodystrofická stavba). Vysoké nároky na stabilitu páteře, krátký rychlý krok.',
    bodyRatio: [1.4, 2.0],
    frontLoadPct: [60, 66],
    standing: { shoulder: [100, 118], elbow: [125, 145], stifle: [125, 140], hock: [135, 150] },
    rom: { shoulder: [20, 32], elbow: [38, 55], carpus: [80, 110], hip: [26, 38], stifle: [38, 55], hock: [30, 45] },
    strengths: ['Nízké těžiště', 'Obratnost v malém prostoru'],
    risks: ['Onemocnění meziobratlových plotének (IVDD)', 'Valgozita karpů a přetížení loktů'],
  },
  terrier: {
    id: 'terrier',
    label: 'Obratnostní typ',
    summary: 'Pes stavěný na obratnost: kompaktní kvadratický rámec, strmější úhlení, krátký energický krok a rychlé změny směru.',
    bodyRatio: [0.95, 1.08],
    frontLoadPct: [58, 64],
    standing: { shoulder: [110, 125], elbow: [135, 150], stifle: [130, 145], hock: [140, 155] },
    rom: { shoulder: [22, 32], elbow: [42, 58], carpus: [88, 115], hip: [28, 38], stifle: [42, 58], hock: [32, 48] },
    strengths: ['Výbušnost a obratnost', 'Rychlé změny směru'],
    risks: ['Luxace pately u menších plemen', 'Přetížení ramen při opakovaných doskocích'],
  },
  toy: {
    id: 'toy',
    label: 'Drobný typ',
    summary: 'Drobný společenský pes: jemná kostra, malá hmotnost, rychlá kadence kroku. Citlivý na asymetrie pánevních končetin.',
    bodyRatio: [0.95, 1.15],
    frontLoadPct: [58, 64],
    standing: { shoulder: [105, 125], elbow: [130, 150], stifle: [125, 145], hock: [135, 155] },
    rom: { shoulder: [22, 34], elbow: [42, 58], carpus: [85, 115], hip: [28, 40], stifle: [42, 58], hock: [32, 48] },
    strengths: ['Nízké absolutní zatížení kloubů'],
    risks: ['Luxace pately', 'Poskakování na jedné pánevní končetině (skipping)'],
  },
}

export const ARCHETYPES = Object.values(TEMPLATES)

export const FCI_GROUPS: Record<number, string> = {
  1: 'Plemena ovčácká, pastevecká a honácká',
  2: 'Pinčové, knírači, molossoidní plemena a švýcarští salašničtí psi',
  3: 'Teriéři',
  4: 'Jezevčíci',
  5: 'Špicové a plemena primitivního typu',
  6: 'Honiči, barváři a příbuzná plemena',
  7: 'Ohaři',
  8: 'Slídiči, retrívři a vodní psi',
  9: 'Společenská plemena',
  10: 'Chrti',
  0: 'Kříženci',
}

export const FCI_SECTIONS: Record<string, string> = {
  '1.1': 'Ovčáčtí psi',
  '1.2': 'Honáčtí psi (kromě švýcarských)',
  '2.1': 'Pinčové a knírači',
  '2.2': 'Molossoidní plemena',
  '2.3': 'Švýcarští salašničtí psi',
  '3.1': 'Velcí a střední teriéři',
  '3.2': 'Malí teriéři',
  '3.3': 'Teriéři typu bull',
  '3.4': 'Toy teriéři',
  '5.1': 'Severští sáňoví psi',
  '5.2': 'Severští lovečtí psi',
  '5.3': 'Severští hlídací a pastevečtí psi',
  '5.4': 'Evropští špicové',
  '5.5': 'Asijští špicové a příbuzná plemena',
  '5.6': 'Primitivní typ',
  '5.7': 'Primitivní typ – lovečtí psi',
  '6.1': 'Honiči',
  '6.2': 'Barváři',
  '6.3': 'Příbuzná plemena',
  '7.1': 'Kontinentální ohaři',
  '7.2': 'Britští a irští ohaři',
  '8.1': 'Retrívři',
  '8.2': 'Slídiči',
  '8.3': 'Vodní psi',
  '9.1': 'Bišonci a příbuzná plemena',
  '9.2': 'Pudl',
  '9.3': 'Malí belgičtí psi',
  '9.4': 'Naháči',
  '9.5': 'Tibetská plemena',
  '9.6': 'Čivava',
  '9.7': 'Angličtí společenští španělé',
  '9.8': 'Japan chin a pekingský palácový psík',
  '9.9': 'Kontinentální společenští španělé a ostatní',
  '9.10': 'Kromfohrländer',
  '9.11': 'Malí molossoidní psi',
  '10.1': 'Dlouhosrstí chrti',
  '10.2': 'Hrubosrstí chrti',
  '10.3': 'Krátkosrstí chrti',
}

/** Vše, co není v nomenklatuře FCI, je kříženec – archetyp se u něj volí ručně. */
export const MIX: Breed = { id: 'mix', name: 'Kříženec', nameFci: '', fciNumber: 0, fciGroup: 0, section: 0, provisional: false, archetype: 'trotter' }

export const FCI_BREEDS: Breed[] = FCI_ROWS.map(([fciNumber, fciGroup, section, name, nameFci, archetype, prov]) => ({
  id: `fci-${fciNumber}`, name, nameFci, fciNumber, fciGroup, section, provisional: prov === 1, archetype,
})).sort((x, y) => x.name.localeCompare(y.name, 'cs'))

export const BREEDS: Breed[] = [MIX, ...FCI_BREEDS]

export const getBreed = (id: string) => BREEDS.find((x) => x.id === id)

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Hledání bez diakritiky v českém i původním názvu a podle čísla standardu. */
export function searchBreeds(q: string, list: Breed[] = BREEDS): Breed[] {
  const n = norm(q.trim())
  if (!n) return list
  const hits = list.filter((b) => norm(b.name).includes(n) || norm(b.nameFci).includes(n) || String(b.fciNumber) === n)
  // names starting with the query come first ("jezev" → Jezevčík before "… jezevčíkovitý …")
  const rank = (b: Breed) => (norm(b.name).startsWith(n) ? 0 : 1)
  return hits.sort((x, y) => rank(x) - rank(y))
}

export const breedMeta = (b: Breed) =>
  b.fciGroup === 0 ? 'mimo FCI' : `FCI ${b.fciGroup}${b.section ? `.${b.section}` : ''} · standard č. ${b.fciNumber}${b.provisional ? ' · prozatímně uznané' : ''}`
