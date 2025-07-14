import React, { useEffect, useState, useContext } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import CountUp from 'react-countup';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import './AdminDashboardHome.css';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  padding: '32px 32px 24px 32px',
  maxWidth: 1200,
  margin: '40px auto',
  color: '#222',
};
const statsRow = {
  display: 'flex',
  gap: 32,
  marginTop: 32,
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
};
const statCard = {
  background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
  color: '#fff',
  borderRadius: 10,
  padding: '24px 32px',
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  boxShadow: '0 1px 8px rgba(96,165,250,0.10)',
};
const statIcon = {
  fontSize: 32,
  marginBottom: 8,
  opacity: 0.85,
};
const statLabel = {
  fontWeight: 600,
  fontSize: 16,
  marginBottom: 4,
};
const statValue = {
  fontWeight: 700,
  fontSize: 28,
  letterSpacing: 1,
};

const COLORS = ['#60a5fa', '#a855f7', '#f59e42', '#10b981', '#ef4444', '#6366f1'];

// Custom tooltip for better user experience
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>
          {payload[0].payload.fullName || payload[0].payload.name}
        </p>
        <p style={{ margin: '4px 0 0 0', color: '#60a5fa' }}>
          Revenue: ₹{payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// Function to truncate long movie titles
const truncateTitle = (title, maxLength = 15) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};

const AdminDashboardHome = () => {
  const { admin } = useContext(AdminAuthContext);
  const [stats, setStats] = useState({
    bookings: null,
    revenue: null,
    users: null,
    moviesRunning: null,
    mostBookedMovie: null,
    topCity: null,
  });
  const [charts, setCharts] = useState({
    bookingsOverTime: [],
    topMovies: [],
    revenueByMovie: [],
    userGrowth: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const headers = { Authorization: `Bearer ${admin.token}` };
      // Bookings
      const bookingsRes = await fetch('http://localhost:5000/api/admin/analytics/total-bookings', { headers });
      const bookingsData = await bookingsRes.json();
      // Revenue
      const revenueRes = await fetch('http://localhost:5000/api/admin/analytics/total-revenue', { headers });
      const revenueData = await revenueRes.json();
      // Users
      const usersRes = await fetch('http://localhost:5000/api/admin/analytics/total-users', { headers });
      const usersData = await usersRes.json();
      // Movies running
      const runningRes = await fetch('http://localhost:5000/api/admin/analytics/movies-running', { headers });
      const runningData = await runningRes.json();
      // Most booked movie
      const mostBookedRes = await fetch('http://localhost:5000/api/admin/analytics/most-booked-movie', { headers });
      const mostBookedData = await mostBookedRes.json();
      // Top city
      const topCityRes = await fetch('http://localhost:5000/api/admin/analytics/top-city', { headers });
      const topCityData = await topCityRes.json();
      setStats({
        bookings: bookingsData.totalBookings ?? 0,
        revenue: revenueData.totalRevenue ?? 0,
        users: usersData.totalUsers ?? 0,
        moviesRunning: runningData.moviesRunning ?? 0,
        mostBookedMovie: mostBookedData.mostBookedMovie ? mostBookedData.mostBookedMovie.title : 'N/A',
        topCity: topCityData.topCity ?? 'N/A',
      });
    };
    const fetchCharts = async () => {
      const headers = { Authorization: `Bearer ${admin.token}` };
      // Bookings over time
      const bookingsTimeRes = await fetch('http://localhost:5000/api/admin/analytics/bookings-over-time', { headers });
      const bookingsTimeData = await bookingsTimeRes.json();
      // Top movies
      const topMoviesRes = await fetch('http://localhost:5000/api/admin/analytics/top-movies', { headers });
      const topMoviesData = await topMoviesRes.json();
      // Revenue by movie
      const revenueMovieRes = await fetch('http://localhost:5000/api/admin/analytics/revenue-by-movie', { headers });
      const revenueMovieData = await revenueMovieRes.json();
      // User growth
      const userGrowthRes = await fetch('http://localhost:5000/api/admin/analytics/user-growth', { headers });
      const userGrowthData = await userGrowthRes.json();
      setCharts({
        bookingsOverTime: bookingsTimeData.bookingsOverTime || [],
        topMovies: topMoviesData.topMovies || [],
        revenueByMovie: revenueMovieData.revenueByMovie || [],
        userGrowth: userGrowthData.userGrowth || [],
      });
    };
    if (admin?.token) {
      fetchStats();
      fetchCharts();
    }
  }, [admin]);

  return (
    <div className="admin-dashboard-container">
      <h2 className="dashboard-title">Welcome to the Admin Dashboard</h2>
      <p className="dashboard-subtitle">Use the sidebar to manage movies, shows, and view analytics.</p>
      <div className="dashboard-stats-row">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">🎟️</span>
          <span className="dashboard-stat-label">Total Bookings</span>
          <span className="dashboard-stat-value">
            <CountUp end={stats.bookings ?? 0} duration={1.2} separator="," />
          </span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">💰</span>
          <span className="dashboard-stat-label">Total Revenue</span>
          <span className="dashboard-stat-value">
            ₹<CountUp end={stats.revenue ?? 0} duration={1.2} separator="," />
          </span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">👥</span>
          <span className="dashboard-stat-label">Total Users</span>
          <span className="dashboard-stat-value">
            <CountUp end={stats.users ?? 0} duration={1.2} separator="," />
          </span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">🎬</span>
          <span className="dashboard-stat-label">Movies Running</span>
          <span className="dashboard-stat-value">
            <CountUp end={stats.moviesRunning ?? 0} duration={1.2} separator="," />
          </span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">🏆</span>
          <span className="dashboard-stat-label">Most Booked Movie</span>
          <span className="dashboard-stat-value">{stats.mostBookedMovie}</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">📍</span>
          <span className="dashboard-stat-label">Top City</span>
          <span className="dashboard-stat-value">{stats.topCity}</span>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card">
          <h3>Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.bookingsOverTime} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart-card">
          <h3>Top 5 Movies by Bookings</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.topMovies.map(tm => ({ name: tm.movie?.title || 'N/A', count: tm.count }))} margin={{ top: 16, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, angle: 30, textAnchor: 'start' }}
                interval={0}
                height={60}
              />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value, name, props) => [value, 'Bookings']} labelFormatter={label => `Movie: ${label}`} />
              <Bar dataKey="count" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card">
          <h3>Revenue by Movie</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            Hover over chart segments to see movie details
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={charts.revenueByMovie.map(rm => ({ 
                  name: truncateTitle(rm.movie?.title || 'N/A'), 
                  value: rm.revenue,
                  fullName: rm.movie?.title || 'N/A' 
                }))} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                label={false}
                stroke="#fff"
                strokeWidth={2}
              >
                {charts.revenueByMovie.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart-card">
          <h3>User Growth (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.userGrowth} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;