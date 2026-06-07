import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PrivateRoute = () => {
  const { isAuthenticated, openAuthModal } = useAuthStore();

  if (!isAuthenticated) {
    openAuthModal();
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
