import { useRef, useState } from 'react'
import { LANDMARKS, SEGMENTS } from '../lib/landmarks'
import { usePhotoUrl } from '../lib/photos'
import type { ExamPhoto } from '../lib/types'

export const POINT_COLOR = { human: '#2a78d6', ai: '#eb6834' }

/**
 * Fotka s body a spojnicemi. V režimu úprav: klepnutí umístí aktivní bod,
 * bod lze přetáhnout myší či prstem nebo posouvat šipkami.
 */
export function PhotoCanvas({ photo, active, zoom = false, onPlace, onMove, onPick }: {
  photo: ExamPhoto
  active?: string | null
  zoom?: boolean
  onPlace?: (x: number, y: number) => void
  onMove?: (id: string, x: number, y: number) => void
  onPick?: (id: string) => void
}) {
  const url = usePhotoUrl(photo.id)
  const svg = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<string | null>(null)
  const edit = !!onMove
  const marks = LANDMARKS[photo.view]
  const r = Math.max(photo.w, photo.h) / (zoom ? 190 : 95)

  const at = (e: { clientX: number; clientY: number }) => {
    const box = svg.current!.getBoundingClientRect()
    const clamp = (v: number) => Math.max(0, Math.min(1, v))
    return [clamp((e.clientX - box.left) / box.width), clamp((e.clientY - box.top) / box.height)] as const
  }

  if (url === false) return <p className="rounded-lg border border-line p-6 text-center text-sm text-muted">Obrázek této fotky se nepodařilo načíst.</p>

  return (
    <div className={zoom ? 'overflow-auto rounded-lg border border-line' : 'overflow-hidden rounded-lg border border-line'} style={zoom ? { maxHeight: '75vh' } : undefined}>
      <div className="relative" style={{ width: zoom ? '220%' : '100%', aspectRatio: `${photo.w} / ${photo.h}` }}>
        {url && <img src={url} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none" />}
        <svg
          ref={svg}
          viewBox={`0 0 ${photo.w} ${photo.h}`}
          className={`absolute inset-0 h-full w-full ${edit && active ? 'cursor-crosshair' : ''}`}
          onClick={(e) => { if (edit && onPlace && !drag) onPlace(...at(e)) }}
          onPointerMove={(e) => { if (drag && onMove) onMove(drag, ...at(e)) }}
          onPointerUp={() => setTimeout(() => setDrag(null))}
          onPointerCancel={() => setDrag(null)}
        >
          {SEGMENTS[photo.view].map(([a, b]) => {
            const [p, q] = [photo.points[a], photo.points[b]]
            return p && q ? <line key={a + b} x1={p.x * photo.w} y1={p.y * photo.h} x2={q.x * photo.w} y2={q.y * photo.h} stroke="#fff" strokeWidth={r / 2.5} strokeOpacity={0.9} style={{ paintOrder: 'stroke' }} /> : null
          })}
          {marks.map((m, i) => {
            const p = photo.points[m.id]
            if (!p) return null
            const [cx, cy] = [p.x * photo.w, p.y * photo.h]
            const color = POINT_COLOR[p.by]
            return (
              <g
                key={m.id}
                data-point={m.id}
                data-by={p.by}
                tabIndex={edit ? 0 : undefined}
                role={edit ? 'button' : undefined}
                aria-label={edit ? `${m.label} – posunout` : undefined}
                className={edit ? 'cursor-grab outline-none' : undefined}
                style={edit ? { touchAction: 'none' } : undefined}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => {
                  if (!edit) return
                  e.stopPropagation()
                  svg.current?.setPointerCapture(e.pointerId)
                  setDrag(m.id)
                  onPick?.(m.id)
                }}
                onKeyDown={(e) => {
                  const d = e.shiftKey ? 0.01 : 0.002
                  const move = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key]
                  if (!move || !onMove) return
                  e.preventDefault()
                  onMove(m.id, Math.max(0, Math.min(1, p.x + move[0])), Math.max(0, Math.min(1, p.y + move[1])))
                }}
              >
                {/* větší neviditelný terč pro prst */}
                <circle cx={cx} cy={cy} r={r * 2.2} fill="transparent" />
                {/* AI = dutý kroužek, člověk = plný bod: rozdíl není jen v barvě */}
                <circle cx={cx} cy={cy} r={r} fill={p.by === 'human' ? color : '#fff'} fillOpacity={p.by === 'human' ? 1 : 0.55} stroke={p.by === 'human' ? '#fff' : color} strokeWidth={r / (p.by === 'human' ? 4 : 2.2)} />
                {active === m.id && <circle cx={cx} cy={cy} r={r * 1.7} fill="none" stroke={color} strokeWidth={r / 4} />}
                <text x={cx + r * 1.5} y={cy - r * 1.1} fontSize={r * 2} fontWeight={700} fill="#fff" stroke="#16201d" strokeWidth={r / 2.2} style={{ paintOrder: 'stroke' }}>{i + 1}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
