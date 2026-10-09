import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { queryInsights } from '@/services/api';
const EXAMPLES = [
    'What is the total revenue and average order value?',
    'How many unique customers and orders are there?',
    'What is the average review score and delivery time?',
];
export default function Insights() {
    const [question, setQuestion] = useState(EXAMPLES[0]);
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const ask = async (q) => {
        setBusy(true);
        setError(null);
        try {
            const r = await queryInsights(q);
            setResult(r);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Request failed');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-3xl", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "AI Business Insights" }), _jsx("p", { className: "text-sm text-neutral-500", children: "Answers are grounded strictly in warehouse data via controlled tools. If no LLM is configured, a deterministic data summary is returned." })] }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    ask(question);
                }, className: "space-y-3", children: [_jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value), rows: 3, className: "w-full bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-sm", placeholder: "Ask about KPIs, categories, orders, or model status\u2026" }), _jsx("div", { className: "flex flex-wrap gap-2", children: EXAMPLES.map((ex) => (_jsx("button", { type: "button", onClick: () => {
                                setQuestion(ex);
                                ask(ex);
                            }, className: "text-xs bg-neutral-800 hover:bg-neutral-700 rounded px-2 py-1", children: ex }, ex))) }), _jsx("button", { type: "submit", disabled: busy || !question.trim(), className: "bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-4 py-2 text-sm font-medium", children: busy ? 'Thinking…' : 'Ask' })] }), error && _jsx("div", { className: "text-red-400 text-sm", children: error }), result && (_jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-xs", children: [_jsxs("span", { className: "uppercase text-neutral-500", children: ["status: ", result.status] }), result.provider && _jsxs("span", { className: "text-neutral-500", children: ["provider: ", result.provider] }), _jsxs("span", { className: "text-neutral-500", children: ["role: ", result.role] })] }), _jsx("pre", { className: "whitespace-pre-wrap text-sm", children: result.answer }), result.sources.length > 0 && (_jsxs("div", { className: "text-xs text-neutral-500", children: ["Sources: ", result.sources.join(', ')] }))] }))] }));
}
