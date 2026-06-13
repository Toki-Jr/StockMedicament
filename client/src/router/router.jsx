import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { PrivateRoute } from './PrivateRoute';
import AppLayout     from '../components/layout/AppLayout';
import LoginPage     from '../pages/LoginPage';
import RegisterPage  from '../pages/RegisterPage';
import OtpPage from '../pages/OtpPages';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import LandingPage from '../pages/LandingPage';

// // Chargement à la demande (lazy)
const MedicamentsPage     = lazy(() => import('../pages/MedicamentPage'));
const LotsPage        = lazy(() => import('../pages/LotsPage'));
const MouvementsPage  = lazy(() => import('../pages/MouvementPage'));
const CommandesPage   = lazy(() => import('../pages/CommandesPage'));
const AlertesPage     = lazy(() => import('../pages/AlertesPage'));
const Users           = lazy(() => import('../pages/UserPages'))
const HistoriquePage  = lazy(() => import('../pages/HistoriquePage'));
const ProfilePage     = lazy(() => import('../pages/ProfilePage'));
const SettingsPage    = lazy(() => import('../pages/SettingPages'));
const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ fontSize: 32 }}>...Chargement...</div>
  </div>
);

const router = createBrowserRouter([

  // ── Routes publiques ──────────────────────────────────────────
  { path: '/',    element: <LandingPage /> },
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/otp', element: <OtpPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // ── Routes protégées avec Layout ─────────────────────────────
  {
    element: <PrivateRoute />,       // vérifie isAuthenticated
    children: [
      {
        element: <AppLayout />,      // Sidebar + Navbar + <Outlet />
        children: [
          // { path: '/',          element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/alertes',   element: <Suspense fallback={<Loader />}><AlertesPage /></Suspense> },

          // ── Pharmacien + Admin uniquement ──
          {
            element: <PrivateRoute roles={['admin', 'pharmacien', 'user']} />,
            children: [
              { path: '/medicaments', element: <Suspense fallback={<Loader />}><MedicamentsPage/></Suspense>},
              { path: '/lots',        element: <Suspense fallback={<Loader />}><LotsPage /></Suspense> },
              { path: '/mouvements',  element: <Suspense fallback={<Loader />}><MouvementsPage /></Suspense> },
              { path: '/users',       element: <Suspense fallback={<Loader />}><Users /></Suspense> },
              { path: '/commandes',   element: <Suspense fallback={<Loader />}><CommandesPage /></Suspense> },
              { path: '/history',     element: <Suspense fallback={<Loader />}><HistoriquePage /></Suspense> },
              { path: '/profil',      element: <Suspense fallback={<Loader />}><ProfilePage /></Suspense> },
              { path: '/parametres',  element: <Suspense fallback={<Loader />}><SettingsPage /></Suspense> },
            ],
          },
        ],
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;