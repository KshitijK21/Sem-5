import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const features = [
    {
        title: 'Data warehouse',
        body: 'Star schema, ETL pipeline and verified KPIs built on the Olist Brazilian E-Commerce dataset.',
    },
    {
        title: 'ML models',
        body: 'Sales forecasting, sales prediction, customer and product segmentation, and anomaly detection.',
    },
    {
        title: 'AI assistant',
        body: 'Natural-language insights over your own data, served by a local LLM through Ollama.',
    },
];
export default function Landing() {
    return (_jsx("div", { className: "min-h-screen bg-neutral-950 text-neutral-100", children: _jsxs("div", { className: "max-w-4xl mx-auto px-6 py-20", children: [_jsxs("header", { className: "text-center", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold tracking-tight", children: "AI-Powered Business Intelligence & Predictive Analytics Platform" }), _jsx("p", { className: "text-neutral-400 mt-4", children: "Semester 5 project integrating AI, Data Warehousing & Mining, and Software Engineering. Uses Olist Brazilian E-Commerce dataset." }), _jsx(Link, { to: "/login", className: "inline-block mt-8 px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium", children: "Sign in to open the dashboard" }), _jsxs("p", { className: "text-xs text-neutral-500 mt-4", children: ["Demo accounts: ", _jsx("span", { className: "text-neutral-400", children: "admin / admin123" }), " (business intelligence + platform administration) \u00B7", ' ', _jsx("span", { className: "text-neutral-400", children: "analyst / analyst123" }), " (business intelligence)"] })] }), _jsx("section", { className: "grid gap-4 md:grid-cols-3 mt-16", children: features.map((f) => (_jsxs("div", { className: "rounded-lg border border-neutral-800 bg-neutral-900/60 p-5", children: [_jsx("h2", { className: "font-semibold", children: f.title }), _jsx("p", { className: "text-sm text-neutral-400 mt-2", children: f.body })] }, f.title))) }), _jsx("p", { className: "text-center text-xs text-neutral-500 mt-16", children: "Status: complete \u2014 warehouse, ML models and AI assistant are integrated and running." })] }) }));
}
