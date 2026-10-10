import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenContact }) {
  return (
    <footer className="login_footer">
      <div className="container">
        <div className="row">
          {/* Column 1: Home & Contact */}
          <div className="col-sm-2 col-12 mb-3 mb-sm-0">
            <ul className="footer_links">
              <li>
                <Link to="/">HOME</Link>
              </li>
              <li>
                <a
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenContact) onOpenContact();
                  }}
                >
                  CONTACT US
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Rules and Regulations */}
          <div className="col-sm-6 col-12 mb-3 mb-sm-0">
            <ul className="footer_links">
              <li>
                <Link to="/rules-and-regulation">
                  RULES AND REGULATIONS OF MARENA
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Credits */}
          <div className="col-sm-4 col-12">
            <ul className="footer_links">
              <li>
                <Link to="/help">HELP FOR PAYMENT ISSUES</Link>
              </li>
              <li style={{ listStyleType: 'none', marginTop: '6px' }}>
                <a
                  href="https://www.chipsyservices.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="design_by_chipsy"
                >
                  Designed and developed by Chipsy Services
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
