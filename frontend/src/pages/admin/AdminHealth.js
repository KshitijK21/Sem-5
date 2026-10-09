import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getSystemStatus } from '@/services/api';
export default function AdminHealth() {
    const [system, setSystem] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        getSystemStatus()
            .then(setSystem)
            .catch(() => setError('Could not load system health.'));
    }, []);
    if (error)
        return _jsx("div", { className: "text-red-400 text-sm", children: error });
    if (!system)
        return _jsx("div", { className: "text-neutral-400 text-sm", children: "Loading system health\u2026" });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4", children: [_jsx("h2", { className: "font-medium mb-3", children: "System" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "App" }), system.app, " v", system.version] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Env" }), system.env] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Database" }), system.database] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Auth required" }), String(system.auth_required)] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Python" }), system.python] }), _jsxs("div", { className: "col-span-2", children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Platform" }), system.platform] }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-500 text-xs uppercase", children: "Uptime" }), Math.round(system.uptime_seconds), "s"] })] })] }), _jsx("div", { className: "bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500", children: "Secrets (JWT signing key, database credentials, environment values) are deliberately not exposed here." })] }));
}
