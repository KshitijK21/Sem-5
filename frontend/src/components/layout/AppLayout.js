import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import Nav from '@/components/common/Nav';
export default function AppLayout() {
    return (_jsxs("div", { className: "min-h-screen bg-neutral-950 text-neutral-100", children: [_jsx("header", { className: "border-b border-neutral-800", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-3 flex items-center justify-between", children: [_jsx("div", { className: "font-semibold", children: "Sem5 BI" }), _jsx(Nav, {})] }) }), _jsx("main", { className: "mx-auto max-w-7xl px-4 py-6", children: _jsx(Outlet, {}) })] }));
}
