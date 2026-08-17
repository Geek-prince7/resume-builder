import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutSession } from '../api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  function setToken(t) {
    setTokenState(t);
    if (t) {
      localStorage.setItem('token', t);
    } else {
      localStorage.removeItem('token');
    }
  }

  function loginUser(tokenVal, userData) {
    setToken(tokenVal);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  async function logout() {
    await logoutSession().catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function refreshUser(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, token, loading, loginUser, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
