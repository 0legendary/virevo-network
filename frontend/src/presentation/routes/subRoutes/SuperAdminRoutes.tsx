import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';

// Lazy load pages
const SuperAdminDashboard = lazy(() => import('../../pages/superadmin/SuperAdminDashboard'));

const SuperAdminRoutes = () => (
  <Routes>
    <Route element={<PrivateRoutes allowedRoles={['super_admin']} />}>
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
    </Route>
  </Routes>
);

export default SuperAdminRoutes;
