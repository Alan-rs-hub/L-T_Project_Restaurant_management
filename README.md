# DineFlow — Restaurant Management & Table Reservation System

A full-stack, secure, modular Restaurant Management and Table Reservation System built for **Christ University 5th Semester CIA-3 Academic Evaluation**.

Developed with **Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, and Bootstrap 5** following clean **MVC Architecture**.

---

## 🌟 Key Highlights & Features

1. **Role-Based Access Control (RBAC)**: Secure access tailored for `customer`, `kitchen`, `manager`, and `admin` roles.
2. **Multi-Branch & Table Inventory**: Independent table layouts, capacities, and active states per branch.
3. **Table Reservation Engine**: Real-time table conflict/overlap detection, party capacity checks, and 1-hour cancellation policy enforcement.
4. **Order State Machine**: Strictly enforced status workflow (`placed` → `preparing` → `ready` → `served` / `delivered`), with cancellation permitted only in `placed` state.
5. **Server-Side Itemized Billing**: Subtotal, Tax (5%), and Service Charge (10%) calculated deterministically on the server.
6. **Live Kitchen Display System (KDS)**: Real-time 3-stage kitchen queue with auto-refresh and sound alerts.
7. **Manager Analytics & Aggregations**: Revenue by branch, top-selling dishes, peak ordering hours, and customer feedback.
8. **Interactive Dark Glassmorphism UI**: Polished, responsive Bootstrap 5 interface with live cart, booking flow, and modals.

---

## 🏗️ Architecture & Project Structure

```
├── config/
│   └── db.js                 # MongoDB Mongoose connection handler
├── controllers/
│   ├── authController.js     # Register, login, get profile
│   ├── branchController.js   # Branch CRUD operations
│   ├── tableController.js    # Table inventory CRUD
│   ├── menuController.js     # Menu items CRUD & category filtering
│   ├── reservationController.js # Real-time table search, booking, rescheduling, cancel
│   ├── orderController.js    # Order placement, workflow transitions, customer & kitchen queues
│   ├── feedbackController.js # Post-dining feedback & reviews
│   └── reportController.js   # Aggregations for sales, peak hours, popular dishes
├── middleware/
│   ├── auth.js               # JWT authentication & role-based authorization guard
│   ├── validate.js           # Joi input validation schemas & ObjectId validators
│   └── errorHandler.js       # Centralized error handler (Joi, Mongo 11000, CastError, JWT)
├── models/
│   ├── User.js               # User model with bcrypt hashing & safe JSON serialization
│   ├── Branch.js             # Restaurant branch details & capacity
│   ├── Table.js              # Table number, capacity, and compound branch index
│   ├── MenuItem.js           # Menu items with price, category, availability
│   ├── Reservation.js        # Reservation slots, duration, party size, status
│   ├── Order.js              # Embedded billed items, status enum, order numbers
│   └── Feedback.js           # 1-5 star ratings & comments linked to orders
├── routes/
│   ├── authRoutes.js
│   ├── branchRoutes.js
│   ├── tableRoutes.js
│   ├── menuRoutes.js
│   ├── reservationRoutes.js
│   ├── orderRoutes.js
│   ├── feedbackRoutes.js
│   └── reportRoutes.js
├── utils/
│   ├── token.js              # JWT token generator & verifier
│   ├── calculations.js       # Server-side tax, service charge, billing math
│   └── pagination.js         # Standard pagination & metadata generator
├── public/                   # Static Frontend Client
│   ├── css/style.css         # Dark theme & custom component styling
│   ├── js/api.js             # Unified API client & utility helpers
│   ├── js/auth.js            # Auth state, session guard, dynamic navigation
│   ├── index.html            # Landing page with live metric counters
│   ├── login.html            # Login with quick demo auto-fill buttons
│   ├── register.html         # User registration
│   ├── menu.html             # Menu browsing, category filter, customer cart, admin CRUD
│   ├── reservation.html      # Availability search, booking, rescheduling, cancellation
│   ├── orders.html           # Order history, itemized bills, customer review modal
│   ├── kitchen.html          # Real-time Kitchen Display System (KDS) board
│   └── dashboard.html        # Manager & Admin analytics, branch/table management
├── seeds/
│   └── seed.js               # Database seeder with complete demo dataset
├── .env                      # Environment variables
├── package.json              # Project metadata & npm dependencies
└── server.js                 # Express application entry point
```

