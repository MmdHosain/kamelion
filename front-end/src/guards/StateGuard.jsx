import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const StateGuard = ({ condition, fallbackPath = '/', onFail }) => {
  const store = useAuthStore();

  const shouldAllow = typeof condition === 'function' ? condition(store) : condition;

  if (!shouldAllow) {
    if (onFail) onFail();
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default StateGuard;
