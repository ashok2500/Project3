import React, { useState } from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Reach out to us anytime.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-card">
            <FaPhone className="contact-icon" />
            <h3>Call Us</h3>
            <p>+91 98765 43210</p>
            <a href="tel:+919876543210" className="contact-action-btn">
              <FaPhone /> Call Now
            </a>
          </div>

          <div className="contact-card">
            <FaWhatsapp className="contact-icon whatsapp" />
            <h3>WhatsApp</h3>
            <p>+91 98765 43210</p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-action-btn whatsapp-btn"
            >
              <FaWhatsapp /> Message Now
            </a>
          </div>

          <div className="contact-card">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>
            <p>info@5starcrackers.com</p>
            <a href="mailto:info@5starcrackers.com" className="contact-action-btn">
              <FaEnvelope /> Send Email
            </a>
          </div>

          <div className="contact-card">
            <FaMapMarkerAlt className="contact-icon" />
            <h3>Visit Us</h3>
            <p>123, Cracker Market,<br />Chennai, Tamil Nadu - 600001</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Write your message here..."
                rows="5"
              />
            </div>
            <button type="submit" className="send-btn">Send Message</button>
          </form>
        </div>
      </div>

      <div className="contact-hours">
        <FaClock />
        <div>
          <h3>Business Hours</h3>
          <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
          <p>Sunday: 10:00 AM - 6:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;