import { useId, useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import type { RatingPoint } from '../../types/profile'
import { cn, formatLongDate, formatShortDate, formatSigned } from '../../lib/utils'

interface RatingLineChartProps {
  data: RatingPoint[]
  accent: string
  /** Compact charts are used inside the exported card. */
  compact?: boolean
  showAxis?: boolean
  showGrid?: boolean
  interactive?: boolean
  /** Optional viewBox height, used to fit the chart inside the exported card. */
  height?: number
  /** Optional axis label size in viewBox units. */
  labelSize?: number
  className?: string
  /** Theme-aware colours used by the exported card. */
  gridColor?: string
  labelColor?: string
  dotFill?: string
}

const VIEW_WIDTH = 1000

interface ChartGeometry {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
  min: number
  max: number
  points: Array<{ x: number; y: number; point: RatingPoint }>
  linePath: string
  areaPath: string
  gridLines: number[]
  xTicks: Array<{ x: number; label: string }>
  current: { x: number; y: number }
  peak: { x: number; y: number; value: number }
}

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index]
    const to = points[index + 1]
    const control = (to.x - from.x) / 3
    path += ` C ${from.x + control} ${from.y}, ${to.x - control} ${to.y}, ${to.x} ${to.y}`
  }
  return path
}

function buildGeometry(
  data: RatingPoint[],
  compact: boolean,
  showAxis: boolean,
  heightOverride?: number,
): ChartGeometry {
  const height = heightOverride ?? (compact ? 300 : 320)
  const padding = {
    top: compact ? 26 : 28,
    right: compact ? 12 : 16,
    bottom: showAxis ? (compact ? 52 : 46) : 24,
    left: compact ? 12 : 16,
  }

  const ratings = data.map((point) => point.rating)
  const rawMin = Math.min(...ratings)
  const rawMax = Math.max(...ratings)
  const spread = Math.max(rawMax - rawMin, 120)
  const min = Math.floor((rawMin - spread * 0.18) / 50) * 50
  const max = Math.ceil((rawMax + spread * 0.18) / 50) * 50

  const plotWidth = VIEW_WIDTH - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const points = data.map((point, index) => {
    const x =
      data.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (index / (data.length - 1)) * plotWidth
    const y =
      padding.top + (1 - (point.rating - min) / (max - min)) * plotHeight
    return { x, y, point }
  })

  const linePath = buildSmoothPath(points)
  const bottom = height - padding.bottom
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
      : ''

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3
    return padding.top + ratio * plotHeight
  })

  const tickCount = Math.min(compact ? 4 : 6, data.length)
  const xTicks = Array.from({ length: tickCount }, (_, index) => {
    const dataIndex =
      tickCount === 1
        ? 0
        : Math.round((index / (tickCount - 1)) * (data.length - 1))
    return {
      x: points[dataIndex].x,
      label: formatShortDate(data[dataIndex].date),
    }
  })

  const current = points[points.length - 1]
  const peakIndex = ratings.indexOf(Math.max(...ratings))
  const peak = { ...points[peakIndex], value: ratings[peakIndex] }

  return {
    width: VIEW_WIDTH,
    height,
    padding,
    min,
    max,
    points,
    linePath,
    areaPath,
    gridLines,
    xTicks,
    current,
    peak,
  }
}

