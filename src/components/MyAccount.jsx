import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaHistory, FaBox } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MyAccount = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setFormData({
            name: docSnap.data().name || '',
            mobile: docSnap.data().mobile || ''
          });
        }

        // Fetch recent orders
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const ordersList = [];
        querySnapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        setOrders(ordersList);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        name: formData.name,
        mobile: formData.mobile
      });
      setUserData({ ...userData, name: formData.name, mobile: formData.mobile });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading account details...</p>
      </div>
    );
  }

  const user = auth.currentUser;

  return (
    <div className="account-page">
      <h1>My Account</h1>

      <div className="account-container">
        <div className="account-profile">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2>{userData?.name || user?.displayName || 'User'}</h2>
              <p>{user?.email}</p>
            </div>
            {!editing && (
              <button className="edit-profile-btn" onClick={handleEdit}>
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label><FaUser /> Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label><FaPhone /> Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  <FaSave /> Save Changes
                </button>
                <button className="cancel-btn" onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: userData?.name || '',
                    mobile: userData?.mobile || ''
                  });
                }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div>
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
              </div>
              <div className="detail-item">
                <FaPhone className="detail-icon" />
                <div>
                  <label>Mobile</label>
                  <p>{userData?.mobile || 'Not provided'}</p>
                </div>
              </div>
              <div className="detail-item">
                <FaUser className="detail-icon" />
                <div>
                  <label>Name</label>
                  <p>{userData?.name || user?.displayName || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="account-actions">
          <Link to="/orders" className="account-action-card">
            <FaBox />
            <div>
              <h3>My Orders</h3>
              <p>View and track your orders</p>
            </div>
          </Link>
          <Link to="/order-history" className="account-action-card">
            <FaHistory />
            <div>
              <h3>Order History</h3>
              <p>View all past orders</p>
            </div>
          </Link>
        </div>

        {orders.length > 0 && (
          <div className="recent-orders">
            <h3>Recent Orders</h3>
            <div className="recent-orders-list">
              {orders.map((order) => (
                <div key={order.id} className="recent-order-item">
                  <span className="order-ref">{order.referenceNumber}</span>
                  <span className="order-amount">₹{order.total}</span>
                  <span className={`status-badge ${order.status?.replace(/\s/g, '-') || 'confirmed'}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Confirmed'}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/orders" className="view-all-btn">View All Orders</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;