import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }: { children: import("react").ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  // If user is logged in but not an admin, redirect to home
  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, they will see the login screen in Dashboard.tsx
  return <>{children}</>;
}
