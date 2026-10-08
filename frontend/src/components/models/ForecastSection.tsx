import { useEffect, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getForecast, type ForecastResult, type MlDateFilter } from '@/services/api'
import { useMlSection } from './useMlSection'
import { Card, ErrorNote, Loading, Provenance, StatusBadge } from './parts'
import { fmtInt, fmtMoneyShort } from './format'

const HORIZONS = [7, 14, 30, 60, 90]

interface ChartPoint {
  date: string
  history?: number
  forecast?: number
}

export function ForecastSection({ target, filters }: { target: 'orders' | 'revenue'; filters: MlDateFilter }) {
  const [periods, setPeriods] = useState(30)
  const section = useMlSection<ForecastResult>(
    (f) => getForecast({ ...f, periods, target }),
    filters,
  )
  const { status, data, error, appliedFilters, stale, run } = section

  // refetch when the horizon changes (only after the section has run before)
  const prevPeriods = useRef(periods)
  const started = status !== 'idle'
  useEffect(() => {
    if (prevPeriods.current === periods) return
    prevPeriods.current = periods
    if (started) void run()
  }, [periods, started, run])

  const isMoney = target === 'revenue'
  const title = isMoney ? 'Revenue Forecast' : 'Order Forecast'
  const unit = isMoney ? 'BRL' : 'orders'
  const fmtValue = isMoney ? fmtMoneyShort : fmtInt

  const chart: ChartPoint[] = data
    ? [
        ...data.history_tail.map((p) => ({ date: p.date, history: p.value })),
        ...data.forecast.map((p) => ({ date: p.date, forecast: p.value })),
      ]
    : []

  const evalMae = data?.metrics?.model?.mae
  const baseMae = data?.metrics?.seasonal_naive_baseline?.mae

  return (
    <Card
      testId={`forecast-${target}`}
      title={title}
      subtitle={
        data
          ? `${data.model} · ${data.algorithm ?? ''} — recursive multi-step forecast of ${unit}`
          : `Model prediction of ${unit} beyond the last observed date`
      }
      badge={<StatusBadge tone="ok">model prediction</StatusBadge>}
      actions={
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 flex items-center gap-1.5">
            Horizon (days)
            <select
              value={periods}
              onChange={(e) => setPeriods(Number(e.target.value))}
              className="bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100"
              data-testid={`horizon-${target}`}
            >
              {HORIZONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => void run()}
            disabled={status === 'loading'}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded px-3 py-1.5 text-sm"
            data-testid={`forecast-run-${target}`}
          >
            {status === 'loading' ? 'Running model…' : 'Run forecast'}
          </button>
        </div>
      }
    >
      {status === 'loading' && !data && <Loading label="Running forecast model…" />}

      {status === 'error' && error && <ErrorNote message={error} testId={`forecast-error-${target}`} />}

      {data && (
        <div data-testid={`forecast-result-${target}`}>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300 my-2">
            <span>
              History: <span className="text-neutral-400">{fmtInt(data.metadata.n_history_days)} days</span>
            </span>
            <span>
              Forecast: <span className="text-neutral-400">{data.periods} days → {data.forecast[0]?.date.slice(0, 10)} … {data.forecast[data.forecast.length - 1]?.date.slice(0, 10)}</span>
            </span>
            <span>
              Last value: <span className="text-neutral-400">{fmtValue(data.history_tail[data.history_tail.length - 1]?.value ?? 0)}</span>
            </span>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v: number) => (isMoney ? `${Math.round(v / 1000)}k` : fmtInt(v))} />
              <Tooltip
                contentStyle={{ background: '#171717', border: '1px solid #333' }}
                formatter={(v: number) => [fmtValue(v), '']}
              />
              <Legend />
              <Line type="monotone" dataKey="history" name="Observed" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="forecast" name={`Forecast (${unit})`} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500 mt-2">
            <span>Holdout MAE (model): <span className="text-neutral-300">{evalMae != null ? fmtValue(evalMae) : '—'}</span></span>
            <span>Baseline MAE (seasonal naive): <span className="text-neutral-300">{baseMae != null ? fmtValue(baseMae) : '—'}</span></span>
            <span className="text-neutral-600">training evaluation, not this forecast</span>
          </div>

          <Provenance
            filters={appliedFilters}
            stale={stale}
            generatedAt={data.metadata.generated_at ?? null}
            extra={`status: ${data.status}`}
          />
        </div>
      )}
    </Card>
  )
}
