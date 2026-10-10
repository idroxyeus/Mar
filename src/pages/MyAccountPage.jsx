import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import {
  getUserDetails,
  saveUserField,
  resetUserDetails,
  validateField,
  USER_FIELD_CONFIG,
  DEFAULT_USER_DETAILS,
  saveProfilePictureBlob,
  getProfilePictureBlob,
  deleteProfilePictureBlob,
  saveReceiptAttachmentBlob,
  getReceiptAttachmentBlob,
  deleteReceiptAttachmentBlob,
} from '../utils/storage';

export default function MyAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(urlTab || 'account');

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const [showContactModal, setShowContactModal] = useState(false);
  const [receiptToast, setReceiptToast] = useState(null);

  // Editable personal details state (persisted in localStorage)
  const [userDetails, setUserDetails] = useState(getUserDetails);
  const [editingField, setEditingField] = useState(null);
  const [editDraftValue, setEditDraftValue] = useState('');
  const [fieldError, setFieldError] = useState(null);

  // Profile photo state (persisted as Blob in IndexedDB)
  const [profilePhoto, setProfilePhoto] = useState('/assets/images/student_profile.jpg');
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState(null);

  // Custom receipt file state (persisted as Blob in IndexedDB)
  const [customReceiptFile, setCustomReceiptFile] = useState(null);

  // Restore saved profile picture and receipt from IndexedDB on component mount
  useEffect(() => {
    // 1. Sync personal details from localStorage
    setUserDetails(getUserDetails());

    // 2. Restore profile photo from IndexedDB
    let activePhotoUrl = null;
    async function loadSavedPhoto() {
      try {
        const photoRecord = await getProfilePictureBlob();
        if (photoRecord && photoRecord.blob) {
          activePhotoUrl = URL.createObjectURL(photoRecord.blob);
          setProfilePhoto(activePhotoUrl);
          setHasCustomPhoto(true);
        } else {
          setProfilePhoto('/assets/images/student_profile.jpg');
          setHasCustomPhoto(false);
        }
      } catch (err) {
        console.warn('Could not restore profile photo from IndexedDB:', err);
      }
    }
    loadSavedPhoto();

    // 3. Restore receipt attachment from IndexedDB
    async function loadSavedReceipt() {
      try {
        const receiptRecord = await getReceiptAttachmentBlob();
        if (receiptRecord && receiptRecord.blob) {
          setCustomReceiptFile({
            blob: receiptRecord.blob,
            name: receiptRecord.filename,
            type: receiptRecord.mimeType,
            size: (receiptRecord.size / 1024).toFixed(1) + ' KB',
          });
        }
      } catch (err) {
        console.warn('Could not restore receipt attachment from IndexedDB:', err);
      }
    }
    loadSavedReceipt();

    // Clean up created object URLs on unmount
    return () => {
      if (activePhotoUrl) {
        URL.revokeObjectURL(activePhotoUrl);
      }
    };
  }, []);

  // Listen for storage updates across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'marena_user_profile_data' || e.type === 'marena_user_details_updated') {
        setUserDetails(getUserDetails());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('marena_user_details_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('marena_user_details_updated', handleStorageChange);
    };
  }, []);

  // ========================================================
  // INLINE FIELD EDITING HANDLERS
  // ========================================================

  const startEditing = (fieldKey) => {
    setEditingField(fieldKey);
    setEditDraftValue(userDetails[fieldKey] || '');
    setFieldError(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditDraftValue('');
    setFieldError(null);
  };

  const handleSaveField = (fieldKey) => {
    const err = validateField(fieldKey, editDraftValue);
    if (err) {
      setFieldError(err);
      return;
    }

    const result = saveUserField(fieldKey, editDraftValue);
    if (result.success) {
      setUserDetails(result.data);
      setEditingField(null);
      setEditDraftValue('');
      setFieldError(null);

      const fieldConfig = USER_FIELD_CONFIG.find((f) => f.key === fieldKey);
      const label = fieldConfig ? fieldConfig.label : fieldKey;
      setReceiptToast(`Saved ${label} successfully in browser storage!`);
      setTimeout(() => setReceiptToast(null), 3000);
    } else {
      setFieldError(result.error || 'Failed to save value.');
    }
  };

  const handleResetAllDetails = () => {
    if (window.confirm('Reset all personal details to default values?')) {
      const res = resetUserDetails();
      if (res.success) {
        setUserDetails(res.data);
        setEditingField(null);
        setReceiptToast('Personal details restored to defaults.');
        setTimeout(() => setReceiptToast(null), 3000);
      }
    }
  };

  // ========================================================
  // PROFILE PICTURE HANDLERS (IndexedDB)
  // ========================================================

  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid format. Please select a JPEG, PNG, or WebP image.');
      setReceiptToast('Invalid format. Please select JPEG, PNG, or WebP.');
      setTimeout(() => setReceiptToast(null), 3500);
      e.target.value = '';
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit. Please choose a smaller file.');
      setReceiptToast('Image exceeds 5MB limit.');
      setTimeout(() => setReceiptToast(null), 3500);
      e.target.value = '';
      return;
    }

    setPhotoError(null);
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingPhotoFile(file);
    setPendingPreviewUrl(previewUrl);
    e.target.value = '';
  };

  const handleSavePendingPhoto = async () => {
    if (!pendingPhotoFile) return;

    const saveRes = await saveProfilePictureBlob(pendingPhotoFile, pendingPhotoFile.name);
    if (saveRes.success) {
      setProfilePhoto(pendingPreviewUrl);
      setHasCustomPhoto(true);
      setPendingPhotoFile(null);
      setPendingPreviewUrl(null);
      setPhotoError(null);
      setReceiptToast('Profile picture saved in browser storage (IndexedDB)!');
      setTimeout(() => setReceiptToast(null), 3500);
    } else {
      setPhotoError('Could not save photo to browser database.');
      setReceiptToast('Error saving photo: ' + saveRes.error);
      setTimeout(() => setReceiptToast(null), 3500);
    }
  };

  const handleCancelPendingPhoto = () => {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingPhotoFile(null);
    setPendingPreviewUrl(null);
    setPhotoError(null);
  };

  const handleResetPhoto = async () => {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
      setPendingPreviewUrl(null);
      setPendingPhotoFile(null);
    }
    await deleteProfilePictureBlob();
    setProfilePhoto('/assets/images/student_profile.jpg');
    setHasCustomPhoto(false);
    setPhotoError(null);
    setReceiptToast('Profile photo restored to default.');
    setTimeout(() => setReceiptToast(null), 3000);
  };

  // ========================================================
  // RECEIPT ATTACHMENT HANDLERS (IndexedDB)
  // ========================================================

  const handleReceiptFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setReceiptToast('File exceeds 10MB limit.');
      setTimeout(() => setReceiptToast(null), 3500);
      return;
    }

    const saveRes = await saveReceiptAttachmentBlob(file);
    if (saveRes.success) {
      setCustomReceiptFile({
        blob: file,
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
      });
      setReceiptToast(`Attached "${file.name}". Saved in browser storage.`);
      setTimeout(() => setReceiptToast(null), 4000);
    } else {
      setReceiptToast('Failed to save receipt attachment in browser storage.');
      setTimeout(() => setReceiptToast(null), 3500);
    }
  };

  const handleResetReceiptFile = async () => {
    await deleteReceiptAttachmentBlob();
    setCustomReceiptFile(null);
    setReceiptToast('Custom receipt attachment removed.');
    setTimeout(() => setReceiptToast(null), 2500);
  };

  // Handle Download: downloads user's attached file from IndexedDB, or generates text receipt
  const handleDownloadReceipt = (record) => {
    if (customReceiptFile && customReceiptFile.blob) {
      const url = URL.createObjectURL(customReceiptFile.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = customReceiptFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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
Name              : ${userDetails.name}
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

  // Marena membership table records
  const marenaRecords = [
    {
      srNo: 1,
      orderId: 'order_T5sN8RE1Pw9yZk',
      receiptNo: 'MARBLR6821',
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
      membershipType: 'Primary',
      age: '-',
      sportsCategory: 'GYM',
      membershipPeriod: '1 Month',
      fromDate: '07/08/2025',
      toDate: '06/09/2025',
      amtPaid: '₹2,000',
    },
  ];

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
                      <div className="benif_text flt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Your Details</span>
                        <button
                          type="button"
                          className="reset_details_btn"
                          onClick={handleResetAllDetails}
                          title="Restore default account details"
                        >
                          Reset to Defaults
                        </button>
                      </div>

                      <div className="benef_content flt">
                        <ul>
                          {USER_FIELD_CONFIG.map((field) => {
                            const isEditing = editingField === field.key;
                            const currentValue = userDetails[field.key] || '';

                            return (
                              <li key={field.key} className="flex flt ng-star-inserted">
                                <span className="name">{field.label}</span>
                                <span className="colon">:</span>
                                <span className="values">
                                  {isEditing ? (
                                    <div className="field_input_wrapper">
                                      {field.type === 'select' ? (
                                        <select
                                          className="field_inline_select"
                                          value={editDraftValue}
                                          onChange={(e) => setEditDraftValue(e.target.value)}
                                          autoFocus
                                        >
                                          {field.options.map((opt) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      ) : field.type === 'textarea' ? (
                                        <textarea
                                          className="field_inline_textarea"
                                          rows={2}
                                          value={editDraftValue}
                                          onChange={(e) => setEditDraftValue(e.target.value)}
                                          placeholder={field.placeholder}
                                          autoFocus
                                        />
                                      ) : (
                                        <input
                                          type={field.type}
                                          className="field_inline_input"
                                          value={editDraftValue}
                                          onChange={(e) => setEditDraftValue(e.target.value)}
                                          placeholder={field.placeholder}
                                          autoFocus
                                        />
                                      )}

                                      {fieldError && <div className="field_inline_error">{fieldError}</div>}

                                      <div className="field_edit_actions">
                                        <button
                                          type="button"
                                          className="field_btn_save"
                                          onClick={() => handleSaveField(field.key)}
                                        >
                                          <i className="fa-solid fa-check"></i> Save
                                        </button>
                                        <button
                                          type="button"
                                          className="field_btn_cancel"
                                          onClick={cancelEditing}
                                        >
                                          <i className="fa-solid fa-xmark"></i> Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                      <span style={{ wordBreak: 'break-word', flex: 1 }}>{currentValue}</span>
                                      <button
                                        type="button"
                                        className="field_edit_trigger_btn"
                                        onClick={() => startEditing(field.key)}
                                        title={`Edit ${field.label}`}
                                        aria-label={`Edit ${field.label}`}
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                      </button>
                                    </span>
                                  )}
                                </span>
                              </li>
                            );
                          })}
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
                                src={pendingPreviewUrl || profilePhoto}
                                alt="Profile"
                                onError={(e) => {
                                  e.target.src = '/assets/images/student_profile.jpg';
                                }}
                              />
                            </div>
                          </div>

                          {photoError && (
                            <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>
                              {photoError}
                            </div>
                          )}

                          {/* Profile Picture Upload Options */}
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
                            {pendingPhotoFile ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="field_btn_save"
                                  onClick={handleSavePendingPhoto}
                                  id="savePhotoConfirmBtn"
                                  style={{ padding: '7px 16px', fontSize: '13.5px' }}
                                >
                                  <i className="fa-solid fa-check"></i> Save Photo
                                </button>
                                <button
                                  type="button"
                                  className="field_btn_cancel"
                                  onClick={handleCancelPendingPhoto}
                                  id="cancelPhotoConfirmBtn"
                                  style={{ padding: '7px 16px', fontSize: '13.5px' }}
                                >
                                  <i className="fa-solid fa-xmark"></i> Cancel
                                </button>
                                <span style={{ fontSize: '12.5px', color: '#0369a1', fontWeight: 600 }}>
                                  (Previewing: {pendingPhotoFile.name})
                                </span>
                              </div>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                            * Persisted privately in this browser's IndexedDB. Supports JPG, PNG, WebP (Max 5MB).
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
                          <td style={{ fontWeight: 600 }}>{userDetails.name}</td>
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
                      [Stored in IndexedDB • Active for "Download" button]
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
