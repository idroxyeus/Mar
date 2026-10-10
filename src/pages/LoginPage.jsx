import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import InstructionsModal from '../components/InstructionsModal';

export default function LoginPage() {
  const navigate = useNavigate();

  // State management
  const [loginType, setLoginType] = useState('Student');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(true);

  // Modal controls
  const [showContactModal, setShowContactModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Form submission: Strictly frontend dummy behavior
  const handleSubmit = (e) => {
    e.preventDefault();

    // Store dummy user session in client-side state / localStorage
    const dummyUser = {
      loginType,
      identifier: loginType === 'Student' ? (rollNumber || '210905001') : loginType === 'Staff' ? (rollNumber || 'EMP10023') : (name || 'Guest User'),
      mobileNumber: mobileNumber || '9876543210',
      campus: 'Bengaluru',
      facility: 'MARENA Sports Complex',
      loginTime: new Date().toLocaleTimeString(),
    };
    localStorage.setItem('marena_current_user', JSON.stringify(dummyUser));

    // Frontend-only navigation directly to next route
    navigate('/dashboard');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="login_wrapper flt">
      {/* Site Header */}
      <Header onOpenContact={() => setShowContactModal(true)} />

      {/* Main Login Area with Bangalore Marena Background */}
      <main className="login_main_blr flt">
        <div className="login_container">
          <div className="login_box">
            {/* Header Titles */}
            <h1 className="login_txt">MARENA BENGALURU</h1>
            <div className="login_text_desc">LOGIN</div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login_form" noValidate>
              {/* Login Type Select */}
              <div className="form-group-custom select_type">
                <label className="form-control-label" htmlFor="userType">
                  Select Login Type <span className="mandatory">*</span>
                </label>
                <select
                  id="userType"
                  name="userType"
                  className="form-control-custom"
                  value={loginType}
                  onChange={(e) => setLoginType(e.target.value)}
                >
                  <option value="Select Login Type">Select Login Type</option>
                  <option value="Staff">Staff</option>
                  <option value="Student">Student</option>
                  <option value="Non-MAHE/Others">Non-MAHE/Others</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              {/* Conditional Input Fields */}
              {loginType === 'Student' && (
                <div className="role_fields">
                  <div className="form-group-custom">
                    <label className="form-control-label" htmlFor="student_roll_no">
                      Roll No <span className="mandatory">*</span>
                    </label>
                    <input
                      type="text"
                      id="student_roll_no"
                      name="student_roll_no"
                      className="form-control-custom"
                      placeholder="Enter Your Roll No"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-control-label" htmlFor="student_phone_no">
                      Mobile Number <span className="mandatory">*</span>
                    </label>
                    <input
                      type="tel"
                      id="student_phone_no"
                      name="student_phone_no"
                      className="form-control-custom"
                      placeholder="Enter Your Mobile Number"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {loginType === 'Staff' && (
                <div className="role_fields">
                  <div className="form-group-custom">
                    <label className="form-control-label" htmlFor="staff_roll_no">
                      Employee Number <span className="mandatory">*</span>
                    </label>
                    <input
                      type="text"
                      id="staff_roll_no"
                      name="staff_roll_no"
                      className="form-control-custom"
                      placeholder="Enter Your Registration ID"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-control-label" htmlFor="staff_phone_no">
                      Mobile Number <span className="mandatory">*</span>
                    </label>
                    <input
                      type="tel"
                      id="staff_phone_no"
                      name="staff_phone_no"
                      className="form-control-custom"
                      placeholder="Enter Your Mobile Number"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {(loginType === 'Non-MAHE/Others' || loginType === 'Guest') && (
                <div className="role_fields">
                  <div className="form-group-custom">
                    <label className="form-control-label" htmlFor="local_name">
                      Name <span className="mandatory">*</span>
                    </label>
                    <input
                      type="text"
                      id="local_name"
                      name="local_name"
                      className="form-control-custom"
                      placeholder="Enter Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-control-label" htmlFor="local_mobile_no">
                      Mobile Number <span className="mandatory">*</span>
                    </label>
                    <input
                      type="tel"
                      id="local_mobile_no"
                      name="local_mobile_no"
                      className="form-control-custom"
                      placeholder="Enter Your Mobile Number"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="account_register">
                    <span>Don’t have account ? </span>
                    <Link to="/registration">Register Now</Link>
                  </div>
                </div>
              )}

              {/* Instructions Checkbox */}
              <div className="agree_align">
                <input
                  type="checkbox"
                  id="agreeInstructions"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="agreeInstructions" style={{ margin: 0, cursor: 'pointer' }}>
                  I agree to the{' '}
                  <a
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowInstructionsModal(true);
                    }}
                  >
                    MAHE Bengaluru Instructions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div className="submit_btn">
                <button type="submit" id="loginSubmitBtn">
                  SUBMIT
                </button>
              </div>

              {/* Back Button */}
              <div className="back_btn">
                <button type="button" onClick={handleBack} id="loginBackBtn">
                  BACK
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <Footer onOpenContact={() => setShowContactModal(true)} />

      {/* Modals */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
      <InstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
      />
    </div>
  );
}
