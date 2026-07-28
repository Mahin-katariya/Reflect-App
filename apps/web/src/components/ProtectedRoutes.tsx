import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!session) {
    return <Navigate to='/login'/>
  }

  return children;
}
