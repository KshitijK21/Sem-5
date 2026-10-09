import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/RequireAuth';
import RequireAdmin from '@/components/RequireAdmin';
import AdminLayout from '@/components/layout/AdminLayout';
export const router = createBrowserRouter([
    { path: '/', element: _jsx(Landing, {}) },
    {
        path: '/login',
        lazy: async () => ({ Component: (await import('@/pages/Login')).default }),
    },
    {
        element: _jsx(RequireAuth, {}),
        children: [
            {
                element: _jsx(AppLayout, {}),
                children: [
                    // ---- Business intelligence (admin + analyst) ----
                    {
                        path: '/dashboard',
                        lazy: async () => ({ Component: (await import('@/pages/Dashboard')).default }),
                    },
                    {
                        path: '/analytics',
                        lazy: async () => ({ Component: (await import('@/pages/Analytics')).default }),
                    },
                    {
                        path: '/models',
                        lazy: async () => ({ Component: (await import('@/pages/Models')).default }),
                    },
                    {
                        path: '/reports',
                        lazy: async () => ({ Component: (await import('@/pages/Reports')).default }),
                    },
                    {
                        path: '/insights',
                        lazy: async () => ({ Component: (await import('@/pages/Insights')).default }),
                    },
                    // ---- Platform administration (admin only) ----
                    {
                        element: _jsx(RequireAdmin, {}),
                        children: [
                            {
                                element: _jsx(AdminLayout, {}),
                                children: [
                                    {
                                        path: '/admin',
                                        element: _jsx(Navigate, { to: "/admin/users", replace: true }),
                                    },
                                    {
                                        path: '/admin/users',
                                        lazy: async () => ({
                                            Component: (await import('@/pages/admin/AdminUsers')).default,
                                        }),
                                    },
                                    {
                                        path: '/admin/health',
                                        lazy: async () => ({
                                            Component: (await import('@/pages/admin/AdminHealth')).default,
                                        }),
                                    },
                                    {
                                        path: '/admin/data',
                                        lazy: async () => ({
                                            Component: (await import('@/pages/admin/AdminData')).default,
                                        }),
                                    },
                                    {
                                        path: '/admin/warehouse',
                                        lazy: async () => ({
                                            Component: (await import('@/pages/admin/AdminWarehouse')).default,
                                        }),
                                    },
                                    {
                                        path: '/admin/ml',
                                        lazy: async () => ({
                                            Component: (await import('@/pages/admin/AdminMl')).default,
                                        }),
                                    },
                                    {
                                        path: '/admin/settings',
                                        lazy: async () => ({
                                            Component: (await import('@/pages/admin/AdminSettings')).default,
                                        }),
                                    },
                                ],
                            },
                        ],
                    },
                    { path: '*', element: _jsx(Navigate, { to: "/dashboard", replace: true }) },
                ],
            },
        ],
    },
]);
