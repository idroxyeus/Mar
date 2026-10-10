import React from 'react';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-custom">
          <img
            src="/assets/images/mahe_banglr_logo.png"
            alt="MAHE Bengaluru"
            onError={(e) => {
              e.target.src = '/assets/images/mahe_logo.png';
            }}
          />
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="modal-body-custom">
          {/* Section 1: MARENA Sports Complex */}
          <div className="contact-section-card">
            <div className="contact-section-title">
              <img
                src="/assets/images/swim_comp.png"
                alt="Icon"
                style={{ width: '18px', height: '18px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              MARENA Sports Complex (Bengaluru)
            </div>
            <ul>
              <li>
                <i className="fa-solid fa-location-dot"></i>
                <span>
                  MARENA Sports Complex, Manipal Academy of Higher Education,
                  Govindapura, Yelahanka, Bengaluru - 560064
                </span>
              </li>
              <li>
                <i className="fa-solid fa-phone"></i>
                <span>080-24497290, 080-24497274</span>
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>
                <span>marena.maheblr@manipal.edu</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Department of Physical Education & Sports */}
          <div className="contact-section-card">
            <div className="contact-section-title">
              <i className="fa-solid fa-graduation-cap text-primary"></i>
              Department of Physical Education & Sports
            </div>
            <ul>
              <li>
                <i className="fa-solid fa-phone"></i>
                <span>080-24494120</span>
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>
                <span>sports.maheblr@manipal.edu</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Finance Queries */}
          <div className="contact-section-card" style={{ marginBottom: 0 }}>
            <div className="contact-section-title">
              <i className="fa-solid fa-receipt text-primary"></i>
              Finance Queries
            </div>
            <ul>
              <li>
                <i className="fa-solid fa-phone"></i>
                <span>080-24494128</span>
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>
                <span>fin.maheblr@manipal.edu</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
