import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { downloadReport } from '@/services/api';
import { getStoredUser } from '@/services/auth';
const REPORTS = [
    { name: 'kpis', label: 'KPIs', minRole: 'Both roles' },
    { name: 'orders_by_status', label: 'Orders by Status', minRole: 'Both roles' },
    { name: 'monthly_revenue', label: 'Monthly Revenue', minRole: 'Both roles' },
    { name: 'revenue_by_category', label: 'Revenue by Category', minRole: 'Both roles' },
];
export default function Reports() {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [error, setError] = useState(null);
    const user = getStoredUser();
    const run = async (report) => {
        setError(null);
        try {
            const params = {};
            if (dateFrom)
                params.date_from = dateFrom;
            if (dateTo)
                params.date_to = dateTo;
            await downloadReport(report, params);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-3xl", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Reports" }), _jsx("p", { className: "text-sm text-neutral-500", children: "Export warehouse data as CSV. All reports are available to both roles (admin and analyst)." })] }), _jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [_jsxs("label", { className: "flex flex-col gap-1", children: ["Date from (optional)", _jsx("input", { type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: "bg-neutral-800 rounded px-3 py-1.5" })] }), _jsxs("label", { className: "flex flex-col gap-1", children: ["Date to (optional)", _jsx("input", { type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value), className: "bg-neutral-800 rounded px-3 py-1.5" })] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: REPORTS.map((r) => (_jsxs("button", { onClick: () => run(r.name), className: "bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 text-sm text-left", children: [_jsx("div", { className: "font-medium", children: r.label }), _jsxs("div", { className: "text-xs text-blue-100/70", children: [r.minRole, "+"] })] }, r.name))) }), user && (_jsxs("div", { className: "text-xs text-neutral-500", children: ["Signed in as ", _jsx("span", { className: "text-neutral-300", children: user.username }), " (", user.role, ")"] })), error && _jsx("div", { className: "text-sm text-red-400", children: error })] }), _jsx("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-400", children: "CSV export uses the same verified warehouse aggregates as the dashboards. No fabricated values are written." })] }));
}
