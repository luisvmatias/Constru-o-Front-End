import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>Carregando...</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/' />;
  }

  return children;
}
