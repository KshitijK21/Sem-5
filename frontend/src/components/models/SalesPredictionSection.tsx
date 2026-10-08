import { useRef, useState } from 'react'
import { predictSales, type SalesPredictInput, type SalesPredictResult } from '@/services/api'
import { Card, ErrorNote, Loading, Provenance, StatusBadge } from './parts'
import { fmtMoney } from './format'

const STATES = [
  'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'ES', 'GO', 'PA', 'AM', 'RN',
]
const CATEGORIES = [
  'bed_bath_table', 'health_beauty', 'sports_leisure', 'computers_accessories',
  'furniture_decor', 'home_appliances', 'toys', 'watches_gifts', 'telephony', 'auto',
]

const DEFAULTS: SalesPredictInput = {
  purchase_month: 6,
  purchase_weekday: 3,
  purchase_hour: 14,
  n_items: 1,
  customer_state: 'SP',
  product_category_name: 'bed_bath_table',
}

type FieldErrors = Partial<Record<keyof SalesPredictInput, string>>

function validate(input: SalesPredictInput): FieldErrors {
  const errs: FieldErrors = {}
  if (input.purchase_month < 1 || input.purchase_month > 12) errs.purchase_month = 'Month must be 1–12'
  if (input.purchase_weekday < 0 || input.purchase_weekday > 6) errs.purchase_weekday = 'Weekday must be 0–6'
  if (input.purchase_hour < 0 || input.purchase_hour > 23) errs.purchase_hour = 'Hour must be 0–23'
  if (input.n_items < 1 || input.n_items > 100) errs.n_items = 'Items must be 1–100'
  if (input.customer_state.length !== 2) errs.customer_state = 'State must be a 2-letter code'
  if (!input.product_category_name.trim()) errs.product_category_name = 'Category is required'
  return errs
}

function NumberField({
  label, value, onChange, min, max, testId, error,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  testId: string
  error?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100 ${
          error ? 'border border-red-700' : 'border border-transparent'
        }`}
        data-testid={testId}
      />
      {error && <span className="text-red-400 text-[11px]">{error}</span>}
    </label>
  )
}

export function SalesPredictionSection() {
  const [input, setInput] = useState<SalesPredictInput>(DEFAULTS)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [result, setResult] = useState<SalesPredictResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)

  const set = <K extends keyof SalesPredictInput>(key: K, value: SalesPredictInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  const predict = async () => {
    const errs = validate(input)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      setError('Fix the highlighted fields and try again.')
      return
    }
    const id = ++reqId.current
    setLoading(true)
    setError(null)
    try {
      const res = await predictSales(input)
      if (id !== reqId.current) return
      setResult(res)
    } catch (err) {
      if (id !== reqId.current) return
      setResult(null)
      setError(err instanceof Error && err.message ? err.message : 'Request failed')
    } finally {
      if (id === reqId.current) setLoading(false)
    }
  }

  const reset = () => {
    setInput(DEFAULTS)
    setFieldErrors({})
    setResult(null)
    setError(null)
  }

  const evalMae =
    result?.metrics?.selected != null && result.metrics.candidates
      ? result.metrics.candidates[result.metrics.selected]?.mae
      : undefined

  return (
    <Card
      testId="sales-prediction"
      title="Sales Prediction"
      subtitle="Point-in-time item revenue for a single order (sklearn Pipeline)"
      badge={<StatusBadge tone="ok">model prediction</StatusBadge>}
    >
      <p className="text-[11px] text-neutral-600 mb-3">
        This model predicts from checkout features only — the shared date-range filters do not
        apply to it.
      </p>

      <div className="flex flex-wrap items-end gap-3 bg-neutral-800/40 p-3 rounded border border-neutral-800">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Purchase month
          <select
            value={input.purchase_month}
            onChange={(e) => set('purchase_month', Number(e.target.value))}
            className="bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100"
            data-testid="predict-month"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          {fieldErrors.purchase_month && (
            <span className="text-red-400 text-[11px]">{fieldErrors.purchase_month}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Weekday (0=Sun)
          <select
            value={input.purchase_weekday}
            onChange={(e) => set('purchase_weekday', Number(e.target.value))}
            className="bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100"
            data-testid="predict-weekday"
          >
            {Array.from({ length: 7 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          {fieldErrors.purchase_weekday && (
            <span className="text-red-400 text-[11px]">{fieldErrors.purchase_weekday}</span>
          )}
        </label>

        <NumberField
          label="Hour of day (0–23)"
          value={input.purchase_hour}
          onChange={(v) => set('purchase_hour', v)}
          min={0}
          max={23}
          testId="predict-hour"
          error={fieldErrors.purchase_hour}
        />
        <NumberField
          label="Items in order"
          value={input.n_items}
          onChange={(v) => set('n_items', v)}
          min={1}
          max={100}
          testId="predict-items"
          error={fieldErrors.n_items}
        />

        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Customer state
          <select
            value={input.customer_state}
            onChange={(e) => set('customer_state', e.target.value)}
            className="bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100"
            data-testid="predict-state"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Product category
          <select
            value={input.product_category_name}
            onChange={(e) => set('product_category_name', e.target.value)}
            className="bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100"
            data-testid="predict-category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => void predict()}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded px-4 py-1.5 text-sm"
          data-testid="predict-submit"
        >
          {loading ? 'Predicting…' : 'Predict'}
        </button>
        <button
          onClick={reset}
          disabled={loading}
          className="bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5 text-sm"
          data-testid="predict-reset"
        >
          Reset
        </button>
      </div>

      {loading && <Loading label="Running sales prediction model…" />}
      {error && !loading && <ErrorNote message={error} testId="predict-error" />}

      {result && !loading && (
        <div className="mt-3" data-testid="predict-result">
          <div className="text-3xl font-semibold text-emerald-300">
            {fmtMoney(result.predicted_item_revenue)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            predicted item revenue · currency {result.currency} · {result.model} ·{' '}
            {result.algorithm ?? ''}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500 mt-2">
            <span>
              Holdout MAE:{' '}
              <span className="text-neutral-300">
                {evalMae != null ? fmtMoney(evalMae) : '—'}
              </span>
            </span>
            {result.metrics.selected && (
              <span>selected model: {result.metrics.selected}</span>
            )}
            <span className="text-neutral-600">training evaluation, not this prediction</span>
          </div>
          <Provenance
            filters={{ date_from: '', date_to: '' }}
            stale={false}
            generatedAt={result.metadata.generated_at ?? null}
            extra={`status: ${result.status} · no date filter applies`}
          />
        </div>
      )}
    </Card>
  )
}
