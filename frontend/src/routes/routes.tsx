import { createBrowserRouter, Navigate } from 'react-router-dom'
import Landing from '@/pages/Landing'
import AppLayout from '@/components/layout/AppLayout'
import RequireAuth from '@/components/RequireAuth'

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
            path: '/admin',
            lazy: async () => ({ Component: (await import('@/pages/Admin')).default }),
          },
          {
            path: '/insights',
            lazy: async () => ({ Component: (await import('@/pages/Insights')).default }),
          },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
])