---

## 🔑 Demo Accounts

Use these pre-configured accounts (or use the one-click demo buttons on `/login.html`):

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Admin** | `admin@dineflow.com` | `admin123` | Full system access, branch/table CRUD, reports, menu, orders |
| **Manager** | `manager@dineflow.com` | `manager123` | Analytics, menu management, table inventory, orders, KDS |
| **Kitchen Staff** | `kitchen@dineflow.com` | `kitchen123` | Kitchen Display System (KDS) live queue |
| **Customer 1** | `customer@dineflow.com` | `customer123` | Book tables, place orders, view order history, feedback |
| **Customer 2** | `priya@dineflow.com` | `customer123` | Book tables, place orders, view order history, feedback |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** running locally on `mongodb://localhost:27017` (or MongoDB Atlas URI in `.env`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
Populate branches, tables, menu items, reservations, orders, and demo accounts:
```bash
npm run seed
```

### 4. Run the Server
```bash
npm start
# OR for development with hot reload:
npm run dev
```

The application will be accessible at: **`http://localhost:5001`**

---

## 📑 API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`, `phone`, `role`)
- `POST /api/auth/login` — Login & receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile

### Branches (`/api/branches`)
- `GET /api/branches` — List active branches (Public)
- `GET /api/branches/:id` — Get single branch
- `POST /api/branches` — Create branch (`admin` only)
- `PUT /api/branches/:id` — Update branch (`admin` only)
- `DELETE /api/branches/:id` — Delete branch (`admin` only)

### Table Inventory (`/api/tables`)
- `GET /api/tables` — List tables by branch
- `GET /api/tables/available` — Search available tables by `branchId`, `dateTime`, `partySize`, `duration`
- `POST /api/tables` — Add table (`admin` only)
- `PUT /api/tables/:id` — Edit table (`admin` only)
- `DELETE /api/tables/:id` — Delete table (`admin` only)

### Menu (`/api/menu`)
- `GET /api/menu` — Search & filter menu items (Public)
- `GET /api/menu/:id` — Get menu item details
- `POST /api/menu` — Add dish (`admin`, `manager`)
- `PUT /api/menu/:id` — Update dish / toggle availability (`admin`, `manager`)
- `DELETE /api/menu/:id` — Delete dish (`admin`, `manager`)

### Reservations (`/api/reservations`)
- `POST /api/reservations` — Book table (checks time overlap & capacity)
- `GET /api/reservations` — List reservations (Customer sees own; Admin/Manager sees all)
- `GET /api/reservations/:id` — Get reservation details
- `PUT /api/reservations/:id` — Reschedule booking
- `DELETE /api/reservations/:id` — Cancel booking (enforces 1-hour notice for customers)

### Orders & Kitchen (`/api/orders`, `/api/kitchen`)
- `POST /api/orders` — Place order (validates stock, calculates server-side billing)
- `GET /api/orders` — List orders
- `GET /api/orders/:id` — Get order invoice & details
- `PUT /api/orders/:id/status` — State transition (`placed` → `preparing` → `ready` → `served`/`delivered`)
- `GET /api/kitchen/orders` — Active kitchen queue (`kitchen`, `admin`, `manager`)

### Feedback (`/api/feedback`)
- `POST /api/feedback` — Submit 1-5 star review for completed order (`customer`)
- `GET /api/feedback` — List reviews

### Reports & Analytics (`/api/manager/reports`)
- `GET /api/manager/reports/overview` — KPI metrics
- `GET /api/manager/reports/sales` — Revenue aggregation by branch
- `GET /api/manager/reports/popular-dishes` — Most frequently ordered items
- `GET /api/manager/reports/peak-hours` — Activity distribution by hour

---

## 🛡️ Business Rule Enforcements

1. **Table Conflict Prevention**: Ensures no double bookings for overlapping time windows on the same table.
2. **Order State Validation**: Disallows jumping status steps (e.g. `placed` cannot go directly to `delivered`).
3. **Menu Item Verification**: Disallows ordering items marked `isAvailable: false` or items from a different branch.
4. **Cancellation Policy**: Prevents customers from cancelling reservations less than 60 minutes prior to booking time.
5. **Secure Cryptography**: Passwords salted & hashed with `bcryptjs` (10 rounds), stripped from all API outputs.
