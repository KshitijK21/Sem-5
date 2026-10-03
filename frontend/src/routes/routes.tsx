import { createBrowserRouter, Navigate } from 'react-router-dom'
import Landing from '@/pages/Landing'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])
