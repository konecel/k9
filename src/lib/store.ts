import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CLOUD_ENABLED } from './cloud-config'
import { deletePhotos } from './photos'
import type { Dog, GaitExam, StaticExam } from './types'

const uid = () => crypto.randomUUID()
const today = () => new Date().toISOString().slice(0, 10)
const pair = () => ({ l: null, r: null })
const limbs = () => ({ fl: null, fr: null, hl: null, hr: null })

export const newStaticExam = (dogId: string, heightCm: number | null): StaticExam => ({
  id: uid(),
  dogId,
  date: today(),
  load: limbs(),
  bodyLengthCm: null,
  heightCm,
  angles: { shoulder: pair(), elbow: pair(), stifle: pair(), hock: pair() },
  thighCm: pair(),
  armCm: pair(),
  bcs: null,
  notes: '',
})

export const newGaitExam = (dogId: string): GaitExam => ({
  id: uid(),
  dogId,
  date: today(),
  gait: 'trot',
  stancePct: limbs(),
  strideCm: limbs(),
  rom: { shoulder: pair(), elbow: pair(), carpus: pair(), hip: pair(), stifle: pair(), hock: pair() },
  headBob: false,
  pelvicAsymmetry: false,
  bunnyHop: false,
  notes: '',
})

const noStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }

interface State {
  dogs: Dog[]
  /** Every exam carries its dogId – records of two dogs can never blend. */
  staticExams: StaticExam[]
  gaitExams: GaitExam[]
  savedAt: number
  /** replace everything with data loaded from the cloud (or clear on sign-out) */
  replaceAll: (data: { dogs: Dog[]; staticExams: StaticExam[]; gaitExams: GaitExam[] }) => void
  addDog: (dog: Omit<Dog, 'id' | 'createdAt'>) => string
  updateDog: (id: string, patch: Partial<Dog>) => void
  deleteDog: (id: string) => void
  addStatic: (dogId: string) => string
  updateStatic: (id: string, patch: Partial<StaticExam>) => void
  deleteStatic: (id: string) => void
  addGait: (dogId: string) => string
  updateGait: (id: string, patch: Partial<GaitExam>) => void
  deleteGait: (id: string) => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      dogs: [],
      staticExams: [],
      gaitExams: [],
      savedAt: 0,
      replaceAll: (data) => set({ ...data }),
      addDog: (dog) => {
        const id = uid()
        set((s) => ({ dogs: [...s.dogs, { ...dog, id, createdAt: new Date().toISOString() }], savedAt: Date.now() }))
        return id
      },
      updateDog: (id, patch) => set((s) => ({ dogs: s.dogs.map((d) => (d.id === id ? { ...d, ...patch } : d)), savedAt: Date.now() })),
      deleteDog: (id) => {
        void deletePhotos(get().staticExams.filter((e) => e.dogId === id).flatMap((e) => (e.photos ?? []).map((p) => p.id)))
        set((s) => ({
          dogs: s.dogs.filter((d) => d.id !== id),
          staticExams: s.staticExams.filter((e) => e.dogId !== id),
          gaitExams: s.gaitExams.filter((e) => e.dogId !== id),
          savedAt: Date.now(),
        }))
      },
      addStatic: (dogId) => {
        const exam = newStaticExam(dogId, get().dogs.find((d) => d.id === dogId)?.heightCm ?? null)
        set((s) => ({ staticExams: [...s.staticExams, exam], savedAt: Date.now() }))
        return exam.id
      },
      updateStatic: (id, patch) => set((s) => ({ staticExams: s.staticExams.map((e) => (e.id === id ? { ...e, ...patch } : e)), savedAt: Date.now() })),
      deleteStatic: (id) => {
        void deletePhotos((get().staticExams.find((e) => e.id === id)?.photos ?? []).map((p) => p.id))
        set((s) => ({ staticExams: s.staticExams.filter((e) => e.id !== id), savedAt: Date.now() }))
      },
      addGait: (dogId) => {
        const exam = newGaitExam(dogId)
        set((s) => ({ gaitExams: [...s.gaitExams, exam], savedAt: Date.now() }))
        return exam.id
      },
      updateGait: (id, patch) => set((s) => ({ gaitExams: s.gaitExams.map((e) => (e.id === id ? { ...e, ...patch } : e)), savedAt: Date.now() })),
      deleteGait: (id) => set((s) => ({ gaitExams: s.gaitExams.filter((e) => e.id !== id), savedAt: Date.now() })),
    }),
    {
      name: 'k9bio.v1',
      // With accounts enabled nothing is kept in the browser: the cloud is the only copy,
      // so a shared computer never shows another account's dogs.
      storage: createJSONStorage(() => (CLOUD_ENABLED ? noStorage : localStorage)),
    },
  ),
)

/** Exams of one dog, newest first. */
export const byDog = <T extends { dogId: string; date: string }>(list: T[], dogId: string) =>
  list.filter((e) => e.dogId === dogId).sort((a, b) => b.date.localeCompare(a.date))
