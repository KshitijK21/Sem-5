import type { ReactNode } from 'react'
import type { MlDateFilter } from '@/services/api'
import { formatTimestamp } from './format'

export function Card({
  title,
  subtitle,
  badge,
  actions,
  children,
  testId,
}: {
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  testId?: string
}) {
  return (
    <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800" data-testid={testId}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <div>
          <h2 className="font-medium">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {actions}
        </div>
      </div>
      {children}
    </div>
  )
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: 'ok' | 'warn' | 'error' | 'neutral'
  children: ReactNode
}) {
  const cls =
    tone === 'ok'
      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-800'
      : tone === 'warn'
        ? 'bg-amber-900/60 text-amber-300 border-amber-800'
        : tone === 'error'
          ? 'bg-red-900/60 text-red-300 border-red-800'
          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
  return (
    <span className={`text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 ${cls}`}>
      {children}
    </span>
  )
}

export function Loading({ label = 'Running model…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400 py-6" role="status">
      <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-neutral-600 border-t-neutral-200 animate-spin" />
      {label}
    </div>
  )
}

export function ErrorNote({ message, testId = 'error' }: { message: string; testId?: string }) {
  return (
    <div
      className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2 my-2"
      data-testid={testId}
      role="alert"
    >
      {message}
    </div>
  )
}

export function EmptyNote({ message, testId = 'empty' }: { message: string; testId?: string }) {
  return (
    <div
      className="text-sm text-neutral-400 bg-neutral-800/50 border border-neutral-700 rounded px-3 py-2 my-2"
      data-testid={testId}
    >
      {message}
    </div>
  )
}

/** Provenance footer: which filters produced this result and when it was generated. */
export function Provenance({
  filters,
  stale,
  generatedAt,
  extra,
}: {
  filters: MlDateFilter | null
  stale: boolean
  generatedAt?: string | null
  extra?: string
}) {
  const range =
    filters?.date_from || filters?.date_to
      ? `${filters.date_from || 'start'} → ${filters.date_to || 'latest'}`
      : 'all available dates'
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 mt-2">
      <span data-testid="applied-filters">Filters: {range}</span>
      {generatedAt && <span>Generated: {formatTimestamp(generatedAt)}</span>}
      {extra && <span>{extra}</span>}
      {stale && (
        <span className="text-amber-400" data-testid="stale">
          Filters changed — updating…
        </span>
      )}
    </div>
  )
}
