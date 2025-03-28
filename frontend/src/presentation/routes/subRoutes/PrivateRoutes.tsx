import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoutes = ({ allowedRoles }: PrivateRouteProps) => {
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(userRole || '')) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default PrivateRoutes;
