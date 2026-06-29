import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  FaFire, FaTruck, FaShieldAlt, FaStar, 
  FaCheckCircle, FaClock, FaAward, FaPhone, FaEnvelope,
  FaQuoteLeft, FaRocket, FaMagic, FaWater, FaBolt, FaLeaf
} from 'react-icons/fa';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      setFeaturedProducts(products.slice(0, 4));
    };
    fetchProducts();
  }, []);

  // Cracker categories data
  const crackerCategories = [
    { name: 'Rockets', icon: <FaRocket />, emoji: '🚀', desc: 'High-flying rockets with colourful trails.' },
    { name: 'Sparklers', icon: <FaMagic />, emoji: '✨', desc: 'Classic sparklers for safe fun.' },
    { name: 'Fountains', icon: <FaWater />, emoji: '⛲', desc: 'Beautiful fountain displays.' },
    { name: 'Crackers', icon: <FaBolt />, emoji: '💥', desc: 'Loud and bright crackling shells.' },
    { name: 'Aerial Shells', icon: <FaLeaf />, emoji: '🎆', desc: 'Professional-grade aerial bursts.' },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to <span className="highlight">5star Crackers</span></h1>
          <p>Premium quality cracker shells for every celebration</p>
          <p className="hero-sub">Light up your moments with our stunning collection</p>
          <Link to="/products" className="hero-btn">Explore Now</Link>
        </div>
        <div className="hero-image">
          <div className="hero-fireworks">
            <span className="firework">🎆</span>
            <span className="firework">🧨</span>
            <span className="firework">🎇</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <FaFire className="feature-icon" />
          <h3>Premium Quality</h3>
          <p>Top-grade cracker shells sourced from trusted manufacturers</p>
        </div>
        <div className="feature-card">
          <FaTruck className="feature-icon" />
          <h3>Fast Delivery</h3>
          <p>Quick and safe delivery to your doorstep</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt className="feature-icon" />
          <h3>Safe & Secure</h3>
          <p>All products meet safety standards and regulations</p>
        </div>
        <div className="feature-card">
          <FaStar className="feature-icon" />
          <h3>Best Prices</h3>
          <p>Competitive prices with premium quality products</p>
        </div>
      </section>

      {/* 🆕 Our Cracker Collections (Designs) */}
      <section className="cracker-collections">
        <h2>Our Cracker Collections</h2>
        <p className="section-sub">Explore our wide range of firecrackers, carefully curated for every occasion.</p>
        <div className="collection-grid">
          {crackerCategories.map((cat) => (
            <div key={cat.name} className="collection-card">
              <div className="collection-icon">{cat.icon}</div>
              <div className="collection-emoji">{cat.emoji}</div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
              <Link to="/products" className="collection-link">Browse →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-placeholder">🧨</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description?.slice(0, 60)}...</p>
                <div className="product-price">₹{product.price}</div>
                <Link to="/products" className="view-btn">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose 5star Crackers? */}
      <section className="why-choose">
        <h2>Why Choose 5star Crackers?</h2>
        <div className="why-grid">
          <div className="why-card">
            <FaCheckCircle className="why-icon" />
            <h4>100% Quality Guaranteed</h4>
            <p>Every product is sourced from licensed manufacturers and rigorously tested for safety and performance.</p>
          </div>
          <div className="why-card">
            <FaClock className="why-icon" />
            <h4>On‑Time Delivery</h4>
            <p>We value your time – order before 2 PM and get same‑day dispatch for most pin codes.</p>
          </div>
          <div className="why-card">
            <FaAward className="why-icon" />
            <h4>Festival‑Ready Packing</h4>
            <p>All orders are packed with care using premium materials to ensure your crackers arrive in perfect condition.</p>
          </div>
          <div className="why-card">
            <FaStar className="why-icon" />
            <h4>Trusted by Thousands</h4>
            <p>Join the 5star family – over 10,000 happy customers have celebrated with our crackers.</p>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>“The best crackers I’ve ever bought! The quality is outstanding and the delivery was super fast.”</p>
            <span className="customer-name">– Ramesh S.</span>
          </div>
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>“5star Crackers made our Diwali celebration truly special. The variety and prices are unbeatable.”</p>
            <span className="customer-name">– Priya M.</span>
          </div>
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p>“I’ve been a loyal customer for years – they never disappoint. Highly recommended!”</p>
            <span className="customer-name">– Senthil K.</span>
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="contact-banner">
        <div className="banner-content">
          <h3>Need Help or Have a Query?</h3>
          <p>Our team is here to assist you with product selection, bulk orders, or any questions.</p>
          <div className="contact-links">
            <a href="tel:+919876543210" className="contact-link">
              <FaPhone /> +91 98765 43210
            </a>
            <a href="mailto:info@5starcrackers.com" className="contact-link">
              <FaEnvelope /> info@5starcrackers.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;