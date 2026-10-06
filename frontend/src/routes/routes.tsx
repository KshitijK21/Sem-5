import { createBrowserRouter, Navigate } from 'react-router-dom'
import Landing from '@/pages/Landing'
import AppLayout from '@/components/layout/AppLayout'
import RequireAuth from '@/components/RequireAuth'
import RequireAdmin from '@/components/RequireAdmin'
import AdminLayout from '@/components/layout/AdminLayout'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/pages/Login')).default }),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
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
            element: <RequireAdmin />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  {
                    path: '/admin',
                    element: <Navigate to="/admin/users" replace />,
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
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
])
