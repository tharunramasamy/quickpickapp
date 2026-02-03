# QuickPick Frontend

A React + TypeScript frontend for a Blinkit/Instamart-style grocery platform with three roles:

Customer
Inventory staff
Delivery partner

All three share a common API layer, auth utilities, global store, and polling‑based “real‑time” updates.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Environment Configuration](#environment-configuration)
6. [Running the App](#running-the-app)
7. [Build & Deployment](#build--deployment)
8. [Core Modules](#core-modules)
9. [Application Flows](#application-flows)
10. [Troubleshooting](#troubleshooting)
11. [Future Improvements](#future-improvements)
12. [License](#license)

---

## Features

- Three separate role‑based UIs (customer, inventory, delivery) in a single codebase.
- Phone‑based login/signup with role routing.
- Product browsing with categories and stock display.
- Cart management and checkout.
- Stripe test payment integration.
- Order tracking with status timeline (PLACED → PICKED → OUT_FOR_DELIVERY → DELIVERED).
- Inventory dashboards for pending orders and stock management.
- Delivery dashboards for assigned orders, route/status handling.
- Polling‑based realtime updates (no WebSockets required).

---

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Zustand
- Stripe (`@stripe/react-stripe-js`)
- Recharts, `qrcode.react`
- CSS & CSS Modules

---

## Project Structure

```txt
quickpick-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Cart.tsx
│   │   └── ... (shared UI)
│   ├── services/
│   │   ├── api.ts          # Axios client + typed API wrappers
│   │   ├── auth.ts         # LocalStorage auth utilities
│   │   └── realtime.ts     # Polling-based realtime helper
│   ├── stores/
│   │   └── useStore.ts     # Global Zustand store (auth, cart, orders, UI)
│   ├── types/
│   │   └── index.ts        # Product, Order, User, etc.
│   ├── pages/
│   │   ├── customer/
│   │   │   ├── LoginSignup.tsx
│   │   │   ├── ProductListing.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── PaymentPage.tsx
│   │   │   ├── OrderTracking.tsx
│   │   │   └── Customer.css / *.module.css
│   │   ├── inventory/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PendingOrders.tsx
│   │   │   ├── InventoryManagement.tsx
│   │   │   └── *.module.css
│   │   └── delivery/
│   │       ├── Dashboard.tsx
│   │       ├── AssignedOrders.tsx
│   │       ├── OrderDetails.tsx
│   │       └── *.module.css
│   ├── config/
│   │   └── config.ts / index.ts   # Status colors, polling intervals, keys
│   ├── App.tsx                    # Main router + protected routes
│   └── main.tsx                   # React entry
├── index.html
├── vite.config.ts
├── package.json
└── README.md

# Installation
install dependencies
npm install

#Environment Configuration
Create a .env file in the project root:
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
VITE_API_BASE_URL – base URL for your backend (FastAPI/Django/etc).

VITE_STRIPE_PUBLIC_KEY – Stripe publishable key for test payments.

Restart the dev server after changing the .env file.

Running the App
Development:
npm run dev
Then open the URL printed in the terminal (typically http://localhost:5173).

Build & Deployment
Build
npm run build
