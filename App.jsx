import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Add from './pages/Add.jsx';
import List from './pages/List.jsx';
import Orders from './pages/Orders.jsx';
import Users from './pages/Users.jsx';
import Login from './components/Login.jsx';
import Category from './pages/Category.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Ensure token is removed if invalid or user is logged out
  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
      navigate('/admin/login'); // Redirect to login if no token
    }
  }, [token, navigate]);

  return (
    <div>
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Conditional Rendering for Authentication */}
      {token ? (
        <>
          {/* Navbar */}
          <Navbar />
          <hr />

          {/* Main Layout: Sidebar and Content */}
          <div className="d-flex">
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, padding: '20px' }}>
              <Routes>
                {/* Admin Dashboard Routes */}
                <Route path="/admin/products" element={<List />} />
                <Route path="/admin/products/add" element={<Add />} />
                <Route path="/admin/orders" element={<Orders />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/category" element={<Category />} />

                {/* Default Redirect for Logged-In Users */}
                <Route path="*" element={<Navigate to="/admin/products" />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Routes>
          {/* Login Route */}
          <Route path="/admin/login" element={<Login setToken={setToken} />} />
          {/* Redirect to Login if No Token */}
          <Route path="*" element={<Navigate to="/admin/login" />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
