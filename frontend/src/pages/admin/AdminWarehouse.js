import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getWarehouseStatus } from '@/services/api';
export default function AdminWarehouse() {
    const [wh, setWh] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        getWarehouseStatus()
            .then(setWh)
            .catch(() => setError('Could not load warehouse status.'));
    }, []);
    if (error)
        return _jsx("div", { className: "text-red-400 text-sm", children: error });
    if (!wh)
        return _jsx("div", { className: "text-neutral-400 text-sm", children: "Loading warehouse status\u2026" });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "font-medium", children: "Warehouse" }), _jsx("span", { className: `text-xs uppercase ${wh.complete ? 'text-emerald-400' : 'text-amber-400'}`, children: wh.complete ? 'complete' : `${wh.loaded_tables}/${wh.expected_tables} tables` })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Engine" }), wh.dialect] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Tables loaded" }), wh.loaded_tables, " / ", wh.expected_tables] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Rows" }), wh.total_rows.toLocaleString()] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Schema objects" }), wh.schema_tables.length] })] }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "text-neutral-500 text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-1", children: "Warehouse table" }), _jsx("th", { className: "text-right py-1", children: "Rows" })] }) }), _jsx("tbody", { children: Object.entries(wh.warehouse_tables).map(([table, count]) => (_jsxs("tr", { className: "border-t border-neutral-800", children: [_jsx("td", { className: "py-1", children: table }), _jsx("td", { className: "py-1 text-right", children: count == null ? '—' : count.toLocaleString() })] }, table))) })] })] }), _jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500", children: ["Schema objects: ", wh.schema_tables.join(', ') || 'none', _jsxs("div", { className: "mt-1", children: ["Source dataset: ", wh.source] })] })] }));
}
