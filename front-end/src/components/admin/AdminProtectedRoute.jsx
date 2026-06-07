import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminProtectedRoute = () => {
  const location = useLocation();
  const { accessToken, isAuthenticated, user } = useAuthStore();

  if (!accessToken || !isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const isAdmin =
    user?.role === 'admin' ||
    user?.is_staff === true ||
    user?.is_superuser === true;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
