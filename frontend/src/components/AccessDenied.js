import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export default function AccessDenied({ section }) {
    return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsxs("div", { className: "max-w-md text-center space-y-3", children: [_jsx("div", { className: "text-4xl font-semibold tracking-tight", children: "Access Restricted" }), _jsx("p", { className: "text-neutral-400", children: "You do not have permission to access this area." }), _jsx("p", { className: "text-sm text-neutral-500", children: section ? `${section} is available only to Administrators.` : 'This section is available only to Administrators.' }), _jsx(Link, { to: "/dashboard", className: "inline-block mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium", children: "Back to Dashboard" })] }) }));
}
