# Continuous Internal Assessment - 3 (CIA-3) Project Report
## Advanced JavaScript Backend Frameworks (Node.js & Express JS)
### Department of Computer Science • Christ University (in partnership with L&T EduTech)

---

## 📋 Mandatory Team Details

* **Project Code & Title**: `P07` — DineFlow: Multi-Branch Restaurant Management & Table Reservation System
* **Course Name**: Advanced JavaScript Backend Frameworks (Node.js & Express JS)
* **Semester**: 5th Semester
* **Section / Batch**: Batch 47 (4)
* **Submission Date**: September 10, 2026

### Team Members

| S.No | Student Name | Roll No. / Reg No. | Department | Section / Batch |
|:---:|:---|:---:|:---:|:---:|
| 1 | **ALAN R S** | *(Lead Developer)* | Computer Science | Batch 47 (4) |
| 2 | Team Member 2 | *(Roll No.)* | Computer Science | Batch 47 (4) |
| 3 | Team Member 3 | *(Roll No.)* | Computer Science | Batch 47 (4) |
| 4 | Team Member 4 *(if applicable)* | *(Roll No.)* | Computer Science | Batch 47 (4) |

---

## 🔗 GitHub Repository Link

* **Public Repository**: [https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management](https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management)
* **Live Deployment / Local URL**: `http://localhost:5001`
* **API Endpoint Base**: `http://localhost:5001/api`

---

## 1. Executive Summary & Project Overview

### 1.1 Problem Statement
Modern dining establishments often face operational friction due to disjointed tools for reservations, dynamic kitchen order routing, itemized billing, and multi-branch catalog management. Conventional standalone applications fail to enforce critical business constraints—such as preventing table overbooking, restricting unauthorized order state jumps, and guaranteeing unalterable server-side financial calculations.

### 1.2 Solution Overview
**DineFlow** is a modular, corporate-grade Restaurant Management and Table Reservation platform engineered with **Node.js, Express.js, MongoDB (Mongoose), JWT authentication, bcrypt password hashing, and Bootstrap 5**. Built strictly adhering to the **Model-View-Controller (MVC)** architectural paradigm, DineFlow seamlessly unifies customer bookings, branch inventory, real-time Kitchen Display Systems (KDS), automated itemized billing, and executive analytics.

### 1.3 Target Roles & User Access
1. **Customer**: Search branch menus, verify real-time table availability, make/reschedule/cancel reservations, place dine-in/takeaway orders, review itemized bills, and submit star ratings.
2. **Kitchen Staff**: Access a live 3-stage Kitchen Display Queue (*Placed → Preparing → Ready*) with audio alerts and one-click order state transitions.
3. **Branch Manager**: Manage dishes, toggle stock availability, view peak operating hours, and analyze popular dishes.
4. **System Administrator**: Full control over branch creation, table inventory allocations, system-wide revenue reports, and all platform operations.

---

## 2. Technology Stack & Architecture

### 2.1 Technology Specifications

* **Runtime Environment**: Node.js (v16+)
* **Backend Framework**: Express.js (v4.21.0)
* **Database & ODM**: MongoDB with Mongoose (v8.6.0) + Embedded Memory Fallback (`mongodb-memory-server`)
* **Authentication**: JSON Web Tokens (`jsonwebtoken` v9.0.2) + Passwords hashed via `bcryptjs` (12 salt rounds)
* **Request Validation**: Schema-based validation using Joi (`joi` v17.13.3)
* **Middleware**: Morgan (HTTP logging), CORS (Cross-Origin Resource Sharing), custom centralized error handlers
* **Frontend**: Responsive HTML5, Vanilla CSS3 (Dark Glassmorphism UI), JavaScript ES6+, Bootstrap 5.3.2, Bootstrap Icons
* **API Testing**: Postman Collection (v2.1.0)

### 2.2 Directory & MVC Structure

