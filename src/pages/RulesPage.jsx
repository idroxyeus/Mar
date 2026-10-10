import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function RulesPage() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="flt" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenContact={() => setShowContactModal(true)} />

      <main className="placeholder-page" style={{ flex: 1 }}>
        <div className="placeholder-card">
          <span className="placeholder-badge">
            Route: /rules-and-regulation
          </span>

          <h2 className="placeholder-title">RULES & REGULATIONS OF MARENA</h2>
          <p className="placeholder-desc">
            Temporary placeholder route for MARENA rules and guidelines.
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
