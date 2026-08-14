import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedStartupRoute({ children }) {
  const { isStartup } = useAuth();
  const location = useLocation();

  if (!isStartup) {
    return <Navigate to="/login/startup" state={{ from: location }} replace />;
  }

  return children;
}