```
L-T_Project_Restaurant_management/
├── config/
│   └── db.js                 # Mongoose DB connector with automated embedded fallback & auto-seed
├── controllers/
│   ├── authController.js     # User registration, login, and profile fetching
│   ├── branchController.js   # Branch creation and maintenance
│   ├── tableController.js    # Table inventory and capacity allocation
│   ├── menuController.js     # Branch-specific menu CRUD and category filters
│   ├── reservationController.js # Real-time table search, conflict prevention, booking, cancel
│   ├── orderController.js    # Order processing, state machine transitions, kitchen queue
│   ├── feedbackController.js # Customer reviews and ratings
│   └── reportController.js   # MongoDB aggregation pipelines for revenue and analytics
├── middleware/
│   ├── auth.js               # JWT verification and Role-Based Access Control (RBAC) guard
│   ├── validate.js           # Joi validation schemas and MongoDB ObjectId sanitizers
│   └── errorHandler.js       # Centralized error handler for Mongoose, Joi, JWT, and custom errors
├── models/
│   ├── User.js               # User schema with bcrypt pre-save hashing & toJSON transform
│   ├── Branch.js             # Restaurant branch entity
│   ├── Table.js              # Table number, capacity, and compound branch unique index
│   ├── MenuItem.js           # Menu items with price, category, and availability flag
│   ├── Reservation.js        # Table reservations with duration, party size, and status
│   ├── Order.js              # Embedded billed items, status enum, order numbers, and billing subdoc
│   └── Feedback.js           # 1-to-1 order feedback rating (1-5) and comments
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── branchRoutes.js       # /api/branches
│   ├── tableRoutes.js        # /api/tables
│   ├── menuRoutes.js         # /api/menu
│   ├── reservationRoutes.js  # /api/reservations
│   ├── orderRoutes.js        # /api/orders, /api/kitchen, /api/customers
│   ├── feedbackRoutes.js     # /api/feedback
│   └── reportRoutes.js       # /api/manager/reports
├── utils/
│   ├── token.js              # JWT generator and token verification utilities
│   ├── calculations.js       # Deterministic billing math (subtotal, tax, service charge, grand total)
│   └── pagination.js         # Pagination helper and metadata generator
├── public/                   # Client-Side Application
│   ├── css/style.css         # Custom dark theme and glassmorphic design tokens
│   ├── js/api.js             # Client API wrapper and notification toasts
│   ├── js/auth.js            # Auth session management and dynamic role navigation
│   ├── index.html            # Landing page with live metric counters
│   ├── login.html            # Sign-in with 1-click demo credential buttons
│   ├── register.html         # User registration form
│   ├── menu.html             # Menu catalog, search, category pills, customer cart, admin CRUD
│   ├── reservation.html      # Real-time table finder, booking, reschedule, and cancellation
│   ├── orders.html           # Live order tracking, itemized invoices, feedback review modal
│   ├── kitchen.html          # Real-time 3-stage Kitchen Display System (KDS) board
│   └── dashboard.html        # Manager/Admin portal for sales analytics, branches, and tables
├── seeds/
│   └── seed.js               # Database seeder with realistic demo datasets
├── .env.example              # Environment variable template
├── package.json              # Project dependencies and npm scripts
├── postman_collection.json   # Exported Postman collection for evaluation
├── README.md                 # Project documentation
└── server.js                 # Main Express server entry point
```

---

## 3. Database Design & Mongoose Schemas

The database schema comprises **7 collections** designed with referential integrity, compound indexes for fast lookups, and subdocument embedding for billing history.

