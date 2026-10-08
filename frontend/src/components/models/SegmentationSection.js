import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { getCustomerSegments, getProductSegments, } from '@/services/api';
import { useMlSection } from './useMlSection';
import { Card, EmptyNote, ErrorNote, Loading, Provenance, StatusBadge } from './parts';
import { fmtInt, fmtMoneyShort, fmtPct } from './format';
function clusterRows(kind, data) {
    if (kind === 'customers') {
        const d = data;
        return d.inference.clusters.map((c) => ({
            key: `C${c.cluster}`,
            size: c.customers,
            share: c.share,
            detail: [
                `recency ${c.mean_recency_days.toFixed(0)}d`,
                `freq ${c.mean_frequency.toFixed(1)}`,
                `value ${fmtMoneyShort(c.mean_monetary)}`,
            ],
        }));
    }
    const d = data;
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
    }));
}
export function SegmentationSection({ kind, filters }) {
    const section = useMlSection((f) => (kind === 'customers' ? getCustomerSegments(f) : getProductSegments(f)), filters);
    const { status, data, error, appliedFilters, stale } = section;
    const isCustomers = kind === 'customers';
    const title = isCustomers ? 'Customer Segmentation' : 'Product Segmentation';
    const noun = isCustomers ? 'customers' : 'products';
    const total = !data
        ? 0
        : isCustomers
            ? data.inference.n_customers
            : data.inference.n_products;
    const rows = data ? clusterRows(kind, data) : [];
    const silhouette = data?.metrics?.silhouette;
    return (_jsxs(Card, { testId: `segments-${kind}`, title: title, subtitle: data
            ? `${data.model} · ${data.algorithm ?? ''} — k-means on ${data.inference.features.join(', ')}`
            : `K-means clustering of ${noun} from warehouse features`, badge: _jsx(StatusBadge, { tone: data?.status === 'success' ? 'ok' : 'neutral', children: data?.status ?? 'inference' }), children: [status === 'loading' && !data && _jsx(Loading, { label: `Running ${title.toLowerCase()} model…` }), status === 'error' && error && _jsx(ErrorNote, { message: error, testId: `segments-error-${kind}` }), data && (_jsxs("div", { "data-testid": `segments-result-${kind}`, children: [_jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300 my-2", children: [_jsxs("span", { children: [isCustomers ? 'Customers' : 'Products', ": ", _jsx("span", { className: "text-neutral-400", children: fmtInt(total) })] }), _jsxs("span", { children: ["Clusters (k): ", _jsx("span", { className: "text-neutral-400", children: data.inference.k })] }), silhouette != null && (_jsxs("span", { children: ["Silhouette: ", _jsx("span", { className: "text-neutral-400", children: silhouette.toFixed(3) }), ' ', _jsx("span", { className: "text-neutral-600 text-xs", children: "(training evaluation)" })] }))] }), rows.length === 0 ? (_jsx(EmptyNote, { message: "No clusters returned by the model." })) : (_jsxs(_Fragment, { children: [_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: rows, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "key", stroke: "#666", fontSize: 11 }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => `${Math.round(v / 1000)}k` }), _jsx(Tooltip, { contentStyle: { background: '#171717', border: '1px solid #333' }, formatter: (v) => [fmtInt(v), isCustomers ? 'customers' : 'products'] }), _jsx(Bar, { dataKey: "size", fill: "#3b82f6" })] }) }), _jsxs("table", { className: "w-full text-sm mt-3", "data-testid": `cluster-table-${kind}`, children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-xs text-neutral-500 border-b border-neutral-800", children: [_jsx("th", { className: "py-1.5 pr-2", children: "Cluster" }), _jsx("th", { className: "py-1.5 pr-2", children: isCustomers ? 'Customers' : 'Products' }), _jsx("th", { className: "py-1.5 pr-2", children: "Share" }), _jsx("th", { className: "py-1.5", children: "Means" })] }) }), _jsx("tbody", { children: rows.map((r) => (_jsxs("tr", { className: "border-b border-neutral-800/60", "data-testid": "cluster-row", children: [_jsx("td", { className: "py-1.5 pr-2 font-medium", children: r.key }), _jsx("td", { className: "py-1.5 pr-2", children: fmtInt(r.size) }), _jsx("td", { className: "py-1.5 pr-2", children: fmtPct(r.share) }), _jsx("td", { className: "py-1.5 text-neutral-400 text-xs", children: r.detail.join(' · ') })] }, r.key))) })] })] })), _jsx(Provenance, { filters: appliedFilters, stale: stale, generatedAt: data.metadata.generated_at ?? null, extra: `status: ${data.status}` })] }))] }));
}
