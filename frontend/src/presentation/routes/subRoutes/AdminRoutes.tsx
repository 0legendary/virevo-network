import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';

// Lazy load pages
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));

const AdminRoutes = () => (
  <Routes>
    <Route element={<PrivateRoutes allowedRoles={['admin']} />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
