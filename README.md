# Smart Blood Bank Management System (Likit DBMS)

A premium, database-optimized healthcare logistics platform managing blood donors, hospitals, real-time inventory, and emergency requests.

---

## 🚀 Quick Start & Trial Sandboxes

For instant evaluation, the platform seeds a self-contained local sandbox database with preseeded credentials for all three portal roles:

*   **💼 Chief Admin Portal**:
    *   **Email**: `admin@bloodbank.com`
    *   **Password**: `admin123`
*   *   **🩸 Registered Donor Portal**:
    *   **Email**: `donor@bloodbank.com`
    *   **Password**: `donor123`
*   *   **🏥 Partner Hospital Portal**:
    *   **Email**: `hospital@bloodbank.com`
    *   **Password**: `hospital123`

---

## 🛠️ Tech Stack & Directory Structure

```text
likit_DBMS/
│
├── database/                   # Advanced DBMS scripts
│   ├── schema.sql              # Core table designs & indexes
│   ├── triggers.sql            # Automated stock updates & notification triggers
│   ├── procedures.sql          # Donor matching & FIFO sweeps
│   └── views.sql               # Performance views (optimal summary)
│
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/             # Dual MySQL Connection Pool & JSON fallbacks
│   │   ├── controllers/        # Auth, Donors, Hospitals, Stock, Alerts
│   │   ├── middleware/         # Security and Role validation
│   │   └── app.js              # Express boot & seed engine
│   └── .env
│
└── frontend/                   # React + Vite + Tailwind CSS dashboard
    ├── src/
    │   ├── api/                # Axios instance
    │   ├── components/         # Sidebars, Navbars & secure Layout wrappers
    │   ├── context/            # AuthContext (role state & bells feed)
    │   └── pages/              # Portals grids & calculators
```

---

## 🗄️ Database Architecture & Concept Integrations

### 1. Tables Scheme
1.  `users` (credentials and global identities)
2.  `donors` (dob, weight, eligibility dates)
3.  `hospitals` (licenses, emergency contacts)
4.  `blood_stock` (aggregated stock summary)
5.  `blood_units` (FIFO individual units)
6.  `donations` (blood chemistry readings)
7.  `blood_requests` (priorities normal, emergency, critical)
8.  `eligibility_checks`
9.  `emergency_alerts`
10. `notifications` (live feeds)
11. `appointments` (donation dates calendar)
12. `request_status_logs` (audits)
13. `admin_logs`
14. `blood_compatibility` (lookup matrix)

### 2. Triggers (`database/triggers.sql`)
*   `after_donation_insert`: Increases `blood_stock` total units on complete donations, adds detailed unit, and locks donor cooldown (is_eligible = 0, 56 days safety interval).
*   `after_request_status_update`: Updates total inventory sums, logs transitions, and sends notifications.

### 3. Stored Procedures (`database/procedures.sql`)
*   `GetCompatibleDonors(bloodGroup, city)`: Matches recipients against donor compatibilities and geographic limits.
*   `ProcessBloodRequest(requestId)`: Checks stock, deducts oldest items (FIFO), and marks request status.
*   `MarkExpiredBloodUnits()`: Identifies items past their 42-day lifespan and cleans counts.

### 4. Optimized Views (`database/views.sql`)
*   `available_blood_summary`: Warning statuses (Critical vs Optimal)
*   `pending_requests_view`: Priority-ordered queues.

---

## 🏃‍♂️ Running Locally

1.  **Backend**:
    *   Navigate: `cd backend`
    *   Launch: `npm start` (Runs at `http://localhost:5000`)
    *   *MySQL Optional*: Provide a valid `MYSQL_URL` in `.env` to connect. Otherwise, it runs in **JSON DBMS Mock Engine Mode** seamlessly.
2.  **Frontend**:
    *   Navigate: `cd frontend`
    *   Launch: `npm run dev` (Served at `http://localhost:5173`)
