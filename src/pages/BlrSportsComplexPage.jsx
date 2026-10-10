import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function BlrSportsComplexPage() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="flt" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenContact={() => setShowContactModal(true)} />

      <main className="placeholder-page" style={{ flex: 1 }}>
        <div className="placeholder-card">
          <span className="placeholder-badge">
            Route: /bangalore-sports-complex
          </span>

          <h2 className="placeholder-title">MARENA SPORTS COMPLEX (BENGALURU)</h2>
          <p className="placeholder-desc">
            You clicked the "MARENA SPORTS COMPLEX" card on the Dashboard.
            This is the temporary placeholder for the sports complex membership / booking page.
            Awaiting your next reference screenshot or HTML/CSS to implement this page.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              className="placeholder-btn"
              onClick={() => navigate('/dashboard')}
              id="backToDashboardBtn"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Back to Dashboard
            </button>
          </div>
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
