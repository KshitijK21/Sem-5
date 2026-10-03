import { createBrowserRouter, Navigate } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import AppLayout from '@/components/layout/AppLayout'
import RequireAuth from '@/components/RequireAuth'
import Dashboard from '@/pages/Dashboard'
import Analytics from '@/pages/Analytics'
import Models from '@/pages/Models'
import Reports from '@/pages/Reports'
import Admin from '@/pages/Admin'
import Insights from '@/pages/Insights'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/analytics', element: <Analytics /> },
          { path: '/models', element: <Models /> },
          { path: '/reports', element: <Reports /> },
          { path: '/admin', element: <Admin /> },
          { path: '/insights', element: <Insights /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
])
