import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { FaEye, FaDownload, FaCheck, FaTruck, FaMapMarkerAlt, FaBox } from 'react-icons/fa';
import { downloadOrderPDF } from '../../utils/pdfUtils';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusOptions = ['confirmed', 'shipped', 'near to delivery', 'delivered'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (updating) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPDF = async (order) => {
    try {
      await downloadOrderPDF(order);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF.');
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status?.replace(/\s/g, '-') || 'confirmed'}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="manage-orders">
      <div className="manage-header">
        <h2>Manage Orders</h2>
        <span className="order-count">{orders.length} orders</span>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-ref-cell">{order.referenceNumber || 'N/A'}</td>
                <td>{order.userName || order.userEmail || 'N/A'}</td>
                <td>{formatDate(order.createdAt || order.orderDate)}</td>
                <td>{order.items?.length || 0} items</td>
                <td>₹{order.total || 0}</td>
                <td>
                  <span className={getStatusClass(order.status)}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Confirmed'}
                  </span>
                </td>
                <td className="action-buttons">
                  <button
                    className="view-btn"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                    }}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="download-btn"
                    onClick={() => handleDownloadPDF(order)}
                  >
                    <FaDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="no-data">No orders found.</p>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="order-details-modal" onClick={() => setShowDetails(false)}>
          <div className="order-details" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <h3>Order Details</h3>
              <button className="close-details" onClick={() => setShowDetails(false)}>×</button>
            </div>

            <div className="details-body">
              <div className="detail-row">
                <span className="detail-label">Order #</span>
                <span className="detail-value">{selectedOrder.referenceNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer</span>
                <span className="detail-value">{selectedOrder.userName || selectedOrder.userEmail}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{selectedOrder.userEmail}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{selectedOrder.phone || 'N/A'}</span>
              </div>

              <div className="detail-section">
                <h4>Delivery Address</h4>
                <p>
                  {selectedOrder.address}<br />
                  {selectedOrder.landmark && `Landmark: ${selectedOrder.landmark}`}<br />
                  {selectedOrder.city}, {selectedOrder.pincode}
                </p>
              </div>

              <div className="detail-section">
                <h4>Items</h4>
                <div className="order-items-list">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span>{item.name}</span>
                      <span>× {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="order-total-row">
                    <span>Subtotal: ₹{selectedOrder.subtotal || selectedOrder.total - 50}</span>
                    <span>Delivery: ₹{selectedOrder.deliveryCharge || 50}</span>
                    <span className="grand-total">Total: ₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Update Status</h4>
                <div className="status-update">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                      disabled={updating}
                    >
                      {status === 'confirmed' && <FaCheck />}
                      {status === 'shipped' && <FaTruck />}
                      {status === 'near to delivery' && <FaMapMarkerAlt />}
                      {status === 'delivered' && <FaBox />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="details-actions">
                <button
                  className="download-pdf-btn"
                  onClick={() => handleDownloadPDF(selectedOrder)}
                >
                  <FaDownload /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;