import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { getForecast } from '@/services/api';
import { useMlSection } from './useMlSection';
import { Card, ErrorNote, Loading, Provenance, StatusBadge } from './parts';
import { fmtInt, fmtMoneyShort } from './format';
const HORIZONS = [7, 14, 30, 60, 90];
export function ForecastSection({ target, filters }) {
    const [periods, setPeriods] = useState(30);
    const section = useMlSection((f) => getForecast({ ...f, periods, target }), filters);
    const { status, data, error, appliedFilters, stale, run } = section;
    // refetch when the horizon changes (only after the section has run before)
    const prevPeriods = useRef(periods);
    const started = status !== 'idle';
    useEffect(() => {
        if (prevPeriods.current === periods)
            return;
        prevPeriods.current = periods;
        if (started)
            void run();
    }, [periods, started, run]);
    const isMoney = target === 'revenue';
    const title = isMoney ? 'Revenue Forecast' : 'Order Forecast';
    const unit = isMoney ? 'BRL' : 'orders';
    const fmtValue = isMoney ? fmtMoneyShort : fmtInt;
    const chart = data
        ? [
            ...data.history_tail.map((p) => ({ date: p.date, history: p.value })),
            ...data.forecast.map((p) => ({ date: p.date, forecast: p.value })),
        ]
        : [];
    const evalMae = data?.metrics?.model?.mae;
    const baseMae = data?.metrics?.seasonal_naive_baseline?.mae;
    return (_jsxs(Card, { testId: `forecast-${target}`, title: title, subtitle: data
            ? `${data.model} · ${data.algorithm ?? ''} — recursive multi-step forecast of ${unit}`
            : `Model prediction of ${unit} beyond the last observed date`, badge: _jsx(StatusBadge, { tone: "ok", children: "model prediction" }), actions: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "text-xs text-neutral-400 flex items-center gap-1.5", children: ["Horizon (days)", _jsx("select", { value: periods, onChange: (e) => setPeriods(Number(e.target.value)), className: "bg-neutral-800 rounded px-2 py-1 text-sm text-neutral-100", "data-testid": `horizon-${target}`, children: HORIZONS.map((h) => (_jsx("option", { value: h, children: h }, h))) })] }), _jsx("button", { onClick: () => void run(), disabled: status === 'loading', className: "bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded px-3 py-1.5 text-sm", "data-testid": `forecast-run-${target}`, children: status === 'loading' ? 'Running model…' : 'Run forecast' })] }), children: [status === 'loading' && !data && _jsx(Loading, { label: "Running forecast model\u2026" }), status === 'error' && error && _jsx(ErrorNote, { message: error, testId: `forecast-error-${target}` }), data && (_jsxs("div", { "data-testid": `forecast-result-${target}`, children: [_jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300 my-2", children: [_jsxs("span", { children: ["History: ", _jsxs("span", { className: "text-neutral-400", children: [fmtInt(data.metadata.n_history_days), " days"] })] }), _jsxs("span", { children: ["Forecast: ", _jsxs("span", { className: "text-neutral-400", children: [data.periods, " days \u2192 ", data.forecast[0]?.date.slice(0, 10), " \u2026 ", data.forecast[data.forecast.length - 1]?.date.slice(0, 10)] })] }), _jsxs("span", { children: ["Last value: ", _jsx("span", { className: "text-neutral-400", children: fmtValue(data.history_tail[data.history_tail.length - 1]?.value ?? 0) })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(LineChart, { data: chart, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#262626" }), _jsx(XAxis, { dataKey: "date", stroke: "#666", fontSize: 10, tickFormatter: (v) => v.slice(5) }), _jsx(YAxis, { stroke: "#666", fontSize: 11, tickFormatter: (v) => (isMoney ? `${Math.round(v / 1000)}k` : fmtInt(v)) }), _jsx(Tooltip, { contentStyle: { background: '#171717', border: '1px solid #333' }, formatter: (v) => [fmtValue(v), ''] }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "history", name: "Observed", stroke: "#3b82f6", strokeWidth: 2, dot: false, connectNulls: false, isAnimationActive: false }), _jsx(Line, { type: "monotone", dataKey: "forecast", name: `Forecast (${unit})`, stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "5 4", dot: false, connectNulls: false, isAnimationActive: false })] }) }), _jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500 mt-2", children: [_jsxs("span", { children: ["Holdout MAE (model): ", _jsx("span", { className: "text-neutral-300", children: evalMae != null ? fmtValue(evalMae) : '—' })] }), _jsxs("span", { children: ["Baseline MAE (seasonal naive): ", _jsx("span", { className: "text-neutral-300", children: baseMae != null ? fmtValue(baseMae) : '—' })] }), _jsx("span", { className: "text-neutral-600", children: "training evaluation, not this forecast" })] }), _jsx(Provenance, { filters: appliedFilters, stale: stale, generatedAt: data.metadata.generated_at ?? null, extra: `status: ${data.status}` })] }))] }));
}
