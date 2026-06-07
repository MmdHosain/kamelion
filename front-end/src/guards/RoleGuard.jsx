import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RoleGuard = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, openAuthModal } = useAuthStore();

  if (!isAuthenticated) {
    openAuthModal();
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
