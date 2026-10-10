import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function MyAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  // Default to 'marena' if query param says marena, else 'marena' or 'account' (let's keep 'marena' accessible or default)
  const [activeTab, setActiveTabState] = useState(urlTab || 'marena');

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };
  const [showContactModal, setShowContactModal] = useState(false);
  const [receiptToast, setReceiptToast] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState('/assets/images/student_profile.jpg');
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false);

  // Load custom photo from localStorage if present
  useEffect(() => {
    const custom = localStorage.getItem('marena_custom_avatar');
    if (custom) {
      setProfilePhoto(custom);
      setHasCustomPhoto(true);
    }
  }, []);

  // Handle local photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setReceiptToast('Image size exceeds 2MB limit. Please choose a smaller file.');
      setTimeout(() => setReceiptToast(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setProfilePhoto(result);
      setHasCustomPhoto(true);
      localStorage.setItem('marena_custom_avatar', result);
      setReceiptToast('Profile photo updated successfully!');
      setTimeout(() => setReceiptToast(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    localStorage.removeItem('marena_custom_avatar');
    setProfilePhoto('/assets/images/student_profile.jpg');
    setHasCustomPhoto(false);
    setReceiptToast('Profile photo restored to default.');
    setTimeout(() => setReceiptToast(null), 3000);
  };

  // State for user custom receipt file (uploaded via hidden button at bottom)
  const [customReceiptFile, setCustomReceiptFile] = useState(null);

  // Load custom receipt file from localStorage on mount
  useEffect(() => {
    const savedReceipt = localStorage.getItem('marena_custom_receipt_data');
    const savedName = localStorage.getItem('marena_custom_receipt_name');
    const savedType = localStorage.getItem('marena_custom_receipt_type');
    if (savedReceipt && savedName) {
      setCustomReceiptFile({
        url: savedReceipt,
        name: savedName,
        type: savedType || 'application/pdf',
      });
    }
  }, []);

  // Handle custom receipt upload via bottom hidden upload button
  const handleReceiptFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const receiptObj = {
        url: dataUrl,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: (file.size / 1024).toFixed(1) + ' KB',
      };
      setCustomReceiptFile(receiptObj);
      try {
        localStorage.setItem('marena_custom_receipt_data', dataUrl);
        localStorage.setItem('marena_custom_receipt_name', file.name);
        localStorage.setItem('marena_custom_receipt_type', file.type || 'application/octet-stream');
      } catch (err) {
        console.warn('Storage limit reached, holding file in state only', err);
      }
      setReceiptToast(`File "${file.name}" attached! Clicking "Download" in the table will download this file.`);
      setTimeout(() => setReceiptToast(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Reset custom receipt file
  const handleResetReceiptFile = () => {
    setCustomReceiptFile(null);
    localStorage.removeItem('marena_custom_receipt_data');
    localStorage.removeItem('marena_custom_receipt_name');
    localStorage.removeItem('marena_custom_receipt_type');
    setReceiptToast('Custom receipt file removed.');
    setTimeout(() => setReceiptToast(null), 2500);
  };

  // User details with sanitized dummy data (Uppal, Hyderabad)
  const userDetails = {
    employeeCode: '235809142',
    name: 'KARTHIK REDDY M',
    email: 'karthik.reddy.hyd26@gmail.com',
    mobileNumber: '9849123456',
    gender: 'Male',
    dob: '12-05-2005',
    address: 'Plot No. 42, Sri Sai Nagar Colony, Near Uppal Metro Station, Uppal, Hyderabad, Telangana, India, 500039',
    institutionName: 'Manipal Institute of Technology, Bengaluru MAHE Bengaluru Campus, Karnataka,India',
  };

  // Marena membership table records (sorted latest first)
  const marenaRecords = [
    {
      srNo: 1,
      orderId: 'order_T5sN8RE1Pw9yZk',
      receiptNo: 'MARBLR6821',
      name: 'KARTHIK REDDY M',
      membershipType: 'Primary',
      age: '-',
      sportsCategory: 'GYM',
      membershipPeriod: '1 Month',
      fromDate: '10/10/2026',
      toDate: '09/11/2026',
      amtPaid: '₹2,000',
    },
    {
      srNo: 2,
      orderId: 'order_S3rK3QDOPvuBTc',
      receiptNo: 'MARBLR4764',
      name: 'KARTHIK REDDY M',
      membershipType: 'Primary',
      age: '-',
      sportsCategory: 'GYM',
      membershipPeriod: '1 Month',
      fromDate: '14/01/2026',
      toDate: '13/02/2026',
      amtPaid: '₹2,000',
    },
    {
      srNo: 3,
      orderId: 'order_R2alxDV0ju8zw',
      receiptNo: 'MARBLR1508',
      name: 'KARTHIK REDDY M',
      membershipType: 'Primary',
      age: '-',
      sportsCategory: 'GYM',
      membershipPeriod: '1 Month',
      fromDate: '07/08/2025',
      toDate: '06/09/2025',
      amtPaid: '₹2,000',
    },
  ];

  // Handle download receipt - downloads user's attached file or generates official document
  const handleDownloadReceipt = (record) => {
    if (customReceiptFile && customReceiptFile.url) {
      // Download the user's custom uploaded file
      const link = document.createElement('a');
      link.href = customReceiptFile.url;
      link.download = customReceiptFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setReceiptToast(`Downloading ${customReceiptFile.name}...`);
      setTimeout(() => setReceiptToast(null), 3000);
    } else {
      // Fallback: Generate and trigger download of an official MARENA receipt document
      const receiptContent = `======================================================================
           MANIPAL ACADEMY OF HIGHER EDUCATION (MAHE)
            MARENA SPORTS COMPLEX - BENGALURU
                 MEMBERSHIP PAYMENT RECEIPT
======================================================================

Receipt No.       : ${record.receiptNo}
Order ID          : ${record.orderId}
Payment Date      : ${record.fromDate}
Payment Mode      : Online (Razorpay)
Payment Status    : SUCCESS / CONFIRMED

----------------------------------------------------------------------
MEMBER DETAILS
----------------------------------------------------------------------
Name              : ${record.name}
Employee / Roll No: ${userDetails.employeeCode}
Email             : ${userDetails.email}
Mobile Number     : ${userDetails.mobileNumber}
Institution       : ${userDetails.institutionName}

----------------------------------------------------------------------
SUBSCRIPTION DETAILS
----------------------------------------------------------------------
Sports Category   : ${record.sportsCategory}
Membership Type   : ${record.membershipType}
Duration          : ${record.membershipPeriod}
Valid From        : ${record.fromDate}
Valid To          : ${record.toDate}

----------------------------------------------------------------------
FEES BREAKDOWN
----------------------------------------------------------------------
Facility Charges  : Rs. 1,694.92
CGST (9%)         : Rs.   152.54
SGST (9%)         : Rs.   152.54
Total Amount Paid : ${record.amtPaid} (Rupees Two Thousand Only)

======================================================================
NOTE: Please present this receipt at the Marena reception counter 
to record your biometric entry data.
======================================================================`;

      const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.receiptNo}_Receipt.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setReceiptToast(`Downloaded receipt ${record.receiptNo}. (Upload your own file using the button below)`);
      setTimeout(() => setReceiptToast(null), 3500);
    }
  };

  return (
    <div className="flt" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Site Header */}
      <Header onOpenContact={() => setShowContactModal(true)} />

      {/* Main Account Section */}
      <main className="main_container flt" style={{ flex: 1 }}>
        <div className="container">
          <div className="acc_main flt">
            {/* Header Menu / Breadcrumb & Tabs */}
            <div className="menu_main menu_inside flt">
              <div className="home_login flt">
                <span className="home_span">
                  <Link to="/dashboard">HOME/</Link>
                </span>
                <span className="login_span">ACCOUNT DETAILS</span>
              </div>

              <div className="nav_bar acc_det flt">
                <ul>
                  <li>
                    <a
                      className={`cursor_display ${activeTab === 'account' ? 'underline' : ''}`}
                      onClick={() => setActiveTab('account')}
                      id="accountDetailsTabBtn"
                    >
                      ACCOUNT DETAILS
                    </a>
                  </li>
                  <li>
                    <a
                      className={`cursor_display ${activeTab === 'marena' ? 'underline' : ''}`}
                      onClick={() => setActiveTab('marena')}
                      id="marenaTabBtn"
                    >
                      MARENA
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flt">
              <div className="login_section_acc log_acc flt">
                <div className="row">
                  <div className="col-sm-3"></div>
                  <div className="col-sm-5"></div>
                </div>
              </div>
            </div>

            {/* TAB 1: ACCOUNT DETAILS */}
            {activeTab === 'account' && (
              <div className="details_main flt ng-star-inserted">
                <div className="row">
                  {/* Left Column: Your Details */}
                  <div className="col-sm-6">
                    <div className="add_beneficiary flt">
                      <div className="benif_text flt">Your Details</div>
                      <div className="benef_content flt">
                        <ul>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Employee Code</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.employeeCode}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Name</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.name}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Email</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.email}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Mobile Number</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.mobileNumber}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Gender</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.gender}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Date Of Birth</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.dob}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Address</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.address}</span>
                          </li>
                          <li className="flex flt ng-star-inserted">
                            <span className="name">Institution Name</span>
                            <span className="colon">:</span>
                            <span className="values">{userDetails.institutionName}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Profile Picture */}
                  <div className="col-sm-6" style={{ marginTop: '9px' }}>
                    <div className="upload_text flt ng-star-inserted">
                      <div className="benif_text flt ng-star-inserted">Profile Picture</div>
                      <div className="benef_content flt">
                        <div className="col-sm-12 ng-star-inserted" style={{ padding: 0 }}>
                          <div className="upload_image">
                            <div className="alma_pic flt">
                              <img
                                style={{ width: '169px', height: '169px', objectFit: 'cover' }}
                                src={profilePhoto}
                                alt="Profile"
                                onError={(e) => {
                                  e.target.src = '/assets/images/student_profile.jpg';
                                }}
                              />
                            </div>
                          </div>

                          {/* Custom User Photo Upload Option */}
                          <div
                            className="photo_upload_option flt"
                            style={{
                              marginTop: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <input
                              type="file"
                              id="userPhotoUploadInput"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              style={{ display: 'none' }}
                              onChange={handlePhotoUpload}
                            />
                            <label
                              htmlFor="userPhotoUploadInput"
                              className="upload_label_btn"
                              id="uploadPhotoBtn"
                              style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontFamily: '"Titillium Web", sans-serif',
                                fontSize: '13.5px',
                                fontWeight: 600,
                                color: '#ffffff',
                                backgroundColor: '#00415a',
                                padding: '7px 16px',
                                borderRadius: '4px',
                                border: 'none',
                                transition: 'background-color 0.15s ease',
                              }}
                            >
                              <i className="fa-solid fa-camera"></i> Upload New Photo
                            </label>

                            {hasCustomPhoto && (
                              <button
                                type="button"
                                className="upload_reset_btn"
                                onClick={handleResetPhoto}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ff4155',
                                  fontFamily: '"Titillium Web", sans-serif',
                                  fontSize: '13px',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Reset to Default Photo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MARENA */}
            {activeTab === 'marena' && (
              <div className="marena_container flt" style={{ marginTop: '20px' }}>
                {/* Biometric Notice Banner */}
                <div
                  className="unlock toptext flt"
                  style={{
                    backgroundColor: '#fff',
                    fontFamily: '"Titillium Web", sans-serif',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#00415a',
                    padding: '17px 10px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    borderLeft: '4px solid #f27f0c',
                  }}
                >
                  PLEASE UPDATE THE BIOMETRIC DATA AFTER SUCCESSFUL PAYMENT WITH RECEIPT AT MARENA RECEPTION COUNTER.
                </div>

                {/* Transactions Table */}
                <div className="scroll_table_mobile flt" style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="table table-responsive flt" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Order id</th>
                        <th>Receipt No.</th>
                        <th>Name</th>
                        <th>Membership Type</th>
                        <th>Age</th>
                        <th>Sports Category</th>
                        <th>Membership Period</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Amt Paid</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marenaRecords.map((item) => (
                        <tr key={item.srNo}>
                          <td>{item.srNo}</td>
                          <td>{item.orderId}</td>
                          <td>{item.receiptNo}</td>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td>{item.membershipType}</td>
                          <td>{item.age}</td>
                          <td>{item.sportsCategory}</td>
                          <td>{item.membershipPeriod}</td>
                          <td>{item.fromDate}</td>
                          <td>{item.toDate}</td>
                          <td style={{ fontWeight: 600 }}>{item.amtPaid}</td>
                          <td>
                            <button
                              type="button"
                              className="receipt_download_btn"
                              title={`Download Receipt ${item.receiptNo}`}
                              onClick={() => handleDownloadReceipt(item)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#f27f0c',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14.5px',
                                fontFamily: '"Titillium Web", sans-serif',
                                fontWeight: 600,
                              }}
                            >
                              <i className="fa-solid fa-download"></i>
                              <span className="download_cls" style={{ color: '#f27f0c', textDecoration: 'none' }}>
                                Download
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Hidden Receipt File Attachment Controller at the Bottom of Page */}
            <div
              className="receipt_hidden_uploader_section flt"
              style={{
                marginTop: '35px',
                marginBottom: '20px',
                padding: '14px 18px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '13.5px',
                fontFamily: '"Titillium Web", sans-serif',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#00415a' }}>
                  <i className="fa-solid fa-paperclip mr-1" style={{ color: '#f27f0c' }}></i> Receipt Download File:
                </span>

                {customReceiptFile ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    {customReceiptFile.name} ({customReceiptFile.size})
                    <span style={{ color: '#0284c7', fontSize: '12px', fontWeight: 400 }}>
                      [Active for "Download" button]
                    </span>
                  </span>
                ) : (
                  <span style={{ color: '#64748b' }}>
                    No custom file attached. (Default MARENA receipt document downloads on click).
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="file"
                  id="customReceiptUploadInput"
                  style={{ display: 'none' }}
                  onChange={handleReceiptFileUpload}
                />

                <label
                  htmlFor="customReceiptUploadInput"
                  style={{
                    margin: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#00415a',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'background-color 0.15s ease',
                  }}
                  id="uploadReceiptFileBtn"
                >
                  <i className="fa-solid fa-arrow-up-from-bracket"></i>
                  {customReceiptFile ? 'Change Attached File' : 'Upload File to Attach'}
                </label>

                {customReceiptFile && (
                  <button
                    type="button"
                    onClick={handleResetReceiptFile}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textDecoration: 'underline',
                      padding: '4px 8px',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Toast Notification */}
            {receiptToast && (
              <div
                style={{
                  position: 'fixed',
                  bottom: '80px',
                  right: '30px',
                  backgroundColor: '#00415a',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  fontFamily: '"Titillium Web", sans-serif',
                  fontSize: '14px',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-circle-check text-success"></i>
                {receiptToast}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <Footer onOpenContact={() => setShowContactModal(true)} />

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
