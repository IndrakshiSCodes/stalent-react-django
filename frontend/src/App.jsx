import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedStudentRoute from "./components/auth/ProtectedStudentRoute";
import ProtectedStartupRoute from "./components/auth/ProtectedStartupRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentLogin from "./pages/StudentLogin";
import StartupLogin from "./pages/StartupLogin";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StartupDashboard from "./pages/StartupDashboard";
import StudentPublicProfile from "./pages/StudentPublicProfile";
import StartupPublicProfile from "./pages/StartupPublicProfile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/startup" element={<StartupLogin />} />

        {/* Protected student route */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedStudentRoute>
              <StudentDashboard />
            </ProtectedStudentRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedStudentRoute>
              <StudentProfile />
            </ProtectedStudentRoute>
          }
        />

        {/* Protected startup route */}
        <Route
          path="/startup/dashboard"
          element={
            <ProtectedStartupRoute>
              <StartupDashboard />
            </ProtectedStartupRoute>
          }
        />

        {/* Public profiles — either role can view either, once logged in */}
        <Route
          path="/profile/student/:studentId"
          element={
            <ProtectedRoute>
              <StudentPublicProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/startup/:startupId"
          element={
            <ProtectedRoute>
              <StartupPublicProfile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;
