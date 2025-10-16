import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/inicio-sesion" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;