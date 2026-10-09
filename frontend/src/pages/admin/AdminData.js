import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getEtlStatus } from '@/services/api';
export default function AdminData() {
    const [etl, setEtl] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        getEtlStatus()
            .then(setEtl)
            .catch(() => setError('Could not load ETL status.'));
    }, []);
    if (error)
        return _jsx("div", { className: "text-red-400 text-sm", children: error });
    if (!etl)
        return _jsx("div", { className: "text-neutral-400 text-sm", children: "Loading ETL status\u2026" });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "font-medium", children: "Data pipeline / ETL" }), _jsx("span", { className: `text-xs uppercase ${etl.loaded ? 'text-emerald-400' : 'text-amber-400'}`, children: etl.loaded ? 'loaded' : 'not loaded' })] }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "text-neutral-500 text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-1", children: "Table" }), _jsx("th", { className: "text-right py-1", children: "Rows" })] }) }), _jsx("tbody", { children: Object.entries(etl.tables).map(([table, count]) => (_jsxs("tr", { className: "border-t border-neutral-800", children: [_jsx("td", { className: "py-1", children: table }), _jsx("td", { className: "py-1 text-right", children: count == null ? '—' : count.toLocaleString() })] }, table))) })] }), _jsxs("div", { className: "text-xs text-neutral-500 mt-3", children: ["Source dataset: ", etl.olist_dir] })] }), _jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500", children: ["Status only \u2014 re-running the pipeline is an offline operation:", ' ', _jsx("code", { className: "text-neutral-300", children: "python -m app.services.etl" })] })] }));
}
