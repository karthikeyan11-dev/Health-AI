import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/app/layouts';
import { DashboardPage } from '@/pages/dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
