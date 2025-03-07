import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import SuperAdminRoutes from './subRoutes/SuperAdminRoutes';
import AdminRoutes from './subRoutes/AdminRoutes';
import UserRoutes from './subRoutes/UserRoutes';
import PublicRoutes from './subRoutes/PublicRoutes';
import UserHeader from '../pages/layout/user/UserHeader';
import UserRedirects from '../pages/layout/user/UserRedirects';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/redux/store';
import { handleFetchUser } from '@/infrastructure/redux/slices/authSlice';

// Lazy load auth pages
const Authentication = lazy(() => import('../pages/auth/Authentication'));
const NotFound = lazy(() => import('../pages/error/NotFound'));
const Unauthorized = lazy(() => import('../pages/error/Unauthorized'));

const UserLayout = () => {
  return (
    <div className="flex flex-col overflow-hidden h-screen">
      <UserHeader />
      <main className="flex-1 content-wrapper overflow-auto">
        <Outlet />
      </main>
      {/* <UserRedirects /> */}
    </div>
  );
};


const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currUser, currUserID } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!currUser && currUserID) {
      dispatch(handleFetchUser(currUserID));
    }
  }, [currUser, currUserID, dispatch]);

  return (
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
};
export default AppRoutes;
