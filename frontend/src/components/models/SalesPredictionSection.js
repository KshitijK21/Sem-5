import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { predictSales } from '@/services/api';
import { Card, ErrorNote, Loading, Provenance, StatusBadge } from './parts';
import { fmtMoney } from './format';
const STATES = [
    'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'ES', 'GO', 'PA', 'AM', 'RN',
];
const CATEGORIES = [
    'bed_bath_table', 'health_beauty', 'sports_leisure', 'computers_accessories',
    'furniture_decor', 'home_appliances', 'toys', 'watches_gifts', 'telephony', 'auto',
];
const DEFAULTS = {
    purchase_month: 6,
    purchase_weekday: 3,
    purchase_hour: 14,
    n_items: 1,
    customer_state: 'SP',
    product_category_name: 'bed_bath_table',
};
function validate(input) {
    const errs = {};
    if (input.purchase_month < 1 || input.purchase_month > 12)
        errs.purchase_month = 'Month must be 1–12';
    if (input.purchase_weekday < 0 || input.purchase_weekday > 6)
        errs.purchase_weekday = 'Weekday must be 0–6';
    if (input.purchase_hour < 0 || input.purchase_hour > 23)
        errs.purchase_hour = 'Hour must be 0–23';
    if (input.n_items < 1 || input.n_items > 100)
        errs.n_items = 'Items must be 1–100';
    if (input.customer_state.length !== 2)
        errs.customer_state = 'State must be a 2-letter code';
    if (!input.product_category_name.trim())
        errs.product_category_name = 'Category is required';
    return errs;
}
function NumberField({ label, value, onChange, min, max, testId, error, }) {
    return (_jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: [label, _jsx("input", { type: "number", value: value, min: min, max: max, onChange: (e) => onChange(Number(e.target.value)), className: `bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100 ${error ? 'border border-red-700' : 'border border-transparent'}`, "data-testid": testId }), error && _jsx("span", { className: "text-red-400 text-[11px]", children: error })] }));
}
export function SalesPredictionSection() {
    const [input, setInput] = useState(DEFAULTS);
    const [fieldErrors, setFieldErrors] = useState({});
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const reqId = useRef(0);
    const set = (key, value) => setInput((prev) => ({ ...prev, [key]: value }));
    const predict = async () => {
        const errs = validate(input);
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            setError('Fix the highlighted fields and try again.');
            return;
        }
        const id = ++reqId.current;
        setLoading(true);
        setError(null);
        try {
            const res = await predictSales(input);
            if (id !== reqId.current)
                return;
            setResult(res);
        }
        catch (err) {
            if (id !== reqId.current)
                return;
            setResult(null);
            setError(err instanceof Error && err.message ? err.message : 'Request failed');
        }
        finally {
            if (id === reqId.current)
                setLoading(false);
        }
    };
    const reset = () => {
        setInput(DEFAULTS);
        setFieldErrors({});
        setResult(null);
        setError(null);
    };
    const evalMae = result?.metrics?.selected != null && result.metrics.candidates
        ? result.metrics.candidates[result.metrics.selected]?.mae
        : undefined;
    return (_jsxs(Card, { testId: "sales-prediction", title: "Sales Prediction", subtitle: "Point-in-time item revenue for a single order (sklearn Pipeline)", badge: _jsx(StatusBadge, { tone: "ok", children: "model prediction" }), children: [_jsx("p", { className: "text-[11px] text-neutral-600 mb-3", children: "This model predicts from checkout features only \u2014 the shared date-range filters do not apply to it." }), _jsxs("div", { className: "flex flex-wrap items-end gap-3 bg-neutral-800/40 p-3 rounded border border-neutral-800", children: [_jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Purchase month", _jsx("select", { value: input.purchase_month, onChange: (e) => set('purchase_month', Number(e.target.value)), className: "bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100", "data-testid": "predict-month", children: Array.from({ length: 12 }, (_, i) => (_jsx("option", { value: i + 1, children: i + 1 }, i + 1))) }), fieldErrors.purchase_month && (_jsx("span", { className: "text-red-400 text-[11px]", children: fieldErrors.purchase_month }))] }), _jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Weekday (0=Sun)", _jsx("select", { value: input.purchase_weekday, onChange: (e) => set('purchase_weekday', Number(e.target.value)), className: "bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100", "data-testid": "predict-weekday", children: Array.from({ length: 7 }, (_, i) => (_jsx("option", { value: i, children: i }, i))) }), fieldErrors.purchase_weekday && (_jsx("span", { className: "text-red-400 text-[11px]", children: fieldErrors.purchase_weekday }))] }), _jsx(NumberField, { label: "Hour of day (0\u201323)", value: input.purchase_hour, onChange: (v) => set('purchase_hour', v), min: 0, max: 23, testId: "predict-hour", error: fieldErrors.purchase_hour }), _jsx(NumberField, { label: "Items in order", value: input.n_items, onChange: (v) => set('n_items', v), min: 1, max: 100, testId: "predict-items", error: fieldErrors.n_items }), _jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Customer state", _jsx("select", { value: input.customer_state, onChange: (e) => set('customer_state', e.target.value), className: "bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100", "data-testid": "predict-state", children: STATES.map((s) => (_jsx("option", { value: s, children: s }, s))) })] }), _jsxs("label", { className: "flex flex-col gap-1 text-xs text-neutral-400", children: ["Product category", _jsx("select", { value: input.product_category_name, onChange: (e) => set('product_category_name', e.target.value), className: "bg-neutral-800 rounded px-2 py-1.5 text-sm text-neutral-100", "data-testid": "predict-category", children: CATEGORIES.map((c) => (_jsx("option", { value: c, children: c }, c))) })] }), _jsx("button", { onClick: () => void predict(), disabled: loading, className: "bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded px-4 py-1.5 text-sm", "data-testid": "predict-submit", children: loading ? 'Predicting…' : 'Predict' }), _jsx("button", { onClick: reset, disabled: loading, className: "bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5 text-sm", "data-testid": "predict-reset", children: "Reset" })] }), loading && _jsx(Loading, { label: "Running sales prediction model\u2026" }), error && !loading && _jsx(ErrorNote, { message: error, testId: "predict-error" }), result && !loading && (_jsxs("div", { className: "mt-3", "data-testid": "predict-result", children: [_jsx("div", { className: "text-3xl font-semibold text-emerald-300", children: fmtMoney(result.predicted_item_revenue) }), _jsxs("div", { className: "text-xs text-neutral-500 mt-1", children: ["predicted item revenue \u00B7 currency ", result.currency, " \u00B7 ", result.model, " \u00B7", ' ', result.algorithm ?? ''] }), _jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500 mt-2", children: [_jsxs("span", { children: ["Holdout MAE:", ' ', _jsx("span", { className: "text-neutral-300", children: evalMae != null ? fmtMoney(evalMae) : '—' })] }), result.metrics.selected && (_jsxs("span", { children: ["selected model: ", result.metrics.selected] })), _jsx("span", { className: "text-neutral-600", children: "training evaluation, not this prediction" })] }), _jsx(Provenance, { filters: { date_from: '', date_to: '' }, stale: false, generatedAt: result.metadata.generated_at ?? null, extra: `status: ${result.status} · no date filter applies` })] }))] }));
}
