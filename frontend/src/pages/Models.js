import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ModelRegistry } from '@/components/models/ModelRegistry';
import { ForecastSection } from '@/components/models/ForecastSection';
import { SegmentationSection } from '@/components/models/SegmentationSection';
import { AnomalySection } from '@/components/models/AnomalySection';
import { SalesPredictionSection } from '@/components/models/SalesPredictionSection';
const EMPTY = { date_from: '', date_to: '' };
export default function Models() {
    const [filters, setFilters] = useState(EMPTY);
    const [draft, setDraft] = useState(EMPTY);
    const apply = () => setFilters({ date_from: draft.date_from ?? '', date_to: draft.date_to ?? '' });
    const reset = () => {
        setDraft(EMPTY);
        setFilters(EMPTY);
    };
    const filterLabel = filters.date_from || filters.date_to
        ? `${filters.date_from || 'start'} → ${filters.date_to || 'latest'}`
        : 'all available dates';
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "ML Models" }), _jsx("p", { className: "text-sm text-neutral-500", children: "Live inference over the Olist warehouse \u2014 every result below is produced by a trained model artifact on request, never by static placeholders." })] }), _jsxs("div", { className: "flex flex-wrap items-end gap-3 bg-neutral-900/60 p-4 rounded-lg border border-neutral-800", children: [_jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Date from", _jsx("input", { type: "date", value: draft.date_from ?? '', onChange: (e) => setDraft({ ...draft, date_from: e.target.value }), className: "bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100", "data-testid": "ml-date-from" })] }), _jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Date to", _jsx("input", { type: "date", value: draft.date_to ?? '', onChange: (e) => setDraft({ ...draft, date_to: e.target.value }), className: "bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100", "data-testid": "ml-date-to" })] }), _jsx("button", { onClick: apply, className: "bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 text-sm", "data-testid": "ml-apply-filters", children: "Apply" }), _jsx("button", { onClick: reset, className: "bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5 text-sm", "data-testid": "ml-reset-filters", children: "Reset" }), _jsxs("span", { className: "text-xs text-neutral-500 ml-auto", "data-testid": "ml-active-filters", children: ["Active: ", filterLabel, " \u00B7 applies to forecasts, segments, and anomalies (not sales prediction)"] })] }), _jsx(ModelRegistry, {}), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [_jsx(ForecastSection, { target: "orders", filters: filters }), _jsx(ForecastSection, { target: "revenue", filters: filters })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [_jsx(SegmentationSection, { kind: "customers", filters: filters }), _jsx(SegmentationSection, { kind: "products", filters: filters })] }), _jsx(SalesPredictionSection, {}), _jsx(AnomalySection, { filters: filters })] }));
}
