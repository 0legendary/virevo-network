import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';

// Lazy load pages
const UserDashboard = lazy(() => import('../../pages/user/UserDashboard'));

const UserRoutes = () => (
  <Routes>
    <Route element={<PrivateRoutes allowedRoles={['user']} />}>
      <Route path="/user/dashboard" element={<UserDashboard />} />
    </Route>
  </Routes>
);

export default UserRoutes;
