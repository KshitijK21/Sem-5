import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, isAuthRequired } from '@/services/auth';
export default function RequireAuth() {
    const location = useLocation();
    if (isAuthRequired() && !getToken()) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
    }
    return _jsx(Outlet, {});
}
