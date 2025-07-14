import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';

const sidebarStyle = {
  width: 220,
  background: '#18181b',
  color: '#fff',
  minHeight: '100vh',
  padding: '32px 0',
  position: 'fixed',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  boxShadow: '2px 0 8px rgba(0,0,0,0.08)'
};
const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  padding: '12px 32px',
  fontWeight: 500,
  borderRadius: 6,
  margin: '0 8px',
  display: 'block'
};
const activeLinkStyle = {
  background: '#2563eb',
  color: '#fff'
};

const AdminLayout = () => {
  const { logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <h2 style={{ color: '#60a5fa', textAlign: 'center', marginBottom: 32, cursor: 'pointer' }} onClick={() => navigate('/admin')}>Admin Panel</h2>
        <NavLink to="/admin/movies" style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Movies</NavLink>
        <NavLink to="/admin/shows" style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Shows</NavLink>
        <NavLink to="/admin" style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Analytics</NavLink>
        <button onClick={handleLogout} style={{ ...linkStyle, background: '#ef4444', color: '#fff', border: 'none', marginTop: 32, cursor: 'pointer' }}>Logout</button>
      </aside>
      <main style={{ marginLeft: 220, flex: 1, background: '#f3f4f6', minHeight: '100vh', padding: '40px 32px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 