```
+-----------------------------------------------------------------------------------+
|                                  ENTITY RELATIONSHIPS                              |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +-------------------+          +-------------------+                            |
|   |      Branch       | 1      * |       Table       |                            |
|   |-------------------|----------|-------------------|                            |
|   | _id               |          | _id               |                            |
|   | name              |          | branchId (Ref)    |                            |
|   | address           |          | tableNumber       |                            |
|   | seatingCapacity   |          | capacity          |                            |
|   | isActive          |          | isActive          |                            |
|   +-------------------+          +-------------------+                            |
|             | 1                            | 1                                    |
|             |                              |                                      |
|             | *                            | *                                    |
|   +-------------------+          +-------------------+                            |
|   |     MenuItem      |          |    Reservation    |                            |
|   |-------------------|          |-------------------|                            |
|   | _id               |          | _id               |                            |
|   | branchId (Ref)    |          | customerId (Ref)  |-------\                    |
|   | name              |          | branchId (Ref)    |       |                    |
|   | category          |          | tableId (Ref)     |       |                    |
|   | price             |          | dateTime          |       |                    |
|   | isAvailable       |          | duration          |       |                    |
|   +-------------------+          | partySize         |       |                    |
|             | 1                  | status            |       |                    |
|             |                    +-------------------+       |                    |
|             | *                                              |                    |
|   +-------------------+          +-------------------+       |   +------------+   |
|   |    Order.items    | *      1 |       Order       | 1   * |   |    User    |   |
|   |-------------------|----------|-------------------|-------+---|------------|   |
|   | menuItemId (Ref)  |          | _id               |       |   | _id        |   |
|   | name              |          | customerId (Ref)  |-------/   | name       |   |
|   | price             |          | branchId (Ref)    |           | email      |   |
|   | quantity          |          | orderType         |           | password   |   |
|   | itemTotal         |          | status            |           | role       |   |
|   +-------------------+          | billing (Subdoc)  |           +------------+   |
|                                  +-------------------+                 | 1        |
|                                            | 1                         |          |
|                                            |                           |          |
|                                            | 1                         | *        |
|                                  +-------------------+                 |          |
|                                  |     Feedback      |-----------------/          |
|                                  |-------------------|                            |
|                                  | _id               |                            |
|                                  | orderId (Unique)  |                            |
|                                  | customerId (Ref)  |                            |
|                                  | rating (1 - 5)    |                            |
|                                  | comment           |                            |
|                                  +-------------------+                            |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### Schema Definitions Summary:
1. **`User`**: `name`, `email` (unique), `passwordHash` (salted bcrypt), `role` (`customer`, `kitchen`, `manager`, `admin`).
2. **`Branch`**: `name`, `address`, `seatingCapacity`, `isActive`.
3. **`Table`**: `branchId` (Ref: Branch), `tableNumber`, `capacity`, `isActive`. Compound index `{ branchId: 1, tableNumber: 1 }` guarantees unique table numbers within each branch.
4. **`MenuItem`**: `branchId` (Ref: Branch), `name`, `category` (enum: *appetizer, main_course, dessert, beverage, side, soup, salad, special*), `price`, `description`, `isAvailable`.
5. **`Reservation`**: `customerId` (Ref: User), `branchId` (Ref: Branch), `tableId` (Ref: Table), `dateTime`, `duration` (mins), `partySize`, `status` (*confirmed, completed, cancelled, no_show*), `specialRequests`.
6. **`Order`**: `orderNumber` (unique format `ORD-<timestamp>-<rand>`), `customerId` (Ref: User), `branchId` (Ref: Branch), `orderType` (*dine_in, takeaway*), `tableId` (Ref: Table, optional), `items` (`[orderItemSchema]`), `billing` (`{ subtotal, tax, serviceCharge, grandTotal }`), `status` (*placed, preparing, ready, served, delivered, cancelled*).
7. **`Feedback`**: `orderId` (Ref: Order, unique compound index), `customerId` (Ref: User), `rating` (1 to 5), `comment`.

---

## 4. Implemented Functional Modules (All 13 Modules)

| Module # | Module Name | Primary Role(s) | Key Implementation & Logic |
|---|---|---|---|
| **Module 1** | **User Authentication & Authorization** | All Roles | JWT Bearer token generation, bcrypt 12-salt password hashing, role guard middleware (`customer`, `kitchen`, `manager`, `admin`). |
| **Module 2** | **Restaurant Branch Management** | Admin | Full CRUD on restaurant physical branches with seating capacity, address, and status toggles. |
| **Module 3** | **Table Inventory Management** | Admin | Table allocation with individual seating capacities; compound uniqueness prevents duplicate table numbers in a branch. |
| **Module 4** | **Menu & Category Management** | Admin, Manager | Branch-specific menus across 8 distinct categories, real-time availability toggling, and search index. |
| **Module 5** | **Real-Time Table Reservation** | Customer | Automated table conflict/overlap detection algorithm: `(start < existEnd && end > existStart)`. Party size validation against seating capacity. |
| **Module 6** | **Food Ordering Engine** | Customer | Validates item stock availability and branch affinity before accepting order; supports dine-in and takeaway. |
| **Module 7** | **Order State Workflow Machine** | System, Kitchen | Strictly enforced state transitions: `placed → preparing → ready → served / delivered`. Cancellation only allowed in `placed` state. |
| **Module 8** | **Kitchen Display System (KDS)** | Kitchen, Manager | 3-column real-time order queue with status categorization, auto-refresh every 10s, and Web Audio API chime on new orders. |
| **Module 9** | **Itemized Billing Engine** | System | Deterministic server-side calculation: `Subtotal + 5% Tax + 10% Service Charge = Grand Total`. Zero client trust. |
| **Module 10** | **Cancellation & Reschedule Policy** | Customer, Admin | Customers are barred from cancelling reservations with less than 60 minutes notice. Admins retain override authority. |
| **Module 11** | **Customer Order History** | Customer | Real-time invoice tracking, itemized cost breakdown, and status timeline. |
| **Module 12** | **Customer Feedback & Reviews** | Customer | 1–5 star rating submission permitted exclusively for completed (`served` or `delivered`) orders; duplicate feedback blocked. |
| **Module 13** | **Manager Analytics & Aggregations** | Manager, Admin | MongoDB `$facet` and aggregation pipelines for revenue by branch, popular dishes ranking, peak hour distributions, and KPI metrics. |

---

## 5. Core Business Rules & Validations

1. **Table Double-Booking Prevention**:
   ```javascript
   // Overlap condition: (newStart < existingEnd) && (newEnd > existingStart)
   const overlap = await Reservation.findOne({
     tableId,
     status: 'confirmed',
     dateTime: { $lt: newEnd },
     $expr: { $gt: [{ $add: ['$dateTime', { $multiply: ['$duration', 60000] }] }, newStart] }
   });
   ```
2. **Order State Machine Guard**:
   ```javascript
   const VALID_TRANSITIONS = {
     placed: ['preparing', 'cancelled'],
     preparing: ['ready'],
     ready: ['served', 'delivered'],
     served: [], delivered: [], cancelled: []
   };
   ```
3. **Reservation Cancellation Window**:
   ```javascript
   const hoursUntil = (new Date(reservation.dateTime) - new Date()) / (1000 * 60 * 60);
   if (hoursUntil < 1 && req.user.role === 'customer') {
     throw new AppError('Reservations cannot be cancelled less than 1 hour before scheduled time', 409);
   }
   ```
4. **Server-Side Financial Security**:
   All billing calculations are strictly executed on the server using `utils/calculations.js`. Client-submitted totals are ignored to prevent financial manipulation.

---

## 6. REST API Endpoint Reference

### 6.1 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register user account (Public)
* `POST /api/auth/login` — Sign in and obtain JWT token (Public)
* `GET /api/auth/me` — Retrieve current authenticated profile (Authenticated)

### 6.2 Branches & Tables (`/api/branches`, `/api/tables`)
* `GET /api/branches` — List all active branches (Public)
* `POST /api/branches` — Create branch (`admin`)
* `PUT /api/branches/:id` — Update branch (`admin`)
* `DELETE /api/branches/:id` — Remove branch (`admin`)
* `GET /api/tables` — List tables by branch (Authenticated)
* `GET /api/tables/available` — Query available tables by date, time, duration, and party size (Authenticated)
* `POST /api/tables` — Add table (`admin`)
* `PUT /api/tables/:id` — Edit table (`admin`)
* `DELETE /api/tables/:id` — Delete table (`admin`)

### 6.3 Menu Management (`/api/menu`)
* `GET /api/menu` — Query menu with search and category filters (Public)
* `GET /api/menu/:id` — Get dish details (Public)
* `POST /api/menu` — Create dish (`admin`, `manager`)
* `PUT /api/menu/:id` — Update dish / toggle stock (`admin`, `manager`)
* `DELETE /api/menu/:id` — Delete dish (`admin`, `manager`)

### 6.4 Reservations (`/api/reservations`)
* `POST /api/reservations` — Book table with conflict check (`customer`)
* `GET /api/reservations` — List reservations (Customer sees own, Admin/Manager sees all)
* `PUT /api/reservations/:id` — Reschedule booking (`customer`, `admin`)
* `DELETE /api/reservations/:id` — Cancel booking with 1-hour policy check (`customer`, `admin`)

### 6.5 Orders & Kitchen (`/api/orders`, `/api/kitchen`)
* `POST /api/orders` — Place order with server billing calculation (`customer`)
* `GET /api/orders` — List orders (`customer` sees own, `admin`/`manager` sees all)
* `GET /api/orders/:id` — Retrieve itemized order invoice (Authenticated)
* `PUT /api/orders/:id/status` — Advance state transition (`kitchen`, `admin`, `manager`)
* `GET /api/kitchen/orders` — Live kitchen queue (`kitchen`, `admin`, `manager`)

### 6.6 Feedback & Reports (`/api/feedback`, `/api/manager/reports`)
* `POST /api/feedback` — Submit star review for completed order (`customer`)
* `GET /api/feedback` — List reviews (Public/Authenticated)
* `GET /api/manager/reports/overview` — High-level KPI metrics (`manager`, `admin`)
* `GET /api/manager/reports/sales` — Revenue aggregation by branch (`manager`, `admin`)
* `GET /api/manager/reports/popular-dishes` — Most ordered items ranking (`manager`, `admin`)
* `GET /api/manager/reports/peak-hours` — Hourly traffic breakdown (`manager`, `admin`)

---

## 7. Setup & Execution Guide

### 7.1 Installation
```bash
# 1. Clone the repository
git clone https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management.git
cd L-T_Project_Restaurant_management

