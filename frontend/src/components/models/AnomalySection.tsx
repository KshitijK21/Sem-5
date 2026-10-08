import { getAnomalies, type AnomaliesResult, type MlDateFilter } from '@/services/api'
import { useMlSection } from './useMlSection'
import { Card, EmptyNote, ErrorNote, Loading, Provenance, StatusBadge } from './parts'
import { fmtInt, fmtMoneyShort, fmtPct } from './format'

export function AnomalySection({ filters }: { filters: MlDateFilter }) {
  const section = useMlSection<AnomaliesResult>((f) => getAnomalies(f), filters)
  const { status, data, error, appliedFilters, stale } = section

  const inf = data?.inference

  return (
    <Card
      testId="anomalies"
      title="Anomaly Detection"
      subtitle={
        data
          ? `${data.model} · ${data.algorithm ?? ''} — daily orders/revenue outliers via IsolationForest`
          : 'Unusual trading days detected by an IsolationForest over daily orders and revenue'
      }
      badge={<StatusBadge tone={inf ? 'ok' : 'neutral'}>{data?.status ?? 'inference'}</StatusBadge>}
    >
      {status === 'loading' && !data && <Loading label="Running anomaly model…" />}
      {status === 'error' && error && <ErrorNote message={error} testId="anomalies-error" />}

      {data && inf && (
        <div data-testid="anomalies-result">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300 my-2">
            <span>
              Days evaluated: <span className="text-neutral-400">{fmtInt(inf.n_days)}</span>{' '}
              <span className="text-neutral-600 text-xs">
                ({inf.evaluated_from} → {inf.evaluated_to})
              </span>
            </span>
            <span>
              Anomalies: <span className="text-neutral-400">{fmtInt(inf.n_anomalies)}</span>
            </span>
            <span>
              Share: <span className="text-neutral-400">{fmtPct(inf.anomaly_share)}</span>
            </span>
            <span>
              Contamination (training):{' '}
              <span className="text-neutral-400">
                {inf.contamination != null ? inf.contamination.toFixed(2) : 'n/a'}
              </span>
            </span>
          </div>

          {inf.n_days === 0 ? (
            <EmptyNote message="No days in the selected date range." testId="anomalies-empty" />
          ) : inf.top_anomalies.length === 0 ? (
            <EmptyNote
              message="No anomalies detected for the selected period."
              testId="anomalies-empty"
            />
          ) : (
            <table className="w-full text-sm mt-1" data-testid="anomalies-table">
              <caption className="text-left text-[11px] text-neutral-600 pb-1">
                Showing up to {inf.top_anomalies.length} most anomalous days (score ascending).
              </caption>
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b border-neutral-800">
                  <th className="py-1.5 pr-2">Date</th>
                  <th className="py-1.5 pr-2">Orders</th>
                  <th className="py-1.5 pr-2">Revenue</th>
                  <th className="py-1.5">Anomaly score</th>
                </tr>
              </thead>
              <tbody>
                {inf.top_anomalies.map((a) => (
                  <tr
                    key={a.date}
                    className="border-b border-neutral-800/60"
                    data-testid="anomaly-row"
                  >
                    <td className="py-1.5 pr-2 font-medium">{a.date.slice(0, 10)}</td>
                    <td className="py-1.5 pr-2">{fmtInt(a.orders)}</td>
                    <td className="py-1.5 pr-2">{fmtMoneyShort(a.revenue)}</td>
                    <td className="py-1.5 text-amber-300">{a.score.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="text-[11px] text-neutral-600 mt-2">{inf.score_definition}</p>

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
