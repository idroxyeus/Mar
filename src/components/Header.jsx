import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProfilePictureBlob } from '../utils/storage';

export default function Header({ onOpenContact }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);
  const dropdownRef = useRef(null);

  // Check if current route is dashboard or my-account or bangalore-sports-complex
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/bangalore-sports-complex';
  const isAccount = location.pathname === '/my-account';
  const showProfile = isDashboard || isAccount;

  // Load profile picture from IndexedDB and listen for updates
  useEffect(() => {
    let currentObjectUrl = null;

    async function loadAvatar() {
      try {
        const photoRecord = await getProfilePictureBlob();
        if (photoRecord && photoRecord.blob) {
          if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
          }
          currentObjectUrl = URL.createObjectURL(photoRecord.blob);
          setCustomAvatar(currentObjectUrl);
        } else {
          if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
          }
          setCustomAvatar(null);
        }
      } catch (err) {
        console.warn('Header: unable to load avatar from IndexedDB', err);
      }
    }

    loadAvatar();

    const handleAvatarUpdate = () => {
      loadAvatar();
    };

    window.addEventListener('marena_avatar_updated', handleAvatarUpdate);

    return () => {
      window.removeEventListener('marena_avatar_updated', handleAvatarUpdate);
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('marena_current_user');
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="main_header flt">
        <div className="container header_flex_container">
          {/* Logo Section */}
          <div className="logo_img">
            <Link to={showProfile ? "/dashboard" : "/"}>
              <img
                src="/assets/images/mahe_banglr_logo.png"
                alt="MAHE Bengaluru Logo"
                onError={(e) => {
                  e.target.src = '/assets/images/mahe_logo.png';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav_bar hide_mobile" aria-label="Main Navigation">
            <ul>
              <li>
                <Link
                  to={showProfile ? "/dashboard" : "/"}
                  style={{
                    color: location.pathname === '/' || location.pathname === '/login' ? '#f27f0c' : '#00415a'
                  }}
                >
                  HOME
                </Link>
              </li>

              {showProfile && (
                <li>
                  <Link
                    to="/dashboard"
                    style={{
                      color: isDashboard ? '#f27f0c' : '#00415a',
                      fontWeight: 600
                    }}
                  >
                    DASHBOARD
                  </Link>
                </li>
              )}

              <li>
                <a
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenContact) onOpenContact();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onOpenContact && onOpenContact();
                  }}
                >
                  CONTACT US
                </a>
              </li>

              {/* Profile Dropdown */}
              {showProfile && (
                <li style={{ position: 'relative' }} ref={dropdownRef}>
                  <div className="login_sections">
                    <img
                      src={customAvatar || '/assets/images/profile.png'}
                      alt="User Profile Avatar"
                      className="profile_icon"
                      style={{ objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setProfileOpen(!profileOpen)}
                      id="myProfileDropdownBtn"
                      className="profile_btn"
                      aria-haspopup="true"
                      aria-expanded={profileOpen}
                    >
                      <span>My Profile</span>
                      <i className="fa-solid fa-caret-down"></i>
                    </button>

                    {profileOpen && (
                      <div className="myprof_list">
                        <ul>
                          <li
                            onClick={() => {
                              setProfileOpen(false);
                              navigate('/my-account');
                            }}
                          >
                            <img src="/assets/images/prof.png" alt="Profile" />
                            <span>ACCOUNT DETAILS</span>
                          </li>
                          <li onClick={handleLogout}>
                            <img src="/assets/images/power.png" alt="Logout" />
                            <span>LOGOUT</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile_hamburger_btn hide_desktop"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            id="mobileMenuToggleBtn"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Matches original portal structure) */}
      {mobileMenuOpen && (
        <div className="mobile_menu_backdrop" onClick={closeMobileMenu}>
          <div
            id="mobileMenu"
            className="menuH_mobile"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="mobileMenu_close">
              <div className="mobile_menu_title">MAHE MENU</div>
              <button
                type="button"
                className="close_drawer_btn"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <ul className="mobile_nav_list">
              <li>
                <Link
                  to={showProfile ? "/dashboard" : "/"}
                  onClick={closeMobileMenu}
                  style={{
                    color: location.pathname === '/' || location.pathname === '/login' ? '#f27f0c' : '#00415a'
                  }}
                >
                  <i className="fa-solid fa-house"></i>
                  <span>HOME</span>
                </Link>
              </li>

              {showProfile && (
                <li>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    style={{
                      color: isDashboard ? '#f27f0c' : '#00415a',
                      fontWeight: 600
                    }}
                  >
                    <i className="fa-solid fa-gauge-simple-high"></i>
                    <span>DASHBOARD</span>
                  </Link>
                </li>
              )}

              <li>
                <a
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    if (onOpenContact) onOpenContact();
                  }}
                >
                  <i className="fa-solid fa-address-book"></i>
                  <span>CONTACT US</span>
                </a>
              </li>

              {showProfile && (
                <>
                  <li>
                    <Link
                      to="/my-account"
                      onClick={closeMobileMenu}
                      style={{
                        color: isAccount ? '#f27f0c' : '#00415a',
                        fontWeight: 600
                      }}
                    >
                      <i className="fa-solid fa-user"></i>
                      <span>MY PROFILE</span>
                    </Link>
                  </li>

                  <li>
                    <a
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      style={{ color: '#dc2626' }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span>LOGOUT</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