# 2. Install dependencies
npm install

# 3. Populate database with complete demo dataset
npm run seed

# 4. Start the application
npm start
```

### 7.2 Pre-Configured Demo Credentials
* **Admin**: `admin@dineflow.com` / `admin123`
* **Manager**: `manager@dineflow.com` / `manager123`
* **Kitchen Staff**: `kitchen@dineflow.com` / `kitchen123`
* **Customer**: `customer@dineflow.com` / `customer123`
* **Customer 2**: `priya@dineflow.com` / `customer123`

---

## 8. Verification & Test Walkthrough

The project was validated using both automated API test suites via Postman and full end-to-end browser walkthroughs:
1. **Authentication Tests**: Verified JWT generation, password verification, and role guards for unauthorized paths.
2. **Reservation Conflict Tests**: Attempted overlapping bookings on the same table for conflicting time windows; system properly returned `409 RESERVATION_CONFLICT`.
3. **Order State Transition Tests**: Validated that `placed` orders transition smoothly through `preparing` → `ready` → `served/delivered`, and illegal jumps (e.g. `placed` directly to `served`) are blocked with `409 INVALID_STATUS_TRANSITION`.
4. **Billing Tests**: Item pricing and multipliers verified against 5% tax and 10% service charge rules.
5. **Postman Collection**: All 30+ endpoints exported to [`postman_collection.json`](file:///Users/alan/Documents/L&T_project5th_sem/postman_collection.json) and tested.

---

### Conclusion
DineFlow satisfies all academic and technical requirements set forth in the L&T EduTech & Christ University 5th Semester CIA-3 assessment criteria, demonstrating a robust, secure, and production-ready backend architecture.
