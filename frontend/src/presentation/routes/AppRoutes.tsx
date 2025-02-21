import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SuperAdminRoutes from './subRoutes/SuperAdminRoutes';
import AdminRoutes from './subRoutes/AdminRoutes';
import UserRoutes from './subRoutes/UserRoutes';
import PublicRoutes from './subRoutes/PublicRoutes';

// Lazy load auth pages
const Login = lazy(() => import('../pages/auth/Authentication'));
const NotFound = lazy(() => import('../pages/error/NotFound'));
const Unauthorized = lazy(() => import('../pages/error/Unauthorized'));

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {/* Public Routes (For Unauthenticated Users) */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Role-Based Routes */}
      <Route path="/*" element={<SuperAdminRoutes />} />
      <Route path="/*" element={<AdminRoutes />} />
      <Route path="/*" element={<UserRoutes />} />

      {/* Common Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
