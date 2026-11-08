import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

interface MetricCardProps {
  label: string
  value: string
  meta: string
  icon: LucideIcon
  accent: string
  index?: number
}

export function MetricCard({
  label,
  value,
  meta,
  icon: Icon,
  accent,
  index = 0,
}: MetricCardProps) {
  return (
    <article
      className="widget group animate-fade-up p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-silver/30"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full opacity-[0.14] blur-3xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ backgroundColor: accent }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-soft"
          style={{ color: accent }}
        >
          <Icon size={16} strokeWidth={1.9} />
        </span>
      </div>

      <p className="relative mt-6 text-[40px] font-semibold leading-none tracking-[-0.04em] text-ink tabular sm:text-[44px]">
        {value}
      </p>

      <div className="relative mt-4 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <p className={cn('text-[11px] text-muted/80')}>{meta}</p>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 h-px opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
    </article>
  )
}