export function RatingLineChart({
  data,
  accent,
  compact = false,
  showAxis = true,
  showGrid = true,
  interactive = true,
  height,
  labelSize,
  className,
  gridColor,
  labelColor,
  dotFill,
}: RatingLineChartProps) {
  const gradientId = useId()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const geometry = useMemo(
    () => buildGeometry(data, compact, showAxis, height),
    [data, compact, showAxis, height],
  )

  if (data.length === 0) return null

  const active = activeIndex === null ? null : geometry.points[activeIndex]
  const activePoint = active?.point ?? null

  const handlePointerMove = (
    event: ReactPointerEvent<SVGSVGElement>,
  ) => {
    if (!interactive) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const relative = (event.clientX - bounds.left) / bounds.width
    const plotStart = geometry.padding.left / geometry.width
    const plotEnd = 1 - geometry.padding.right / geometry.width
    const ratio = (relative - plotStart) / (plotEnd - plotStart)
    const index = Math.round(ratio * (geometry.points.length - 1))
    setActiveIndex(Math.max(0, Math.min(geometry.points.length - 1, index)))
  }

  const tooltipStyle =
    active === null
      ? undefined
      : {
          left: `clamp(96px, ${(active.x / geometry.width) * 100}%, calc(100% - 96px))`,
          top: `${(active.y / geometry.height) * 100}%`,
        }

  return (
    <div className={cn('relative w-full', className)}>
      <svg
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Rating history line chart"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient
            id={`${gradientId}-area`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={accent} stopOpacity={compact ? 0.26 : 0.2} />
            <stop offset="70%" stopColor={accent} stopOpacity={0.03} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-line`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor={accent} stopOpacity={0.45} />
            <stop offset="45%" stopColor={accent} stopOpacity={1} />
            <stop offset="100%" stopColor={accent} stopOpacity={0.9} />
          </linearGradient>
        </defs>

        {showGrid
          ? geometry.gridLines.map((y, index) => (
              <line
                key={y}
                x1={geometry.padding.left}
                x2={geometry.width - geometry.padding.right}
                y1={y}
                y2={y}
                stroke={gridColor ?? 'var(--app-chart-grid)'}
                strokeWidth={1}
                strokeDasharray={index === geometry.gridLines.length - 1 ? undefined : '3 7'}
              />
            ))
          : null}

        <path d={geometry.areaPath} fill={`url(#${gradientId}-area)`} />
        <path
          d={geometry.linePath}
          fill="none"
          stroke={`url(#${gradientId}-line)`}
          strokeWidth={compact ? 4 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <line
          x1={geometry.peak.x}
          x2={geometry.peak.x}
          y1={geometry.peak.y}
          y2={geometry.height - geometry.padding.bottom}
          stroke={accent}
          strokeOpacity={0.16}
          strokeDasharray="3 8"
        />
        <circle
          cx={geometry.peak.x}
          cy={geometry.peak.y}
          r={compact ? 5 : 4}
          fill={dotFill ?? 'var(--app-chart-dot)'}
          stroke={accent}
          strokeOpacity={0.45}
          strokeWidth={2}
        />

        <circle
          cx={geometry.current.x}
          cy={geometry.current.y}
          r={compact ? 22 : 18}
          fill={accent}
          fillOpacity={0.12}
        />
        <circle
          cx={geometry.current.x}
          cy={geometry.current.y}
          r={compact ? 9 : 7}
          fill={accent}
        />
        <circle
          cx={geometry.current.x}
          cy={geometry.current.y}
          r={compact ? 4 : 3}
          fill={dotFill ?? 'var(--app-chart-dot)'}
        />

        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={geometry.padding.top}
              y2={geometry.height - geometry.padding.bottom}
              stroke={accent}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={6}
              fill={accent}
              stroke={dotFill ?? 'var(--app-chart-dot)'}
              strokeWidth={3}
            />
          </>
        ) : null}

        {showAxis
          ? geometry.xTicks.map((tick, index) => (
              <text
                key={`${tick.label}-${index}`}
                x={tick.x}
                y={geometry.height - 14}
                textAnchor={
                  index === 0
                    ? 'start'
                    : index === geometry.xTicks.length - 1
                      ? 'end'
                      : 'middle'
                }
                fill={labelColor ?? 'var(--app-chart-label)'}
                fontSize={labelSize ?? (compact ? 20 : 18)}
                fontFamily="inherit"
              >
                {tick.label}
              </text>
            ))
          : null}
      </svg>

      {interactive && active && activePoint ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-line bg-surface/95 px-3 py-2 shadow-xl shadow-black/10 backdrop-blur dark:shadow-black/40"
          style={tooltipStyle}
        >
          <p className="text-xs font-semibold text-ink tabular">
            {activePoint.oldRating} → {activePoint.rating}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted">
            {formatLongDate(activePoint.date)}
          </p>
          <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted/70">
            {activePoint.contest}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">
            <span
              className={
                activePoint.change >= 0
                  ? 'text-positive'
                  : 'text-negative'
              }
            >
              {formatSigned(activePoint.change)}
            </span>
            <span className="mx-1 text-line">·</span>
            rank #{activePoint.rank}
          </p>
        </div>
      ) : null}
    </div>
  )
}
