import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaCheckCircle, FaTruck, FaMapMarkerAlt, FaClock, FaBox } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersList = [];
        querySnapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        setOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaClock className="status-icon confirmed" />;
      case 'shipped': return <FaTruck className="status-icon shipped" />;
      case 'near to delivery': return <FaMapMarkerAlt className="status-icon near" />;
      case 'delivered': return <FaCheckCircle className="status-icon delivered" />;
      default: return <FaBox className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status.replace(/\s/g, '-')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <FaBox className="no-orders-icon" />
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders. Start shopping now!</p>
        <a href="/products" className="shop-now-btn">Shop Now</a>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      <p className="orders-subtitle">Track and manage your orders</p>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-ref">
                <span className="ref-label">Order #</span>
                <span className="ref-number">{order.referenceNumber}</span>
              </div>
              <div className="order-date">
                {new Date(order.orderDate || order.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="order-body">
              <div className="order-items">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.name}</span>
                    <span>× {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>Total: <strong>₹{order.total}</strong></span>
              </div>

              <div className="order-address">
                <FaMapMarkerAlt />
                <span>{order.address}, {order.city}, {order.pincode}</span>
                {order.landmark && <span className="landmark">(Landmark: {order.landmark})</span>}
              </div>

              <div className="order-status">
                {getStatusIcon(order.status)}
                <span className={getStatusClass(order.status)}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Confirmed'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;