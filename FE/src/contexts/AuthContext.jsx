import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../api/authApi";

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = "aura_token";
const STORAGE_KEY_USER = "aura_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // ── Refresh user data dari server agar patient_id selalu fresh ──
        getMe()
          .then((res) => {
            const freshUser = res.data?.data ?? res.data;
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(freshUser));
            }
          })
          .catch(() => {
            localStorage.removeItem(STORAGE_KEY_TOKEN);
            localStorage.removeItem(STORAGE_KEY_USER);
            setUser(null);
            setToken(null);
          });
      }
    } catch (err) {
      console.error("[AuthContext] Failed to restore session:", err);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } finally {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const persistSession = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem(STORAGE_KEY_TOKEN, tokenValue);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    const { user: userData, token: tokenValue } = res.data.data;
    persistSession(userData, tokenValue);

    // ── Fetch ulang /me setelah login agar patient_id tersimpan ──
    try {
      const meRes = await getMe();
      const fullUser = meRes.data?.data ?? meRes.data;
      if (fullUser) persistSession(fullUser, tokenValue);
      return fullUser ?? userData;
    } catch {
      return userData;
    }
  }, [persistSession]);

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    const { user: userData, token: tokenValue } = res.data.data;
    persistSession(userData, tokenValue);
    return userData;
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Token sudah expired — tetap bersihkan session di client
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return ctx;
};