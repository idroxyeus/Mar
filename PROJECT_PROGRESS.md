# Project Progress: Marena Bengaluru Website Replica

## 1. Pages Implemented

### Page 1: Marena Bengaluru Login Interface
- Route: `/`, `/login`, `/bangalore-sports`
- Full-screen architectural photo background (`/assets/marena_bnglr.png`).
- Centered login card with `MARENA BENGALURU` title and `LOGIN` subtitle.
- Dynamic dropdown (`Staff`, `Student`, `Non-MAHE/Others`, `Guest`).
- Roll Number & Mobile Number input fields with red mandatory asterisks.
- "I agree to the MAHE Bengaluru Instructions" checkbox and modal.
- Uppercase `SUBMIT` button navigating to `/dashboard` without requiring server authentication.
- Outlined `BACK` button.
- Header and footer with branding and contact triggers.

### Page 2: Select Service Type Dashboard
- Route: `/dashboard`
- Active `DASHBOARD` link in header.
- Profile badge: `My Profile ▾` with circular avatar icon (`profile.png`).
- Profile dropdown with `ACCOUNT DETAILS` and `LOGOUT`.
- `SELECT SERVICE TYPE` heading in Teko typography.
- Marena Sports Complex card with sports hall photo (`sport.png`), gradient banner, hover animations, and navigation to `/bangalore-sports-complex`.

### Page 3: My Account / Account Details & Marena Tabs
- Route: `/my-account`
- **Inspect Element Alignment**:
  - Aligned markup with the authentic Angular components (`.acc_main`, `.menu_inside`, `.home_login`, `.nav_bar.acc_det`, `.details_main`, `.add_beneficiary`, `.benef_content`, `.upload_image`, `.alma_pic`).
  - Integrated student ID photo frame, saved locally as `/assets/images/student_profile.jpg`.
- **Header Navigation**:
  - Breadcrumb: `HOME/` linking to `/dashboard` + `ACCOUNT DETAILS`.
  - Tabs: `ACCOUNT DETAILS` and `MARENA` with `.underline` accent and border styling.
- **Tab 1 — ACCOUNT DETAILS**:
  - **Left Card (`Your Details`)**:
    - Textured card background (`my_detail_background.png`) with `#FFE1C3` border.
    - Fields accurately mapped with inline editing and persistent storage:
      - Employee Code: `235809142`
      - Name: `KARTHIK REDDY M`
      - Email: `karthik.reddy.hyd26@gmail.com`
      - Mobile Number: `9849123456`
      - Gender: `Male`
      - Date Of Birth: `12-05-2005`
      - Address: `Plot No. 42, Sri Sai Nagar Colony, Near Uppal Metro Station, Uppal, Hyderabad, Telangana, India, 500039`
      - Institution Name: `Manipal Institute of Technology, Bengaluru MAHE Bengaluru Campus, Karnataka,India`
    - **Inline Field Editing**:
      - Each field features its own edit trigger button, inline input/select/textarea, and dedicated Save / Cancel controls.
      - Real-time client-side validation for email format, phone digits (7-15 digits), and date format (DD-MM-YYYY).
      - Persistent `localStorage` storage under key `marena_user_profile_data`.
      - "Reset to Defaults" option restores original anonymous Uppal Hyderabad default values.
  - **Right Card (`Profile Picture`)**:
    - Authentic student ID photo frame (`169px x 169px`).
    - **Photo Upload & IndexedDB Persistence**:
      - `Upload New Photo` button allowing the user to select JPEG, PNG, or WebP images (max 5MB).
      - Immediate preview before saving with dedicated `Save Photo` and `Cancel` controls.
      - Persisted as binary `Blob` in `IndexedDB` (`MarenaPortalDB`, store `binary_assets`) to prevent localStorage quota exhaustion.
      - Restores automatically on page reload and synchronizes with the header profile badge across navigation.
      - `Reset to Default Photo` removes the custom image from IndexedDB and restores the fallback student ID photo.
