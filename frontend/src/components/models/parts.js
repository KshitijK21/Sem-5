import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatTimestamp } from './format';
export function Card({ title, subtitle, badge, actions, children, testId, }) {
    return (_jsxs("div", { className: "bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", "data-testid": testId, children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2 mb-1", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-medium", children: title }), subtitle && _jsx("p", { className: "text-xs text-neutral-500 mt-0.5", children: subtitle })] }), _jsxs("div", { className: "flex items-center gap-2", children: [badge, actions] })] }), children] }));
}
export function StatusBadge({ tone, children, }) {
    const cls = tone === 'ok'
        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-800'
        : tone === 'warn'
            ? 'bg-amber-900/60 text-amber-300 border-amber-800'
            : tone === 'error'
                ? 'bg-red-900/60 text-red-300 border-red-800'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700';
    return (_jsx("span", { className: `text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 ${cls}`, children: children }));
}
export function Loading({ label = 'Running model…' }) {
    return (_jsxs("div", { className: "flex items-center gap-2 text-sm text-neutral-400 py-6", role: "status", children: [_jsx("span", { className: "inline-block h-3.5 w-3.5 rounded-full border-2 border-neutral-600 border-t-neutral-200 animate-spin" }), label] }));
}
export function ErrorNote({ message, testId = 'error' }) {
    return (_jsx("div", { className: "text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2 my-2", "data-testid": testId, role: "alert", children: message }));
}
export function EmptyNote({ message, testId = 'empty' }) {
    return (_jsx("div", { className: "text-sm text-neutral-400 bg-neutral-800/50 border border-neutral-700 rounded px-3 py-2 my-2", "data-testid": testId, children: message }));
}
/** Provenance footer: which filters produced this result and when it was generated. */
export function Provenance({ filters, stale, generatedAt, extra, }) {
    const range = filters?.date_from || filters?.date_to
        ? `${filters.date_from || 'start'} → ${filters.date_to || 'latest'}`
        : 'all available dates';
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 mt-2", children: [_jsxs("span", { "data-testid": "applied-filters", children: ["Filters: ", range] }), generatedAt && _jsxs("span", { children: ["Generated: ", formatTimestamp(generatedAt)] }), extra && _jsx("span", { children: extra }), stale && (_jsx("span", { className: "text-amber-400", "data-testid": "stale", children: "Filters changed \u2014 updating\u2026" }))] }));
}
