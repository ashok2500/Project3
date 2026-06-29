import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { FaShareAlt, FaGift, FaCopy } from 'react-icons/fa';

const ReferEarn = () => {
  const [referralLink, setReferralLink] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Generate a referral link using user UID
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/refer?ref=${user.uid}`);
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  return (
    <div className="refer-earn-page"><center>
      <h1>Refer & Earn</h1>
      <p className="page-subtitle">Invite friends and earn rewards!</p>
</center>
      {user ? (
        <div className="refer-card">
          <div className="refer-info">
            <h2>Your Referral Link</h2>
            <div className="refer-link-box">
              <input type="text" value={referralLink} readOnly />
              <button className="copy-btn" onClick={copyToClipboard}>
                <FaCopy /> Copy
              </button>
            </div>
            <p>Share this link with your friends. When they sign up and make their first order, you both get ₹100 cashback!</p>
          </div>

          <div className="earnings-info">
            <h3>Your Earnings</h3>
            <div className="earnings-stats">
              <div className="stat">
                <span className="stat-label">Total Referrals</span>
                <span className="stat-value">5</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Earned</span>
                <span className="stat-value">₹500</span>
              </div>
              <div className="stat">
                <span className="stat-label">Pending Rewards</span>
                <span className="stat-value">₹200</span>
              </div>
            </div>
          </div>

          <div className="refer-how-it-works">
            <h3>How It Works</h3>
            <ol>
              <li>Share your referral link with friends.</li>
              <li>They sign up using your link.</li>
              <li>When they place their first order, you both get ₹100 cashback.</li>
              <li>Withdraw your earnings anytime!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please log in to view your referral link and earnings.</p>
          <a href="/login" className="login-btn">Login</a>
        </div>
      )}
    </div>
  );
};

export default ReferEarn;