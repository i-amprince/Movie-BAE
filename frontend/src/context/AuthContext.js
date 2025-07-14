import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          token
        });
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    Cookies.remove('jwt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 