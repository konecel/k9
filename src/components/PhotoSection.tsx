import { useState } from 'react'
import { suggestPoints } from '../lib/ai'
import { CLOUD_ENABLED } from '../lib/cloud-config'
import { importImage } from '../lib/image-import'
import { LANDMARKS, VIEWS, anglesFromPhotos, fmtMeasure, photoMeasures } from '../lib/landmarks'
import { deletePhotos, savePhoto } from '../lib/photos'
import { useTrial } from '../lib/trial'
import type { ExamPhoto, PhotoPoint, PhotoView, StaticExam } from '../lib/types'
import { PhotoCanvas, POINT_COLOR } from './PhotoCanvas'
import { Button, Card, LevelBadge } from './ui'

const ACCEPT = 'image/*,.heic,.heif,.avif,.tif,.tiff'

export function PhotoMeasures({ photo }: { photo: ExamPhoto }) {
  const rows = photoMeasures(photo)
  if (!rows.length) return <p className="text-sm text-muted">Hodnoty se dopočítají, jakmile budou umístěné potřebné body.</p>
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-line">
        {rows.map((m) => (
          <tr key={m.key}>
            <td className="py-1.5 pr-2">{m.label}{m.note && <span className="block text-xs text-muted">{m.note}</span>}</td>
            <td className="py-1.5 text-right font-medium tabular-nums">{fmtMeasure(m)}</td>
            <td className="w-36 py-1.5 pl-3 text-right">{m.level && <LevelBadge level={m.level} />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function PhotoSection({ exam, set }: { exam: StaticExam; set: (patch: Partial<StaticExam>) => void }) {
  const trial = useTrial((t) => t.active)
  const photos = exam.photos ?? []
  const [view, setView] = useState<PhotoView>('left')
  const [active, setActive] = useState<string | null>(null)
  const [zoom, setZoom] = useState(false)
  const [busy, setBusy] = useState<'upload' | 'ai' | null>(null)
  const [msg, setMsg] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  const photo = photos.find((p) => p.view === view)
  const marks = LANDMARKS[view]
  const info = VIEWS.find((v) => v.id === view)!
  const aiOff = !CLOUD_ENABLED ? 'AI návrh bodů bude dostupný po zapnutí účtů (cloudu).' : trial ? 'AI návrh bodů je dostupný po přihlášení.' : null

  const setPhotos = (next: ExamPhoto[]) => set({ photos: next })
  const setPoints = (points: Record<string, PhotoPoint>) => photo && setPhotos(photos.map((p) => (p === photo ? { ...p, points } : p)))
  const nextEmpty = (points: Record<string, PhotoPoint>, after?: string, list = marks) => {
    const start = after ? list.findIndex((m) => m.id === after) + 1 : 0
    return [...list.slice(start), ...list.slice(0, start)].find((m) => !points[m.id])?.id ?? null
  }
  const pick = (v: PhotoView) => { setView(v); setMsg(null); setZoom(false); const p = photos.find((x) => x.view === v); setActive(p ? nextEmpty(p.points, undefined, LANDMARKS[v]) : null) }

  async function upload(file: File | undefined) {
    if (!file) return
    setBusy('upload'); setMsg(null)
    try {
      const { blob, w, h } = await importImage(file)
      const id = crypto.randomUUID()
      await savePhoto(id, blob).catch(() => { throw new Error('Fotku se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.') })
      if (photo) void deletePhotos([photo.id])
      setPhotos([...photos.filter((p) => p.view !== view), { id, view, w, h, points: {} }])
      setActive(marks[0].id)
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Fotku se nepodařilo zpracovat.' })
    } finally { setBusy(null) }
  }

  async function ai() {
    if (!photo) return
    setBusy('ai'); setMsg(null)
    try {
      const found = await suggestPoints(photo)
      // ruční body mají přednost – AI je nikdy nepřepíše
      const kept = Object.fromEntries(Object.entries(photo.points).filter(([, p]) => p.by === 'human'))
      const points = { ...found, ...kept }
      setPoints(points)
      setActive(nextEmpty(points))
      const n = Object.keys(found).filter((id) => !kept[id]).length
      setMsg({ kind: 'info', text: n ? `AI navrhla ${n} z ${marks.length} bodů. Zkontrolujte je a případně posuňte.` : 'AI na fotce žádný další bod nenašla – umístěte je ručně.' })
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'AI se nepodařilo zavolat.' })
    } finally { setBusy(null) }
  }

  const transfer = anglesFromPhotos(exam)
  const aiCount = photo ? Object.values(photo.points).filter((p) => p.by === 'ai').length : 0

  return (
    <Card title="Fotografie stoje" hint="Nahrajte fotky z pěti pohledů, označte na nich body a aplikace dopočítá úhly a symetrii.">
      <div role="tablist" aria-label="Pohled" className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => {
          const has = photos.some((p) => p.view === v.id)
          return (
            <button key={v.id} role="tab" aria-selected={v.id === view} onClick={() => pick(v.id)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${v.id === view ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-white text-ink hover:bg-paper'}`}>
              {v.label}{has && <span aria-label="fotka nahraná"> ✓</span>}
            </button>
          )
        })}
      </div>

      {msg && <p role={msg.kind === 'error' ? 'alert' : 'status'} className={`mb-3 rounded-md px-3 py-2 text-sm ${msg.kind === 'error' ? 'bg-sig/10 text-sig' : 'bg-brand-soft text-ink'}`}>{msg.text}</p>}

      {!photo ? (
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-line p-8 text-center hover:bg-paper">
          <input type="file" accept={ACCEPT} className="sr-only" aria-label={`Nahrát fotku – ${info.label}`} disabled={busy != null} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} />
          <span className="font-medium text-brand">{busy === 'upload' ? 'Zpracovávám fotku…' : `Nahrát nebo vyfotit – ${info.label.toLowerCase()}`}</span>
          <span className="mt-2 block text-sm text-muted">{info.tip}</span>
          <span className="mt-1 block text-xs text-muted">JPEG, PNG, WebP, HEIC/HEIF (iPhone), AVIF, GIF, BMP, TIFF</span>
        </label>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="min-w-0 space-y-3">
            <PhotoCanvas
              photo={photo}
              active={active}
              zoom={zoom}
              onPick={setActive}
              onPlace={(x, y) => {
                if (!active || !marks.some((m) => m.id === active)) return
                const points = { ...photo.points, [active]: { x, y, by: 'human' as const } }
                setPoints(points)
                setActive(nextEmpty(points, active) ?? active)
              }}
              onMove={(id, x, y) => setPoints({ ...photo.points, [id]: { x, y, by: 'human' } })}
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: POINT_COLOR.human, boxShadow: `0 0 0 1px ${POINT_COLOR.human}` }} />umístěno nebo potvrzeno ručně</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: POINT_COLOR.ai }} />návrh AI</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void ai()} disabled={busy != null || !!aiOff}>{busy === 'ai' ? 'AI hledá body…' : 'AI: navrhnout body'}</Button>
              {aiCount > 0 && <Button variant="ghost" onClick={() => setPoints(Object.fromEntries(Object.entries(photo.points).map(([k, p]) => [k, { ...p, by: 'human' as const }])))}>Potvrdit návrhy AI ({aiCount})</Button>}
              <Button variant="ghost" onClick={() => setZoom(!zoom)}>{zoom ? 'Zmenšit' : 'Zvětšit'}</Button>
              <label className="cursor-pointer rounded-md border border-line bg-white px-3.5 py-2 text-sm font-medium hover:bg-paper">
                <input type="file" accept={ACCEPT} className="sr-only" disabled={busy != null} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} />
                {busy === 'upload' ? 'Zpracovávám…' : 'Vyměnit fotku'}
              </label>
              <Button variant="danger" onClick={() => { if (confirm('Odstranit tuto fotku i s body?')) { void deletePhotos([photo.id]); setPhotos(photos.filter((p) => p !== photo)); setActive(null) } }}>Odstranit</Button>
            </div>
            {aiOff && <p className="text-xs text-muted">{aiOff} Body lze vždy umístit ručně.</p>}
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Body</h4>
              <p className="mb-2 text-xs text-muted">Vyberte bod a klepněte na jeho místo na fotce. Umístěný bod přetáhněte, nebo ho dolaďte šipkami.</p>
              <ol className="divide-y divide-line rounded-lg border border-line">
                {marks.map((m, i) => {
                  const p = photo.points[m.id]
                  return (
                    <li key={m.id} className={`flex items-center gap-2 px-2 ${active === m.id ? 'bg-brand-soft' : ''}`}>
                      <button className="flex min-w-0 flex-1 items-baseline gap-2 py-1.5 text-left text-sm" aria-pressed={active === m.id} onClick={() => setActive(m.id)}>
                        <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-muted">{i + 1}</span>
                        <span className="min-w-0">
                          <span className="font-medium">{m.label}</span>
                          {active === m.id && <span className="block text-xs text-muted">{m.hint}</span>}
                        </span>
                      </button>
                      <span className="shrink-0 text-xs text-muted">{!p ? 'chybí' : p.by === 'ai' ? 'AI' : 'ručně'}</span>
                      {p && <button className="shrink-0 px-1 text-muted hover:text-sig" aria-label={`Odebrat bod ${m.label}`} onClick={() => { const { [m.id]: _, ...rest } = photo.points; setPoints(rest); setActive(m.id) }}>×</button>}
                    </li>
                  )
                })}
              </ol>
            </div>
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Vypočteno z fotky</h4>
              <PhotoMeasures photo={photo} />
            </div>
          </div>
        </div>
      )}

      {transfer.count > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => {
            const patch: Partial<StaticExam> = { angles: transfer.angles }
            if (transfer.ratio != null && exam.heightCm != null) patch.bodyLengthCm = Math.round(transfer.ratio * exam.heightCm * 10) / 10
            set(patch)
            setMsg({ kind: 'info', text: 'Úhly z fotek jsou přenesené do tabulky měření. Hodnoty tam můžete dál upravit.' })
          }}>Přenést úhly z fotek do měření</Button>
          <span className="text-xs text-muted">Levý bok vyplní levou stranu, pravý bok pravou. Přepíše hodnoty v tabulce úhlů.</span>
        </div>
      )}
    </Card>
  )
}
