import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Unlike ProtectedStudentRoute/ProtectedStartupRoute, this only requires
 * being logged in as *some* role — used for pages either side can view,
 * like another user's public profile.
 */
export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
