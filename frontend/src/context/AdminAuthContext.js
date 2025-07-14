import React, { createContext, useState, useEffect } from 'react';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_jwt');
    if (token) {
      setAdmin({ token });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('admin_jwt', token);
    setAdmin({ token });
  };

  const logout = () => {
    localStorage.removeItem('admin_jwt');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 