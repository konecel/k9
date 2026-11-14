import { create } from 'zustand'
import { clearPhotoCache, flushPendingPhotos } from './photos'
import { useStore } from './store'
import { supabase } from './supabase'

type Table = 'dogs' | 'static_exams' | 'gait_exams'
type Rec = { id: string; dogId?: string }

interface SyncState {
  /** loading = první načtení po přihlášení */
  state: 'idle' | 'loading' | 'saving' | 'saved' | 'error'
  error: string | null
}
export const useSync = create<SyncState>(() => ({ state: 'idle', error: null }))

const TABLES: { table: Table; pick: () => Rec[] }[] = [
  { table: 'dogs', pick: () => useStore.getState().dogs },
  { table: 'static_exams', pick: () => useStore.getState().staticExams },
  { table: 'gait_exams', pick: () => useStore.getState().gaitExams },
]

/** What the server is known to hold: table → id → the exact record object that was saved. */
let synced: Record<Table, Map<string, Rec>> = { dogs: new Map(), static_exams: new Map(), gait_exams: new Map() }
let unsubscribe: (() => void) | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let flushing = false
let again = false
/** bumped on every start/stop so a load that finishes after sign-out is ignored */
let generation = 0

async function flush() {
  if (!supabase) return
  if (flushing) { again = true; return }
  flushing = true
  useSync.setState({ state: 'saving', error: null })
  try {
    await flushPendingPhotos()
    // dogs first (exams reference them), deletions in the opposite order
    for (const { table, pick } of TABLES) {
      const current = pick()
      const changed = current.filter((r) => synced[table].get(r.id) !== r)
      if (!changed.length) continue
      const rows = changed.map((r) => ({ id: r.id, ...(table === 'dogs' ? {} : { dog_id: r.dogId }), data: r, updated_at: new Date().toISOString() }))
      const { error } = await supabase.from(table).upsert(rows)
      if (error) throw error
      for (const r of changed) synced[table].set(r.id, r)
    }
    for (const { table, pick } of [...TABLES].reverse()) {
      const ids = new Set(pick().map((r) => r.id))
      const gone = [...synced[table].keys()].filter((id) => !ids.has(id))
      if (!gone.length) continue
      const { error } = await supabase.from(table).delete().in('id', gone)
      if (error) throw error
      for (const id of gone) synced[table].delete(id)
    }
    useSync.setState({ state: 'saved', error: null })
  } catch (e) {
    // nothing is marked as synced, so the next change (or retry) sends it again
    useSync.setState({ state: 'error', error: e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e) })
  } finally {
    flushing = false
    if (again) { again = false; void flush() }
  }
}

const schedule = () => {
  if (timer) clearTimeout(timer)
  useSync.setState({ state: 'saving', error: null })
  timer = setTimeout(flush, 700)
}

export const retrySync = () => void flush()

/** Load this account's data and start saving every change to the cloud. */
export async function startSync() {
  if (!supabase) return
  stopSync()
  const gen = generation
  useSync.setState({ state: 'loading', error: null })
  const [dogs, statics, gaits] = await Promise.all(
    (['dogs', 'static_exams', 'gait_exams'] as Table[]).map((t) => supabase!.from(t).select('data')),
  )
  if (gen !== generation) return
  const failed = [dogs, statics, gaits].find((r) => r.error)
  if (failed?.error) {
    useSync.setState({ state: 'error', error: failed.error.message })
    return
  }
  const data = {
    dogs: (dogs.data ?? []).map((r) => r.data),
    staticExams: (statics.data ?? []).map((r) => r.data),
    gaitExams: (gaits.data ?? []).map((r) => r.data),
  }
  synced = {
    dogs: new Map(data.dogs.map((r: Rec) => [r.id, r])),
    static_exams: new Map(data.staticExams.map((r: Rec) => [r.id, r])),
    gait_exams: new Map(data.gaitExams.map((r: Rec) => [r.id, r])),
  }
  // Anything already in memory was entered in trial mode before signing in:
  // keep it and save it into this account.
  const local = useStore.getState()
  const fresh = <T extends Rec>(mine: T[], server: T[]) => mine.filter((r) => !server.some((x) => x.id === r.id))
  const carried = { dogs: fresh(local.dogs, data.dogs), staticExams: fresh(local.staticExams, data.staticExams), gaitExams: fresh(local.gaitExams, data.gaitExams) }
  useStore.getState().replaceAll({
    dogs: [...data.dogs, ...carried.dogs],
    staticExams: [...data.staticExams, ...carried.staticExams],
    gaitExams: [...data.gaitExams, ...carried.gaitExams],
  })
  useSync.setState({ state: 'idle', error: null })
  unsubscribe = useStore.subscribe(schedule)
  // also uploads photos taken in trial mode
  if (carried.dogs.length || carried.staticExams.length || carried.gaitExams.length) schedule()
}

/** Stop syncing. With `clear` (sign-out) the in-memory data is wiped as well. */
export function stopSync(clear = false) {
  generation++
  unsubscribe?.()
  unsubscribe = null
  if (timer) clearTimeout(timer)
  timer = null
  synced = { dogs: new Map(), static_exams: new Map(), gait_exams: new Map() }
  if (clear) { useStore.getState().replaceAll({ dogs: [], staticExams: [], gaitExams: [] }); clearPhotoCache() }
  useSync.setState({ state: 'idle', error: null })
}

export const hasUnsavedChanges = () => ['saving', 'error'].includes(useSync.getState().state)
