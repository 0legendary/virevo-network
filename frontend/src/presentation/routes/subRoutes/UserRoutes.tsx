import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';

// Lazy load pages
const UserDashboard = lazy(() => import('../../pages/user/UserDashboard'));
const ChatPage = lazy(() => import('../../pages/user/UserChat/ChatPage'));


const UserRoutes = () => (
  <Routes>
    <Route element={<PrivateRoutes allowedRoles={['user']} />}>
      <Route path="" element={<UserDashboard />} />
      <Route path="chat" element={<ChatPage />} />
    </Route>
  </Routes>
);

export default UserRoutes;
