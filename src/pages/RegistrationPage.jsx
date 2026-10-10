import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="flt" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenContact={() => setShowContactModal(true)} />

      <main className="placeholder-page" style={{ flex: 1 }}>
        <div className="placeholder-card">
          <span className="placeholder-badge">
            Route: /registration
          </span>

          <h2 className="placeholder-title">NON-MAHE USER REGISTRATION</h2>
          <p className="placeholder-desc">
            Temporary placeholder route for guest / non-MAHE registration.
            Awaiting reference design when this page is scheduled.
          </p>

          <button
            type="button"
            className="placeholder-btn"
            onClick={() => navigate('/login')}
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to Login
          </button>
        </div>
      </main>

      <Footer onOpenContact={() => setShowContactModal(true)} />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
