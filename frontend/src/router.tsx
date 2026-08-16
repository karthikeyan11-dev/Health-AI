import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout, PatientLayout } from '@/app/layouts';
import { RegisterPage, VerifyOtpPage, LoginPage } from '@/pages/auth';
import { OverviewPage, ProfilePage } from '@/pages/patient';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'verify-otp',
        element: <VerifyOtpPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        element: <PatientLayout />,
        children: [
          {
            path: 'dashboard',
            element: <OverviewPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
      {
        path: 'users',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'admin/*',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
