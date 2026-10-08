import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getCustomerSegments,
  getProductSegments,
  type CustomerSegmentsResult,
  type MlDateFilter,
  type ProductSegmentsResult,
} from '@/services/api'
import { useMlSection } from './useMlSection'
import { Card, EmptyNote, ErrorNote, Loading, Provenance, StatusBadge } from './parts'
import { fmtInt, fmtMoneyShort, fmtPct } from './format'

type Kind = 'customers' | 'products'

type AnySegResult = CustomerSegmentsResult | ProductSegmentsResult

function clusterRows(kind: Kind, data: AnySegResult) {
  if (kind === 'customers') {
    const d = data as CustomerSegmentsResult
    return d.inference.clusters.map((c) => ({
      key: `C${c.cluster}`,
      size: c.customers,
      share: c.share,
      detail: [
        `recency ${c.mean_recency_days.toFixed(0)}d`,
        `freq ${c.mean_frequency.toFixed(1)}`,
        `value ${fmtMoneyShort(c.mean_monetary)}`,
      ],
    }))
  }
  const d = data as ProductSegmentsResult
  return d.inference.clusters.map((c) => ({
    key: `C${c.cluster}`,
    size: c.products,
    share: c.share,
    detail: [
      `qty ${c.mean_total_qty.toFixed(0)}`,
      `rev ${fmtMoneyShort(c.mean_total_revenue)}`,
      `price ${fmtMoneyShort(c.mean_avg_price)}`,
      `weight ${c.mean_product_weight_g.toFixed(0)}g`,
    ],
  }))
}

export function SegmentationSection({ kind, filters }: { kind: Kind; filters: MlDateFilter }) {
  const section = useMlSection<AnySegResult>(
    (f) => (kind === 'customers' ? getCustomerSegments(f) : getProductSegments(f)),
    filters,
  )
  const { status, data, error, appliedFilters, stale } = section

  const isCustomers = kind === 'customers'
  const title = isCustomers ? 'Customer Segmentation' : 'Product Segmentation'
  const noun = isCustomers ? 'customers' : 'products'
  const total = !data
    ? 0
    : isCustomers
      ? (data as CustomerSegmentsResult).inference.n_customers
      : (data as ProductSegmentsResult).inference.n_products
  const rows = data ? clusterRows(kind, data) : []
  const silhouette = data?.metrics?.silhouette

  return (
    <Card
      testId={`segments-${kind}`}
      title={title}
      subtitle={
        data
          ? `${data.model} · ${data.algorithm ?? ''} — k-means on ${data.inference.features.join(', ')}`
          : `K-means clustering of ${noun} from warehouse features`
      }
      badge={<StatusBadge tone={data?.status === 'success' ? 'ok' : 'neutral'}>{data?.status ?? 'inference'}</StatusBadge>}
    >
      {status === 'loading' && !data && <Loading label={`Running ${title.toLowerCase()} model…`} />}
      {status === 'error' && error && <ErrorNote message={error} testId={`segments-error-${kind}`} />}

      {data && (
        <div data-testid={`segments-result-${kind}`}>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300 my-2">
            <span>
              {isCustomers ? 'Customers' : 'Products'}: <span className="text-neutral-400">{fmtInt(total)}</span>
            </span>
            <span>
              Clusters (k): <span className="text-neutral-400">{data.inference.k}</span>
            </span>
            {silhouette != null && (
              <span>
                Silhouette: <span className="text-neutral-400">{silhouette.toFixed(3)}</span>{' '}
                <span className="text-neutral-600 text-xs">(training evaluation)</span>
              </span>
            )}
          </div>

          {rows.length === 0 ? (
            <EmptyNote message="No clusters returned by the model." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="key" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#171717', border: '1px solid #333' }}
                    formatter={(v: number) => [fmtInt(v), isCustomers ? 'customers' : 'products']}
                  />
                  <Bar dataKey="size" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>

              <table className="w-full text-sm mt-3" data-testid={`cluster-table-${kind}`}>
                <thead>
                  <tr className="text-left text-xs text-neutral-500 border-b border-neutral-800">
                    <th className="py-1.5 pr-2">Cluster</th>
                    <th className="py-1.5 pr-2">{isCustomers ? 'Customers' : 'Products'}</th>
                    <th className="py-1.5 pr-2">Share</th>
                    <th className="py-1.5">Means</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className="border-b border-neutral-800/60" data-testid="cluster-row">
                      <td className="py-1.5 pr-2 font-medium">{r.key}</td>
                      <td className="py-1.5 pr-2">{fmtInt(r.size)}</td>
                      <td className="py-1.5 pr-2">{fmtPct(r.share)}</td>
                      <td className="py-1.5 text-neutral-400 text-xs">{r.detail.join(' · ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

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
