import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    setIsOpen(false);
  };

  const isAdmin = user?.email === 'admin@5starcrackers.com';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="logo-star">★</span> 5star Crackers
        </NavLink>

        <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          {/* Public links */}
          <NavLink to="/" end onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/products" onClick={() => setIsOpen(false)}>Products</NavLink>
          <NavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</NavLink>

          {/* User‑only links */}
          {user && (
            <>
              <NavLink to="/cart" onClick={() => setIsOpen(false)} className="cart-link">
                <FaShoppingCart /> Cart <span className="cart-badge">{getTotalItems()}</span>
              </NavLink>
              <NavLink to="/my-account" onClick={() => setIsOpen(false)}>
                <FaUser /> Account
              </NavLink>
              <NavLink to="/orders" onClick={() => setIsOpen(false)}>My Orders</NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setIsOpen(false)} className="admin-link">
                  Admin
                </NavLink>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}

          {/* Guest links */}
          {!user && (
            <>
              <NavLink to="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
              <NavLink to="/register" onClick={() => setIsOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;