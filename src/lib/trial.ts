import { create } from 'zustand'

/**
 * Zkušební režim bez přihlášení: data žijí jen v paměti této karty prohlížeče
 * (po zavření nebo obnovení stránky zmizí) a výstupy (tisk / PDF) jsou vypnuté.
 */
export const useTrial = create<{ active: boolean; start: () => void; stop: () => void }>((set) => ({
  active: false,
  start: () => set({ active: true }),
  stop: () => set({ active: false }),
}))
