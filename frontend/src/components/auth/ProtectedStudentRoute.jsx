import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedStudentRoute({ children }) {
  const { isStudent } = useAuth();
  const location = useLocation();

  if (!isStudent) {
    return <Navigate to="/login/student" state={{ from: location }} replace />;
  }

  return children;
}
