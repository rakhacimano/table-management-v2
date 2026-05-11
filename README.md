# Mejaaa — Restaurant Table Management System

![Mejaaa Preview](https://via.placeholder.com/1200x600/18181B/3ECF8E?text=Mejaaa+Restaurant+Management)

**Mejaaa** is a modern, lightweight, and responsive restaurant table management system. Built with an elegant Supabase-inspired aesthetic, it allows restaurant staff to track table statuses, manage bookings, edit floor plans via an interactive drag-and-drop canvas, and simulate different user roles without needing a backend server. 

Data is securely and persistently stored in your browser's `localStorage`.

---

## 🚀 Features

### 🏢 Comprehensive Restaurant Management
- **Dashboard Overview**: Real-time analytics on table availability, occupancy, daily bookings, and an activity feed.
- **Rooms & Floors**: Manage different dining areas (e.g., Main Hall, VIP, Patio).
- **Table CRUD**: Configure tables by shape, size, capacity, and seat count.

### 🗺️ Interactive Floor Plan
- **Drag-and-Drop Layout**: Admins can visually design the restaurant layout with an interactive 10px snap-to-grid canvas.
- **Real-Time Status**: Tables are color-coded based on their status (Available, Occupied, Reserved, Cleaning, etc.).
- **Quick Actions**: Staff can update table statuses in 2 clicks right from the layout view.

### 📅 Booking Lifecycle Management
- Track reservations from creation to completion.
- Statuses include: `Pending`, `Confirmed`, `Checked In`, `Seated`, `Completed`, `Cancelled`, and `No Show`.
- Integrated Kiosk/Customer Booking flow.

### 🔐 Role-Based Access Control (RBAC)
Mejaaa includes a built-in Persona Switcher to test the UI across different staff permissions:
- **Owner / Admin / Manager**: Full access to all settings, logs, table CRUD, and layout editing.
- **Host**: Can view the dashboard, floor plan, and manage bookings.
- **Waiter**: Read-only dashboard, floor plan visibility, and table status updates.
- **Cleaner**: Highly restricted view; can only update tables from `Cleaning` to `Available`.
- **Customer / Guest**: Hides the admin sidebar completely and allows self-service booking directly via the floor plan.

### 🕵️ Audit Trail & Data Export
- **Automated Activity Logging**: Tracks who did what, and when.
- **Data Portability**: Instantly export your entire restaurant database (Rooms, Tables, Bookings, Logs) to a JSON file.

---

## 🛠️ Tech Stack

This project is built purely with standard web technologies, making it incredibly easy to deploy, host, and modify.

- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 + **Tailwind CSS** (via CDN) + Google Fonts (DM Sans)
- **Logic**: Vanilla JavaScript (ES6)
- **Database**: Browser `localStorage` (via custom `Store` singleton)
- **Icons**: Inline SVGs (Lucide-inspired)

---

## 📂 Project Structure

```text
table-management/
├── index.html            # Main application shell and layout
├── css/
│   └── app.css           # Custom theme variables, layouts, and overrides
├── js/
│   ├── app.js            # Core router, UI framework (modals, toasts), and RBAC
│   ├── store.js          # LocalStorage persistence, data models, and audit logging
│   ├── pages-rooms.js    # Logic for Rooms & Tables data tables
│   ├── pages-floor.js    # Interactive drag-and-drop floor plan canvas
│   └── pages-more.js     # Bookings, Audit Trail, Settings, and Customer modals
└── PRD.md                # Original Product Requirements Document
```

---

## 🏃 Getting Started

Because Mejaaa is a client-side application with no build steps or backend dependencies, you can run it instantly.

### 1. Clone the repository
```bash
git clone https://github.com/rakha-maxxi/table-management-v2.git
cd table-management-v2
```

### 2. Serve the application
You need a local web server to prevent browser CORS issues with ES modules (if applicable in the future) or just for standard testing.

Using `npx`:
```bash
npx http-server . -p 8080
```
*Or using Python:*
```bash
python3 -m http.server 8080
```

### 3. Open your browser
Navigate to `http://localhost:8080`. 

> **Note:** On first load, Mejaaa will automatically seed your browser's `localStorage` with demo data (rooms, tables, bookings) so you can start testing immediately.

---

## 🎭 How to test User Roles

1. Look at the bottom-left corner of the sidebar.
2. Click on your profile card (default is usually **System Admin**).
3. Select a different role (e.g., **Cleaning Staff** or **Guest**).
4. Watch the UI automatically restructure itself, locking out unauthorized pages and hiding admin-specific actions.

---

## 🎨 Design Philosophy

The UI is heavily inspired by modern developer tools (specifically Supabase), prioritizing clean typography, subtle borders, high-contrast actions, and a beautiful green primary accent color (`#3ECF8E`).

---

## 📝 License

This project is open-sourced under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as you see fit.
