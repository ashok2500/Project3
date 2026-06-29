import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaHistory, FaDownload } from 'react-icons/fa';

const OrderHistory = () => {
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <FaHistory className="no-orders-icon" />
        <h2>No Order History</h2>
        <p>You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <h1><FaHistory /> Order History</h1>
      <p className="orders-subtitle">View all your past orders</p>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card history-card">
            <div className="order-header">
              <div className="order-ref">
                <span className="ref-label">Order #</span>
                <span className="ref-number">{order.referenceNumber}</span>
              </div>
              <div className="order-date">
                {new Date(order.orderDate || order.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
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
                <span className={`status-badge ${order.status?.replace(/\s/g, '-') || 'confirmed'}`}>
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

export default OrderHistory;