- **Tab 2 — MARENA**:
  - **Notice Banner**:
    - `PLEASE UPDATE THE BIOMETRIC DATA AFTER SUCCESSFUL PAYMENT WITH RECEIPT AT MARENA RECEIGN COUNTER.`
  - **Transactions Table**:
    - Formatted with table classes matching the production portal and horizontal scrollbar (`min-width: 1100px`).
    - Alternating row styling (`#ffffff` / `#f7f9fa`).
    - Dynamically reflects the user's saved Name across all table rows.
    - **Row 1 (New)**: `order_T5sN8RE1Pw9yZk` | `MARBLR6821` | `GYM` | `1 Month` | `10/10/2026` | `09/11/2026` | `₹2,000` | Download Receipt.
    - **Row 2**: `order_S3rK3QDOPvuBTc` | `MARBLR4764` | `GYM` | `1 Month` | `14/01/2026` | `13/02/2026` | `₹2,000` | Download Receipt.
    - **Row 3**: `order_R2alxDV0ju8zw` | `MARBLR1508` | `GYM` | `1 Month` | `07/08/2025` | `06/09/2025` | `₹2,000` | Download Receipt.
  - **Custom Receipt File Attachment & IndexedDB Persistence**:
    - Upload controller at the bottom allows uploading any custom receipt file (PDF, PNG, JPG, up to 10MB).
    - Persisted as binary `Blob` with metadata in `IndexedDB` (`MarenaPortalDB`).
    - Clicking the orange **Download** button on any table row downloads that exact attached file.
    - Automatic fallback: If no custom file is attached, an official formatted MARENA payment receipt text document is generated using the user's saved personal details.

---

## 2. Routes Created
| Route Path | Component | Status | Description |
| :--- | :--- | :--- | :--- |
| `/` | `LoginPage` | Complete | Default homepage / login |
| `/login` | `LoginPage` | Complete | Explicit login route |
| `/bangalore-sports` | `LoginPage` | Complete | Production alias for login |
| `/dashboard` | `DashboardPage` | Complete | Select Service Type dashboard |
| `/my-account` | `MyAccountPage` | Complete | User profile & Marena membership records |
| `/bangalore-sports-complex` | `BlrSportsComplexPage` | Placeholder | Next step in sports complex flow |
| `/registration` | `RegistrationPage` | Placeholder | Guest registration |
| `/rules-and-regulation` | `RulesPage` | Placeholder | Rules and regulations of Marena |
| `/help` | `HelpPage` | Placeholder | Payment issues support |
| `*` | Fallback | Complete | Redirects unmatched routes to `/` |

---

## 3. Shared Components
- `Header.jsx`:
  - Renders MAHE Bengaluru logo.
  - Automatically highlights active nav link (`DASHBOARD` on dashboard).
  - Displays `My Profile ▾` dropdown with `ACCOUNT DETAILS` and `LOGOUT`.
  - Displays uploaded user photo in profile badge across pages.
  - Triggers Contact Us modal.
- `Footer.jsx`:
  - 3-column footer with contact links, rules, and payment help.
- `ContactModal.jsx`:
  - Official contact details for Marena Bengaluru, Sports Department, and Finance.
- `InstructionsModal.jsx`:
  - Facility guidelines and entry instructions.

---

## 4. Responsive Design & Cross-Browser Compatibility
- **Mobile Navigation Drawer**:
  - Implemented authentic mobile menu (`#mobileMenu`) matching the original portal.
  - Hamburger toggle button (`fa-bars`) displayed on viewport widths < 768px.
  - Slide-out drawer with backdrop, close button (`fa-xmark`), and touch-optimized navigation links with icons (`HOME`, `DASHBOARD`, `CONTACT US`, `MY PROFILE`, `LOGOUT`).
- **Layout & Viewport**:
  - Added `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` and theme-color in `index.html`.
  - Stacking cards for `col-sm-6` on tablets and mobile phones.
  - User details list (`.name`, `.colon`, `.values`) automatically reflows on narrow mobile displays (down to 320px) without breaking or text clipping.
- **Cross-Browser Standards**:
  - Set input/select font-size to `16px` on mobile to prevent auto-zoom in iOS Safari.
  - Configured `-webkit-overflow-scrolling: touch` for momentum scrolling on mobile browsers.
  - Fully tested on Chromium (Chrome/Edge), WebKit (Safari), and Gecko (Firefox).

---

## 5. Production Deployment Preparation
- **Build Output**: Clean Vite production bundle (`dist/`) generated with 0 errors.
- **SPA Fallback Rewrites**:
  - Created `vercel.json` with rewrite rules for Vercel.
  - Created `public/_redirects` (`/* /index.html 200`) for Netlify.
  - Eliminates 404 errors on direct navigation or page refreshes.
- **Documentation**: Detailed instructions documented in `DEPLOYMENT_GUIDE.md`.

---

## 6. Pending Work & Next Step
- Awaiting the next page reference from user (e.g. `/bangalore-sports-complex` facility selection / booking).
