import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MovieBookingLanding from './pages/MovieBookingLanding';
import MoviesPage from './pages/MoviesPage';
import MovieDetails from './pages/MovieDetails';
import SignIn from './pages/SignIn';
import MyBooking from './pages/MyBooking';
import BookTicket from './pages/BookTicket';
import UserProfile from './pages/UserProfile';
import { AdminAuthProvider, AdminAuthContext } from './context/AdminAuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminMovies from './pages/admin/AdminMovies';
import AdminShows from './pages/admin/AdminShows';
import { Toaster } from 'react-hot-toast';

// Simple protected route for admin
const AdminProtected = ({ children }) => {
  const { admin, loading } = React.useContext(AdminAuthContext);
  if (loading) return <div>Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#ef4444',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: '0.7rem',
                boxShadow: '0 4px 24px rgba(239,68,68,0.15)'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            duration: 3000
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MovieBookingLanding />} />
            <Route path="movies" element={<MoviesPage />} />
            <Route path="movies/:id" element={<MovieDetails />} />
            <Route path="mybookings" element={<MyBooking />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="book/:id" element={<BookTicket />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }>
            <Route index element={<AdminDashboardHome />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="shows" element={<AdminShows />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
