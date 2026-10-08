import { useState } from 'react'
import type { MlDateFilter } from '@/services/api'
import { ModelRegistry } from '@/components/models/ModelRegistry'
import { ForecastSection } from '@/components/models/ForecastSection'
import { SegmentationSection } from '@/components/models/SegmentationSection'
import { AnomalySection } from '@/components/models/AnomalySection'
import { SalesPredictionSection } from '@/components/models/SalesPredictionSection'

const EMPTY: MlDateFilter = { date_from: '', date_to: '' }

export default function Models() {
  const [filters, setFilters] = useState<MlDateFilter>(EMPTY)
  const [draft, setDraft] = useState<MlDateFilter>(EMPTY)

  const apply = () =>
    setFilters({ date_from: draft.date_from ?? '', date_to: draft.date_to ?? '' })

  const reset = () => {
    setDraft(EMPTY)
    setFilters(EMPTY)
  }

  const filterLabel =
    filters.date_from || filters.date_to
      ? `${filters.date_from || 'start'} → ${filters.date_to || 'latest'}`
      : 'all available dates'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ML Models</h1>
        <p className="text-sm text-neutral-500">
          Live inference over the Olist warehouse — every result below is produced by a trained
          model artifact on request, never by static placeholders.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Date from
          <input
            type="date"
            value={draft.date_from ?? ''}
            onChange={(e) => setDraft({ ...draft, date_from: e.target.value })}
            className="bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100"
            data-testid="ml-date-from"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Date to
          <input
            type="date"
            value={draft.date_to ?? ''}
            onChange={(e) => setDraft({ ...draft, date_to: e.target.value })}
            className="bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100"
            data-testid="ml-date-to"
          />
        </label>
        <button
          onClick={apply}
          className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 text-sm"
          data-testid="ml-apply-filters"
        >
          Apply
        </button>
        <button
          onClick={reset}
          className="bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5 text-sm"
          data-testid="ml-reset-filters"
        >
          Reset
        </button>
        <span className="text-xs text-neutral-500 ml-auto" data-testid="ml-active-filters">
          Active: {filterLabel} · applies to forecasts, segments, and anomalies (not sales
          prediction)
        </span>
      </div>

      <ModelRegistry />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ForecastSection target="orders" filters={filters} />
        <ForecastSection target="revenue" filters={filters} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SegmentationSection kind="customers" filters={filters} />
        <SegmentationSection kind="products" filters={filters} />
      </div>

      <SalesPredictionSection />

      <AnomalySection filters={filters} />
    </div>
  )
}
