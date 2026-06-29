import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { auth } from '../../firebase';
import { FaPlus, FaClipboardList, FaSignOutAlt, FaUserShield } from 'react-icons/fa';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.email === 'admin@5starcrackers.com') {
      setIsAdmin(true);
    } else {
      navigate('/');
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <FaUserShield />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/products" className="admin-nav-link">
            <FaPlus /> Manage Products
          </Link>
          <Link to="/admin/orders" className="admin-nav-link">
            <FaClipboardList /> Manage Orders
          </Link>
        </nav>
        <button
          className="admin-logout"
          onClick={() => {
            auth.signOut();
            navigate('/login');
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Welcome, Admin</h1>
          <p>Manage your store from here</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel;