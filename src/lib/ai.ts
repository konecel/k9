import { jpegBase64 } from './image-import'
import { LANDMARKS } from './landmarks'
import { loadPhoto } from './photos'
import { supabase } from './supabase'
import type { ExamPhoto, PhotoPoint } from './types'

/**
 * Požádá AI o návrh bodů na fotce. Běží přes funkci `landmarks` v Supabase,
 * aby klíč k AI nikdy nebyl v prohlížeči. Vrací jen body, které AI na fotce vidí.
 */
export async function suggestPoints(photo: ExamPhoto): Promise<Record<string, PhotoPoint>> {
  if (!supabase) throw new Error('AI je dostupná jen s přihlášeným účtem.')
  const blob = await loadPhoto(photo.id)
  if (!blob) throw new Error('Fotka není k dispozici.')
  const image = await jpegBase64(blob, 1568).catch(() => { throw new Error('Fotku se nepodařilo připravit pro AI. Zkuste ji nahrát znovu.') })
  const { data, error } = await supabase.functions.invoke('landmarks', {
    body: {
      image,
      view: photo.view,
      landmarks: LANDMARKS[photo.view].map(({ id, en }) => ({ id, description: en })),
    },
  })
  if (error) throw new Error('AI se nepodařilo zavolat. Zkuste to znovu, nebo body umístěte ručně.')
  const known = new Set(LANDMARKS[photo.view].map((l) => l.id))
  const out: Record<string, PhotoPoint> = {}
  for (const p of (data?.points ?? []) as { id: string; x: number; y: number; visible: boolean }[]) {
    if (!p.visible || !known.has(p.id)) continue
    const [x, y] = [p.x / 1000, p.y / 1000]
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) out[p.id] = { x, y, by: 'ai' }
  }
  return out
}
