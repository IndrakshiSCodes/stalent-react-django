import { createContext, useContext, useState, useCallback } from "react";
import { loginStudent as apiLoginStudent } from "../api/studentDashboard";
import { loginStartup as apiLoginStartup } from "../api/startupDashboard";

const AuthContext = createContext(null);

const STORAGE_KEY = "stalent_auth";

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth);

  const loginStudent = useCallback(async (email, password) => {
    const result = await apiLoginStudent(email, password);
    const session = { token: result.token, user: result.user, role: "student" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }, []);

  const loginStartup = useCallback(async (email, password) => {
    const result = await apiLoginStartup(email, password);
    const session = { token: result.token, user: result.user, role: "startup" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }, []);

  // Generic login used by the combined /login page, where we don't know
  // ahead of time whether this is a student or a startup account.
  // The backend tells us the role in the response, so we just trust that.
  const login = useCallback(async (email, password) => {
    const result = await apiLoginStudent(email, password);
    const role = result.user?.role === "startup" ? "startup" : "student";
    const session = { token: result.token, user: result.user, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        isStudent: auth?.role === "student",
        isStartup: auth?.role === "startup",
        login,
        loginStudent,
        loginStartup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
