import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setToken, removeToken } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  driverId: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  login: (email: string, password: string, driverId?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res?.data?.user ?? null);
      } catch {
        setUser(null);
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string, driverId?: string) => {
    const body: any = { email, password };
    if (driverId) body.driverId = driverId;
    const res = await api.post('/api/auth/login', body);
    const data = res?.data;
    await setToken(data?.token ?? '');
    setUser(data?.user ?? null);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.post('/api/signup', { email, password, name });
    const data = res?.data;
    await setToken(data?.token ?? '');
    setUser({ ...data?.user, role: 'passenger', driverId: null });
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role ?? null,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
