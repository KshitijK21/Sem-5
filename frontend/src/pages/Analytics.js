import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { getAnalyticsSales, getAnalyticsOrders, getAnalyticsProducts, getAnalyticsCustomers, getAnalyticsSellers, } from '@/services/api';
const fmtMoney = (n) => `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
export default function Analytics() {
    const [monthly, setMonthly] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [cats, setCats] = useState([]);
    const [customers, setCustomers] = useState(null);
    const [sellers, setSellers] = useState(null);
    const [state, setState] = useState('loading');
    useEffect(() => {
        Promise.all([
            getAnalyticsSales(),
            getAnalyticsOrders(),
            getAnalyticsProducts(),
            getAnalyticsCustomers(),
            getAnalyticsSellers(),
        ])
            .then(([s, o, p, c, se]) => {
            setMonthly(s.monthly_revenue);
            setStatuses(o.by_status);
            setCats(p.revenue_by_category);
            setCustomers(c);
            setSellers(se);
            setState('ready');
        })
            .catch(() => setState('error'));
    }, []);
    if (state === 'loading')
        return _jsx("div", { className: "text-neutral-400", children: "Loading analytics\u2026" });
    if (state === 'error') {
        return (_jsx("div", { className: "text-red-400", children: "Could not load analytics. Ensure the backend is running and the ETL has been executed." }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Analytics" }), _jsx("p", { className: "text-sm text-neutral-500", children: "Historical analysis from the Olist warehouse." })] }), _jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsx("h2", { className: "mb-3 font-medium", children: "Monthly Revenue" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(LineChart, { data: monthly, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "period", stroke: "#666", fontSize: 11 }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => `${Math.round(v / 1000)}k` }), _jsx(Tooltip, { formatter: (v) => fmtMoney(v), contentStyle: { background: '#171717', border: '1px solid #333' } }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", strokeWidth: 2, dot: false })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsx("h2", { className: "mb-3 font-medium", children: "Orders by Status" }), _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(BarChart, { data: statuses, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "status", stroke: "#666", fontSize: 10, angle: -20, textAnchor: "end", height: 60 }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => `${Math.round(v / 1000)}k` }), _jsx(Tooltip, { contentStyle: { background: '#171717', border: '1px solid #333' } }), _jsx(Bar, { dataKey: "orders", fill: "#f59e0b" })] }) })] }), _jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsx("h2", { className: "mb-3 font-medium", children: "Top Categories by Revenue" }), _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(BarChart, { data: cats, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "category", stroke: "#666", fontSize: 10, angle: -30, textAnchor: "end", height: 70 }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => `${Math.round(v / 1000)}k` }), _jsx(Tooltip, { formatter: (v) => fmtMoney(v), contentStyle: { background: '#171717', border: '1px solid #333' } }), _jsx(Bar, { dataKey: "revenue", fill: "#22c55e" })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-medium", children: "Customer Analytics" }), _jsx("span", { className: "text-xs uppercase text-neutral-500", children: customers?.status })] }), _jsx("p", { className: "text-sm text-neutral-500 mt-1", children: customers?.message })] }), _jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-medium", children: "Seller Analytics" }), _jsx("span", { className: "text-xs uppercase text-neutral-500", children: sellers?.status })] }), _jsx("p", { className: "text-sm text-neutral-500 mt-1", children: sellers?.message })] })] })] }));
}
