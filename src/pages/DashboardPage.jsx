import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleCardClick = () => {
    // Navigates to the next step in the Marena Bangalore sports complex flow
    navigate('/bangalore-sports-complex');
  };

  return (
    <div className="flt" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with active DASHBOARD link and My Profile badge */}
      <Header onOpenContact={() => setShowContactModal(true)} />

      {/* Main Dashboard Section */}
      <main className="dashboard_main flt" style={{ flex: 1 }}>
        <div className="container">
          <div className="dashboard_inside">
            {/* Title: SELECT SERVICE TYPE */}
            <div className="service_type flt flexes">
              <div className="select">SELECT SERVICE TYPE</div>
            </div>

            {/* Service Cards Grid */}
            <div className="row">
              <div className="col-sm-6 col-12">
                <div
                  className="marina_sport"
                  onClick={handleCardClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleCardClick();
                  }}
                  id="marenaSportsComplexCard"
                >
                  <div className="marina_sport_img">
                    <img
                      src="/assets/images/sport.png"
                      alt="MARENA SPORTS COMPLEX"
                    />
                  </div>
                  <div className="marina_text">
                    MARENA SPORTS COMPLEX
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onOpenContact={() => setShowContactModal(true)} />

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
