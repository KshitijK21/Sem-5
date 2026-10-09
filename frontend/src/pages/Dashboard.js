import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, } from 'recharts';
import { getKpis, getMonthlyRevenue, getRevenueByCategory, } from '@/services/api';
function KpiCard({ label, value, hint }) {
    return (_jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-neutral-500", children: label }), _jsx("div", { className: "text-2xl font-semibold mt-1", children: value }), hint && _jsx("div", { className: "text-xs text-neutral-500 mt-1", children: hint })] }));
}
const fmtMoney = (n) => `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
export default function Dashboard() {
    const [kpis, setKpis] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [cats, setCats] = useState([]);
    const [state, setState] = useState('loading');
    const [filters, setFilters] = useState({ date_from: '', date_to: '', order_status: '' });
    useEffect(() => {
        Promise.all([getKpis(), getMonthlyRevenue(), getRevenueByCategory()])
            .then(([k, m, c]) => {
            setKpis(k);
            setMonthly(m.series);
            setCats(c.series);
            setState('ready');
        })
            .catch(() => setState('error'));
    }, []);
    const applyFilters = () => {
        const params = {};
        if (filters.date_from)
            params.date_from = filters.date_from;
        if (filters.date_to)
            params.date_to = filters.date_to;
        if (filters.order_status)
            params.order_status = filters.order_status;
        getKpis(params)
            .then(setKpis)
            .catch(() => undefined);
    };
    const resetFilters = () => {
        setFilters({ date_from: '', date_to: '', order_status: '' });
        getKpis()
            .then(setKpis)
            .catch(() => undefined);
    };
    if (state === 'loading') {
        return _jsx("div", { className: "text-neutral-400", children: "Loading verified KPIs from Olist data\u2026" });
    }
    if (state === 'error') {
        return (_jsx("div", { className: "text-red-400", children: "Could not load data. Ensure the backend is running and the ETL has been executed." }));
    }
    const k = kpis.kpis;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Dashboard" }), _jsx("p", { className: "text-sm text-neutral-500", children: "Historical Olist dataset (Sep 2016 \u2013 Oct 2018). Revenue = sum of order item prices." })] }), _jsxs("div", { className: "flex flex-wrap items-end gap-3 bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Date from", _jsx("input", { type: "date", value: filters.date_from, onChange: (e) => setFilters({ ...filters, date_from: e.target.value }), className: "bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100" })] }), _jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Date to", _jsx("input", { type: "date", value: filters.date_to, onChange: (e) => setFilters({ ...filters, date_to: e.target.value }), className: "bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100" })] }), _jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Order status", _jsxs("select", { value: filters.order_status, onChange: (e) => setFilters({ ...filters, order_status: e.target.value }), className: "bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100", children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "delivered", children: "delivered" }), _jsx("option", { value: "shipped", children: "shipped" }), _jsx("option", { value: "canceled", children: "canceled" }), _jsx("option", { value: "invoiced", children: "invoiced" }), _jsx("option", { value: "processing", children: "processing" }), _jsx("option", { value: "unavailable", children: "unavailable" })] })] }), _jsx("button", { onClick: applyFilters, className: "bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 text-sm", children: "Apply" }), _jsx("button", { onClick: resetFilters, className: "bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5 text-sm", children: "Reset" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", children: [_jsx(KpiCard, { label: "Total Orders", value: k.total_orders.toLocaleString() }), _jsx(KpiCard, { label: "Total Revenue", value: fmtMoney(k.total_revenue), hint: "sum of item prices" }), _jsx(KpiCard, { label: "Avg Order Value", value: fmtMoney(k.avg_order_value) }), _jsx(KpiCard, { label: "Unique Customers", value: k.unique_customers.toLocaleString() }), _jsx(KpiCard, { label: "Items Sold", value: k.items_sold.toLocaleString() }), _jsx(KpiCard, { label: "Active Sellers", value: k.active_sellers.toLocaleString() }), _jsx(KpiCard, { label: "Avg Review", value: k.avg_review_score != null ? k.avg_review_score.toFixed(2) : '—', hint: "out of 5" }), _jsx(KpiCard, { label: "Avg Delivery", value: k.avg_delivery_days != null ? `${k.avg_delivery_days.toFixed(1)} days` : '—', hint: "delivered only" }), _jsx(KpiCard, { label: "Freight Total", value: fmtMoney(k.total_freight) }), _jsx(KpiCard, { label: "Products", value: k.products_sold.toLocaleString() })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsx("h2", { className: "mb-3 font-medium", children: "Monthly Revenue" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(LineChart, { data: monthly, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "period", stroke: "#666", fontSize: 11 }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => `${Math.round(v / 1000)}k` }), _jsx(Tooltip, { formatter: (v) => fmtMoney(v), contentStyle: { background: '#171717', border: '1px solid #333' } }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", strokeWidth: 2, dot: false })] }) })] }), _jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsx("h2", { className: "mb-3 font-medium", children: "Top Categories by Revenue" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(BarChart, { data: cats, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "category", stroke: "#666", fontSize: 10, angle: -30, textAnchor: "end", height: 70 }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => `${Math.round(v / 1000)}k` }), _jsx(Tooltip, { formatter: (v) => fmtMoney(v), contentStyle: { background: '#171717', border: '1px solid #333' } }), _jsx(Bar, { dataKey: "revenue", fill: "#22c55e" })] }) })] })] })] }));
}
