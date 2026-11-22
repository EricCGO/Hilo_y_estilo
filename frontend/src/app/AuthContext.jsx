import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { ROLES, ROLES_OPERATIVOS } from '@/shared/utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get(endpoints.me)
      .then((data) => active && setUser(data.data))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = async (email, password) => {
    const data = await api.post(endpoints.login, { email, password });
    setUser(data.data);
    return data.data;
  };

  const register = async (payload) => {
    const data = await api.post(endpoints.register, payload);
    setUser(data.data);
    return data.data;
  };

  const logout = async () => {
    try {
      await api.post(endpoints.logout);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const data = await api.get(endpoints.me);
    const usuario = data.data;
    setUser(usuario);
    return usuario;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.rol === ROLES.ADMIN,
      isOperativo: ROLES_OPERATIVOS.includes(user?.rol),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
