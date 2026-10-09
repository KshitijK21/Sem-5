import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from 'react-router-dom';
const TABS = [
    { to: '/admin/users', label: 'User Management' },
    { to: '/admin/health', label: 'System Health' },
    { to: '/admin/data', label: 'Data / ETL' },
    { to: '/admin/warehouse', label: 'Warehouse' },
    { to: '/admin/ml', label: 'ML Administration' },
    { to: '/admin/settings', label: 'System Settings' },
];
export default function AdminLayout() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-neutral-500", children: "Administration" }), _jsx("h1", { className: "text-2xl font-semibold", children: "Platform Administration" })] }), _jsx("nav", { className: "flex flex-wrap gap-1 border-b border-neutral-800", children: TABS.map((t) => (_jsx(NavLink, { to: t.to, className: ({ isActive }) => `px-3 py-2 text-sm rounded-t border-b-2 -mb-px ${isActive
                        ? 'border-blue-500 text-neutral-100'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300'}`, children: t.label }, t.to))) }), _jsx(Outlet, {})] }));
}
