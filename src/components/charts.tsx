import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SiRow } from '../lib/analysis'
import type { Level, Num, Range } from '../lib/types'

const C = { left: '#2a78d6', right: '#eb6834', band: '#dfe5e2', grid: '#e8ecea', text: '#5b6763', ink: '#16201d' }
const STATUS: Record<Level, string> = { ok: '#0ca30c', mild: '#fab219', sig: '#d03b3b' }
const tick = { fontSize: 12, fill: C.text }
const nf = (v: number, d = 1) => v.toLocaleString('cs-CZ', { maximumFractionDigits: d })

export interface RangeRow {
  label: string
  band: Range
  l: Num
  r: Num
}

/** Dot nudged sideways so the left and right value stay visible when equal. */
const sideDot = (fill: string, dx: number) => (p: { cx?: number; cy?: number; value?: unknown; index?: number }) =>
  p.value == null || p.cx == null || p.cy == null ? (
    <g key={p.index} />
  ) : (
    <circle key={p.index} cx={p.cx + dx} cy={p.cy} r={6} fill={fill} stroke="#fff" strokeWidth={2} />
  )

/**
 * Grey band = reference range of the archetype, dots = measured left / right value.
 * One form for load, standing angles, ROM and stance phase.
 */
export function RangeChart({ rows, unit, refLabel = 'Rozsah typu' }: { rows: RangeRow[]; unit: string; refLabel?: string }) {
  const values = rows.flatMap((r) => [r.band[0], r.band[1], r.l, r.r]).filter((v): v is number => v != null)
  const pad = Math.max(2, (Math.max(...values) - Math.min(...values)) * 0.12)
  const domain: [number, number] = [Math.max(0, Math.floor(Math.min(...values) - pad)), Math.ceil(Math.max(...values) + pad)]
  return (
    <div>
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: C.left }} />Levá</li>
      <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: C.right }} />Pravá</li>
      <li className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: C.band }} />{refLabel}</li>
    </ul>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid vertical={false} stroke={C.grid} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: C.band }} interval={0} />
        <YAxis domain={domain} tick={tick} tickLine={false} axisLine={false} unit={unit} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          formatter={(value, name) => [Array.isArray(value) ? `${value[0]}–${value[1]}${unit}` : `${nf(Number(value))}${unit}`, name]}
          contentStyle={{ borderRadius: 8, borderColor: C.band, fontSize: 13 }}
          itemStyle={{ color: C.ink }}
        />
        <Bar dataKey="band" name={refLabel} fill={C.band} radius={4} barSize={44} isAnimationActive={false} legendType="square" />
        <Line dataKey="l" name="Levá" stroke="none" isAnimationActive={false} legendType="circle" color={C.left} dot={sideDot(C.left, -8)} activeDot={false} />
        <Line dataKey="r" name="Pravá" stroke="none" isAnimationActive={false} legendType="circle" color={C.right} dot={sideDot(C.right, 8)} activeDot={false} />
      </ComposedChart>
    </ResponsiveContainer>
    </div>
  )
}

/** Symmetry index per parameter with the 5 % and 10 % clinical thresholds. */
export function SiChart({ rows }: { rows: SiRow[] }) {
  const max = Math.max(15, ...rows.map((r) => r.si)) * 1.15
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 34 + 50)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 18, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid horizontal={false} stroke={C.grid} />
        <XAxis type="number" domain={[0, Math.ceil(max)]} tick={tick} tickLine={false} axisLine={false} unit=" %" />
        <YAxis type="category" dataKey="label" width={130} tick={tick} tickLine={false} axisLine={{ stroke: C.band }} />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          formatter={(value) => [`${nf(Number(value))} %`, 'Index symetrie']}
          contentStyle={{ borderRadius: 8, borderColor: C.band, fontSize: 13 }}
          itemStyle={{ color: C.ink }}
        />
        <ReferenceLine x={5} stroke={C.text} strokeDasharray="4 4" label={{ value: '5 % mírná', position: 'top', fontSize: 11, fill: C.text }} />
        <ReferenceLine x={10} stroke={C.text} strokeDasharray="4 4" label={{ value: '10 % významná', position: 'top', fontSize: 11, fill: C.text }} />
        <Bar dataKey="si" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
          {rows.map((r) => <Cell key={r.key} fill={STATUS[r.level]} />)}
          <LabelList dataKey="si" position="right" formatter={(v) => nf(Number(v))} style={{ fontSize: 12, fill: C.ink }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
