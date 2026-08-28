import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminProtectedRoute = () => {
  const location = useLocation();
  const { accessToken, isAuthenticated, user } = useAuthStore();

  const isAdmin =
    user?.role === 'admin' ||
    user?.is_staff === true ||
    user?.is_superuser === true;

  if (!accessToken || !isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
