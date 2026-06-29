import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Products from './components/Products';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import OrderHistory from './components/OrderHistory';
import Contact from './components/Contact';
import MyAccount from './components/MyAccount';
import AdminPanel from './components/Admin/AdminPanel';
import ManageProducts from './components/Admin/ManageProducts';
import ManageOrders from './components/Admin/ManageOrders';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Navbar user={user} />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/products" element={<Products />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Routes (require login) */}
              <Route path="/cart" element={<ProtectedRoute user={user}><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute user={user}><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute user={user}><Orders /></ProtectedRoute>} />
              <Route path="/order-history" element={<ProtectedRoute user={user}><OrderHistory /></ProtectedRoute>} />
              <Route path="/my-account" element={<ProtectedRoute user={user}><MyAccount /></ProtectedRoute>} />

              {/* Admin Routes (require login + admin check inside component) */}
              <Route path="/admin" element={<ProtectedRoute user={user}><AdminPanel /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute user={user}><ManageProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute user={user}><ManageOrders /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; 2026 5star Crackers. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;