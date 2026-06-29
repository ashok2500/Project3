import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaUser, FaPhone, FaMapMarkerAlt, FaHome, FaCreditCard } from 'react-icons/fa';
import { generatePDFAndSend } from '../utils/pdfUtils';

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    pincode: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login to place order');
        navigate('/login');
        return;
      }

      const total = getTotal() + 50;
      const referenceNumber = `5STAR-${Date.now().toString().slice(-8)}`;

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        userName: formData.name || user.displayName || 'User',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        subtotal: getTotal(),
        deliveryCharge: 50,
        address: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone || user.phoneNumber || '',
        status: 'confirmed',
        referenceNumber,
        createdAt: serverTimestamp(),
        orderDate: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Generate PDF and send to email
      await generatePDFAndSend({
        ...orderData,
        id: docRef.id,
        orderDate: new Date().toISOString()
      });

      clearCart();
      alert(`Order placed successfully!\n✅ Invoice PDF downloaded to your device.\n📧 Order confirmation email sent to ${user.email}`);
      navigate('/orders');

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h3><FaUser /> Personal Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label><FaPhone /> Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaMapMarkerAlt /> Delivery Address</h3>
            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter your full address"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label><FaHome /> Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark (optional)"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Enter city"
                />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  placeholder="Enter pincode"
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>

          <div className="form-section order-summary-section">
            <h3><FaCreditCard /> Order Summary</h3>
            <div className="checkout-summary">
              {cart.map(item => (
                <div key={item.id} className="checkout-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="checkout-total">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className="total-row">
                  <span>Delivery</span>
                  <span>₹50</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₹{getTotal() + 50}</span>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;