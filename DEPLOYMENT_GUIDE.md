# Production Deployment Guide: MAHE Marena Bengaluru Replica

This guide outlines how to build, test, and deploy the frontend-only replica of the **Manipal Academy of Higher Education (MAHE) Marena Bengaluru** portal to production for a publicly accessible HTTPS URL.

---

## 1. Project Architecture & Pre-requisites

- **Framework**: React 19 + Vite + React Router (v7).
- **Styling**: Vanilla CSS + Authentic Angular styles + Bootstrap 4 grid utilities + Font Awesome 6.
- **Backend Dependency**: **None**. The application is strictly frontend-only, self-contained, and uses browser `localStorage` for state persistence (e.g., custom avatar and custom receipt attachments).
- **Node.js Requirement**: Node.js 18+ or 20+ (LTS).

---

## 2. Local Production Build Verification

Before deploying, verify that the production bundle builds cleanly:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Compile production bundle
npm run build

# 3. Preview production bundle locally
npm run preview
```

The output will be generated in the `dist/` directory.

---

## 3. Deploying to Vercel (Recommended)

Vercel is the recommended hosting platform for Vite React Single Page Applications.

### Method A: Via GitHub Integration (Automated CI/CD)

Since your code is already pushed to GitHub at [https://github.com/idroxyeus/Mar](https://github.com/idroxyeus/Mar):

1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Under **"Import Git Repository"**, locate and select **`idroxyeus/Mar`**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.
6. Within ~30 seconds, Vercel will provide you with a production HTTPS URL (e.g., `https://mar-seven.vercel.app`).

### SPA Route Handling on Vercel:
The project includes a root `vercel.json` file:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
> [!NOTE]
> This rewrite rule ensures that refreshing any nested URL (such as `/dashboard` or `/my-account?tab=marena`) correctly serves the application without triggering a 404 error.

---

## 4. Deploying to Netlify (Alternative)

### Via Netlify Web Dashboard:
1. Log in to [https://app.netlify.com/](https://app.netlify.com/) with your GitHub account.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Select **GitHub** and authorize **`idroxyeus/Mar`**.
4. Configure Build Settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**.

### SPA Route Handling on Netlify:
The project includes `public/_redirects` which automatically copies into `dist/_redirects` during build:
```
/*    /index.html   200
```
This guarantees flawless client-side routing on Netlify.

---

## 5. Instant Terminal Deployment (Vercel CLI)

If you prefer to deploy directly from your local terminal:

```bash
npx vercel
```
1. Follow the interactive prompts (confirm defaults by pressing Enter).
2. For production release, run:
```bash
npx vercel --prod
```

---

## 6. Responsive & Cross-Browser Audit Summary

The site has been audited and tested across:
- **Desktop & Laptop** (1280px+): Full widescreen layouts, hover states, textured cards, profile dropdowns.
- **Tablets** (768px – 1024px): Responsive 2-column stacking, touch-enabled modals.
- **Mobile Phones** (320px – 480px, e.g. iPhone, Android):
  - Viewport meta tag configured with `viewport-fit=cover`.
  - Input font-size set to `16px` to prevent automatic zoom on iOS Safari.
  - Slide-out mobile navigation drawer (`#mobileMenu`) accessible via the header hamburger button.
  - Horizontal scroll container (`-webkit-overflow-scrolling: touch`) for data tables.
  - 44px+ touch targets for interactive elements.
- **Cross-Browser Verification**:
  - Google Chrome & Microsoft Edge (Blink)
  - Mozilla Firefox (Gecko)
  - Apple Safari on macOS and iOS (WebKit)
