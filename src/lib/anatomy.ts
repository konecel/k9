import type { GaitJoint } from './types'

/**
 * Anatomický podklad ke kloubům končetin.
 *
 * Zdroj: Vizuální veterinární průvodci, svazek 1 – Anatomie psa a kočky
 * (průvodci 06–13 a 43). Průvodce se opírá o: Evans & de Lahunta, Miller's Anatomy
 * of the Dog (4. vyd.); Singh, Dyce, Sack and Wensing's Textbook of Veterinary Anatomy
 * (5. vyd.); Piermattei, Flo & DeCamp, Handbook of Small Animal Orthopedics and
 * Fracture Repair (5. vyd.); Fossum, Small Animal Surgery (5. vyd.).
 *
 * Průvodce neuvádí číselné rozsahy úhlů ani ROM – ty zůstávají v šablonách orientační.
 */
export interface JointAnatomy {
  /** co kloub tvoří a jak se pohybuje */
  structure: string
  /** hmatné body, podle kterých se kloub najde a měří */
  landmarks: string
  extensors: string
  flexors: string
  /** možné souvislosti při odchylce – k ověření vyšetřením, ne diagnóza */
  consider: string[]
  guide: string
}

export const ANATOMY: Record<GaitJoint, JointAnatomy> = {
  shoulder: {
    structure: 'Lopatka a hlavice pažní kosti. Kulový kloub, který pracuje jako pant: ohýbá a natahuje. Nemá silné postranní vazy – stabilitu drží kloubní pouzdro a šlachy okolních svalů. Lopatka nemá s trupem kostní spojení, drží ji svaly.',
    landmarks: 'Hřeben lopatky a velký hrbol pažní kosti.',
    extensors: 'nadhřebenový sval, biceps',
    flexors: 'deltový sval, oblé svaly',
    consider: [
      'Tendinopatie bicepsu – kulhání, které se zátěží zhoršuje, bolest při ohnutí ramene.',
      'Mediální nestabilita ramene po přetížení – kulhání různé intenzity.',
      'Osteochondritis dissecans hlavice pažní kosti u velkých rostoucích psů.',
      'Kontraktura podhřebenového svalu (lovečtí psi) – chůze s rotací ramene.',
    ],
    guide: 'průvodce 06 a 12',
  },
  elbow: {
    structure: 'Pažní kost, vřetenní kost (nese váhu) a loketní kost (rameno páky tricepsu). Processus anconeus brání hyperextenzi, postranní vazy brání rozevírání do stran.',
    landmarks: 'Olekranon na hrotu lokte a kondyly pažní kosti po obou stranách kloubu.',
    extensors: 'triceps',
    flexors: 'biceps, pažní sval',
    consider: [
      'Dysplazie lokte u velkých rostoucích psů (fragmentovaný mediální processus coronoideus, nesrostlý processus anconeus, osteochondritida kondylu pažní kosti).',
      'Výpotek a bolest při násilné extenzi lokte.',
    ],
    guide: 'průvodce 07 a 12',
  },
  carpus: {
    structure: 'Sedm kostí zápěstí ve dvou řadách a tři kloubní úrovně; nejvíc pohybu probíhá v antebrachiokarpálním kloubu. Silné palmární vazy brání hyperextenzi.',
    landmarks: 'Distální konec předloktí, zápěstí a akcesorní kost zápěstí na palmární straně.',
    extensors: 'natahovače zápěstí a prstů (dorzální strana předloktí)',
    flexors: 'ohýbače zápěstí a prstů (palmární strana předloktí)',
    consider: [
      'Hyperextenze zápěstí po pádu nebo doskoku – poškození palmárních vazů.',
      'Zlomenina akcesorní kosti zápěstí (závodní chrti).',
    ],
    guide: 'průvodce 08 a 12',
  },
  hip: {
    structure: 'Jamka pánevní kosti (acetabulum) a hlavice stehenní kosti. Kulový kloub; hlavici drží v jamce kulatý vaz a kloubní pouzdro.',
    landmarks: 'Křídlo kosti kyčelní, velký trochanter stehenní kosti a sedací hrbol.',
    extensors: 'hýžďové svaly, zadní stehenní svaly',
    flexors: 'bedrokyčelní sval (hlavní ohýbač kyčle)',
    consider: [
      'Dysplazie kyčelního kloubu – volný kloub, špatná kongruence, následná artróza.',
      'Natažení bedrokyčelního svalu u agility a pracovních psů – bolest při extenzi kyčle s napřímeným kolenem.',
      'Fibrotická myopatie pološlašitého nebo štíhlého svalu – krátký krok a stočení nohy dovnitř (častěji u německého ovčáka).',
      'Legg-Calvé-Perthesova choroba u malých mladých plemen – postupné kulhání a atrofie stehna.',
    ],
    guide: 'průvodce 09 a 13',
  },
  stifle: {
    structure: 'Kondyly stehenní kosti, čéška klouzající v trochlee a plošina holenní kosti. Menisky tlumí; zkřížené a postranní vazy brání posunu a rozevírání kloubu.',
    landmarks: 'Čéška a hrbolek holenní kosti (úpon patelárního vazu).',
    extensors: 'čtyřhlavý sval stehenní přes patelární vaz',
    flexors: 'zadní stehenní svaly, lýtkový sval',
    consider: [
      'Poškození předního zkříženého vazu (trhá se častěji než zadní); při přetržení bývá poškozen mediální meniskus.',
      'Mediální luxace čéšky, hlavně u malých plemen (stupně I–IV).',
      'Oslabení čtyřhlavého svalu – koleno při zatížení povoluje.',
    ],
    guide: 'průvodce 10 a 13',
  },
  hock: {
    structure: 'Holenní a lýtková kost, hlezenní kost (kladka hlavního kloubu) a patní kost; celkem sedm kostí zánártí. Téměř veškerý pohyb probíhá v tibiotarzálním kloubu.',
    landmarks: 'Patní kost (hrot hlezna) a oba kotníky; Achillova šlacha vede za hleznem.',
    extensors: 'lýtkový sval a povrchový ohýbač prstů přes Achillovu šlachu',
    flexors: 'přední holenní sval',
    consider: [
      'Poškození nebo tendinopatie Achillovy šlachy – pokles hlezna, v krajním případě došlap hleznem na zem; porovnejte úhel hlezna při došlapu s druhou stranou.',
      'Osteochondritida hlezenní kosti u velkých mladých plemen.',
      'U kolie a šeltie vyklouznutí šlachy povrchového ohýbače z patní kosti.',
    ],
    guide: 'průvodce 11 a 13',
  },
}

export const ANATOMY_SOURCE =
  'Vizuální veterinární průvodci, sv. 1 – Anatomie psa a kočky; primární literatura: Evans & de Lahunta, Miller’s Anatomy of the Dog (2013); Piermattei, Flo & DeCamp, Handbook of Small Animal Orthopedics and Fracture Repair (2016).'
