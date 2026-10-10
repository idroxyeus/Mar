import React from 'react';

export default function InstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-custom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/assets/images/mahe_banglr_logo.png"
              alt="MAHE Bengaluru"
              style={{ height: '40px' }}
              onError={(e) => {
                e.target.src = '/assets/images/mahe_logo.png';
              }}
            />
            <h5
              style={{
                margin: 0,
                fontFamily: 'Teko, sans-serif',
                fontSize: '24px',
                color: '#00415a',
                textTransform: 'uppercase',
              }}
            >
              MAHE Bengaluru Instructions
            </h5>
          </div>
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
          <div
            style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '15px',
              color: '#444',
              lineHeight: '1.7',
            }}
          >
            <ol style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>
                Students and Staff of MAHE Bengaluru can login using their valid Roll
                Number or Registration ID along with their registered mobile number.
              </li>
              <li style={{ marginBottom: '10px' }}>
                Members must present their physical or digital membership card at the
                MARENA Sports Complex entry turnstiles.
              </li>
              <li style={{ marginBottom: '10px' }}>
                Appropriate non-marking sports shoes and athletic attire are mandatory
                for court and gym facilities.
              </li>
              <li style={{ marginBottom: '10px' }}>
                Facility booking and slots are subject to availability and adherence
                to university sports guidelines.
              </li>
              <li>
                For assistance or payment clarifications, please reach out to the
                Department of Physical Education & Sports or Student Finance office.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
