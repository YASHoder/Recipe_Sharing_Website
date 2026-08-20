import { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { api, setToken } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("tt_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { token, user: u } = await api.post("/auth/login", { email, password });
      setToken(token);
      setUser(u);
      return true;
    } catch (err) {
      return err.message || false;
    }
  };

  // ── REGISTER ──────────────────────────────────────────────────────────────
  const register = async (name, email, password, image, adminCode = "") => {
    try {
      const { token, user: u } = await api.post("/auth/register", {
        name, email, password, image, adminCode,
      });
      setToken(token);
      setUser(u);
      return true;
    } catch (err) {
      return err.message || false;
    }
  };

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    try {
      const u = await api.put("/auth/me", updates);
      setUser(u);
      return true;
    } catch (err) {
      return err.message || false;
    }
  };

  // ── DELETE ACCOUNT ────────────────────────────────────────────────────────
  const deleteAccount = async () => {
    try {
      await api.delete("/auth/me");
      setToken(null);
      setUser(null);
      return true;
    } catch {
      return false;
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // ── ADMIN HELPERS ─────────────────────────────────────────────────────────
  const getAllUsers = () => api.get("/admin/users");

  const setUserRole = (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role });

  const deleteUser = (userId) =>
    api.delete(`/admin/users/${userId}`);

  const isAdmin = !!user && user.role === "admin";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        isAdmin,
        getAllUsers,
        setUserRole,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/"     replace />;
  return children;
}
