import { useEffect, useState } from 'react'
import { CLOUD_ENABLED } from './cloud-config'
import { supabase } from './supabase'

/**
 * Obrazová data fotek. Záznam měření drží jen id fotky a body;
 * samotný obrázek je tady: místní režim → IndexedDB v prohlížeči,
 * účet → soukromé úložiště Supabase (složka účtu), zkušební režim → jen paměť.
 */
const BUCKET = 'photos'
const mem = new Map<string, Blob>()
/** fotky, které ještě nejsou v cloudu (zkušební režim nebo neúspěšné nahrání) */
const pending = new Set<string>()

async function userId(): Promise<string | null> {
  const { data } = await supabase!.auth.getSession()
  return data.session?.user.id ?? null
}

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('k9bio-photos', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('photos')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await idb()
  return new Promise((resolve, reject) => {
    const req = run(db.transaction('photos', mode).objectStore('photos'))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function upload(uid: string, id: string, blob: Blob) {
  const { error } = await supabase!.storage.from(BUCKET).upload(`${uid}/${id}.jpg`, blob, { contentType: 'image/jpeg', upsert: true })
  if (error) { pending.add(id); throw error }
  pending.delete(id)
}

export async function savePhoto(id: string, blob: Blob) {
  mem.set(id, blob)
  if (!CLOUD_ENABLED) { await tx('readwrite', (s) => s.put(blob, id)); return }
  const uid = await userId()
  if (!uid) { pending.add(id); return }
  await upload(uid, id, blob)
}

export async function loadPhoto(id: string): Promise<Blob | null> {
  const cached = mem.get(id)
  if (cached) return cached
  let blob: Blob | null = null
  if (!CLOUD_ENABLED) blob = (await tx<Blob | undefined>('readonly', (s) => s.get(id))) ?? null
  else {
    const uid = await userId()
    if (!uid) return null
    blob = (await supabase!.storage.from(BUCKET).download(`${uid}/${id}.jpg`)).data ?? null
  }
  if (blob) mem.set(id, blob)
  return blob
}

export async function deletePhotos(ids: string[]) {
  if (!ids.length) return
  for (const id of ids) { mem.delete(id); pending.delete(id) }
  try {
    if (!CLOUD_ENABLED) { for (const id of ids) await tx('readwrite', (s) => s.delete(id)); return }
    const uid = await userId()
    if (uid) await supabase!.storage.from(BUCKET).remove(ids.map((id) => `${uid}/${id}.jpg`))
  } catch { /* osiřelý soubor nevadí, záznam měření už na něj neodkazuje */ }
}

/** Po přihlášení (nebo při „Zkusit znovu“) nahraje fotky, které jsou zatím jen v paměti. */
export async function flushPendingPhotos() {
  if (!CLOUD_ENABLED || !pending.size) return
  const uid = await userId()
  if (!uid) return
  for (const id of [...pending]) {
    const blob = mem.get(id)
    if (blob) await upload(uid, id, blob)
    else pending.delete(id)
  }
}

export function clearPhotoCache() {
  mem.clear()
  pending.clear()
}

/** Adresa obrázku pro <img>; null během načítání, false když obrázek chybí. */
export function usePhotoUrl(id: string): string | null | false {
  const [url, setUrl] = useState<string | null | false>(null)
  useEffect(() => {
    let alive = true
    let made: string | null = null
    setUrl(null)
    loadPhoto(id).then(
      (blob) => {
        if (!alive) return
        if (!blob) return setUrl(false)
        made = URL.createObjectURL(blob)
        setUrl(made)
      },
      () => alive && setUrl(false),
    )
    return () => { alive = false; if (made) URL.revokeObjectURL(made) }
  }, [id])
  return url
}
