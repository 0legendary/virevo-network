import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import SuperAdminRoutes from './subRoutes/SuperAdminRoutes';
import AdminRoutes from './subRoutes/AdminRoutes';
import UserRoutes from './subRoutes/UserRoutes';
import PublicRoutes from './subRoutes/PublicRoutes';
import UserHeader from '../pages/layout/user/UserHeader';
import UserRedirects from '../pages/layout/user/UserRedirects';

// Lazy load auth pages
const Authentication = lazy(() => import('../pages/auth/Authentication'));
const NotFound = lazy(() => import('../pages/error/NotFound'));
const Unauthorized = lazy(() => import('../pages/error/Unauthorized'));

const UserLayout = () => {
  return (
    <>
      <UserHeader />
      <main className='pt-18 transition-colors duration-300'>
        <Outlet />
      </main>
      <UserRedirects />
    </>
  );
};

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {/* Public Routes (For Unauthenticated Users) */}
      <Route element={<PublicRoutes />}>
        <Route path="/auth" element={<Authentication />} />
      </Route>

      {/* Role-Based Routes */}
      <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route element={<UserLayout />}>
        <Route path="/*" element={<UserRoutes />} />
      </Route>

      {/* Common Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
