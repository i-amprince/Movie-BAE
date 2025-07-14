import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';

const AdminLayout = () => {
  const { logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const sidebarStyle = {
    width: isMobile ? '100%' : 220,
    background: '#18181b',
    color: '#fff',
    minHeight: '100vh',
    padding: '32px 0',
    position: 'fixed',
    left: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
    transition: 'left 0.3s ease',
    zIndex: 1000,
    maxWidth: isMobile ? '280px' : 'none'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    display: isMobile && sidebarOpen ? 'block' : 'none'
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

  const hamburgerStyle = {
    display: isMobile ? 'block' : 'none',
    position: 'fixed',
    top: 20,
    left: 20,
    zIndex: 1001,
    background: '#18181b',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '18px'
  };

  const mainStyle = {
    marginLeft: isMobile ? 0 : 220,
    flex: 1,
    background: '#f3f4f6',
    minHeight: '100vh',
    padding: isMobile ? '80px 16px 40px' : '40px 32px'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Hamburger Menu Button */}
      <button 
        style={hamburgerStyle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      <div 
        style={overlayStyle}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <h2 
            style={{ 
              color: '#60a5fa', 
              textAlign: 'center', 
              marginBottom: 32, 
              cursor: 'pointer',
              fontSize: isMobile ? '20px' : '24px'
            }} 
            onClick={() => {
              navigate('/admin');
              closeSidebar();
            }}
          >
            Admin Panel
          </h2>
          {isMobile && (
            <button 
              onClick={closeSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              ×
            </button>
          )}
        </div>
        
        <NavLink 
          to="/admin/movies" 
          style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
          onClick={closeSidebar}
        >
          Movies
        </NavLink>
        
        <NavLink 
          to="/admin/shows" 
          style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
          onClick={closeSidebar}
        >
          Shows
        </NavLink>
        
        <NavLink 
          to="/admin" 
          style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
          onClick={closeSidebar}
        >
          Analytics
        </NavLink>
        
        <button 
          onClick={() => {
            handleLogout();
            closeSidebar();
          }}
          style={{ 
            ...linkStyle, 
            background: '#ef4444', 
            color: '#fff', 
            border: 'none', 
            marginTop: 32, 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;