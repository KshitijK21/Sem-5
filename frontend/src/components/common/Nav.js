import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser, isAdmin, logout } from '@/services/auth';
const BI_LINKS = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/models', label: 'ML Models' },
    { to: '/insights', label: 'AI Insights' },
    { to: '/reports', label: 'Reports' },
];
const ADMIN_LINKS = [
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/health', label: 'System Health' },
    { to: '/admin/data', label: 'Data / ETL' },
    { to: '/admin/warehouse', label: 'Warehouse' },
    { to: '/admin/ml', label: 'ML Admin' },
    { to: '/admin/settings', label: 'Settings' },
];
export default function Nav() {
    const user = getStoredUser();
    const navigate = useNavigate();
    const signOut = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("nav", { className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-[11px] uppercase tracking-wide text-neutral-600", children: "BI" }), BI_LINKS.map((l) => (_jsx(Link, { to: l.to, children: l.label }, l.to)))] }), isAdmin() && (_jsxs("div", { className: "flex items-center gap-4 pl-4 border-l border-neutral-800", children: [_jsx("span", { className: "text-[11px] uppercase tracking-wide text-neutral-600", children: "Admin" }), ADMIN_LINKS.map((l) => (_jsx(Link, { to: l.to, children: l.label }, l.to)))] })), user ? (_jsxs("span", { className: "flex items-center gap-2 text-neutral-400", children: [_jsx("span", { className: "text-neutral-200", children: user.username }), _jsx("span", { className: "text-xs uppercase text-neutral-500", children: user.role }), _jsx("button", { onClick: signOut, className: "text-red-400 hover:text-red-300", children: "Sign out" })] })) : (_jsx(Link, { to: "/login", className: "text-blue-400", children: "Sign in" }))] }));
}
