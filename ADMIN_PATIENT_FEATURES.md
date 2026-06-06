# 👨‍⚕️ Admin & Patient Portal — Feature Walkthroughs

> **Complete visual reference for admin and patient user journeys**

---

## 📑 Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Admin Features Deep Dive](#admin-features-deep-dive)
3. [Patient Portal Overview](#patient-portal-overview)
4. [Patient Features Deep Dive](#patient-features-deep-dive)
5. [Key User Flows](#key-user-flows)

---

## 👨‍💼 Admin Dashboard Overview

### Admin Home (Dashboard)

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                               │
├──────────────────────────────────────────────────────────────────┤
│ Navigation: Dashboard | Doctors | Services | Products | Bookings │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📈 Analytics Cards (Real-time):                            │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│ │ │ Revenue     │  │ Bookings    │  │ Orders      │         │ │
│ │ │ Rp 15.2M    │  │ 245 ↑ 12%   │  │ 89 ↑ 8%     │         │ │
│ │ │ This Month  │  │             │  │ This Month  │         │ │
│ │ └─────────────┘  └─────────────┘  └─────────────┘         │ │
│ │ ┌─────────────┐                                            │ │
│ │ │ Patients    │                                            │ │
│ │ │ 1,234       │                                            │ │
│ │ │ Total       │                                            │ │
│ │ └─────────────┘                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📋 Activity Feed (Pagination):                             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ • Dr. Siti Nurhaliza assigned to user admin2 (2 mins ago)   │ │
│ │ • Service "Hair Treatment" toggled to inactive (5 mins ago) │ │
│ │ • Booking #1234 status updated to Completed (1 hour ago)   │ │
│ │ • Payment received for Order #5001 (3 hours ago)           │ │
│ │ • Product "Vitamin C Serum" stock updated (1 day ago)      │ │
│ │                                                              │ │
│ │ [← Previous] [1 2 3 ...] [Next →]                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Real-time stats from backend API
- Loading skeletons while data fetches
- Activity pagination for audit trail
- One-click navigation to management pages

---

## 👨‍💼 Admin Features Deep Dive

### 1. Doctor Management

#### Dashboard
```
┌──────────────────────────────────────────────────────────────────┐
│ 👨‍⚕️ Manage Doctors                                                 │
├──────────────────────────────────────────────────────────────────┤
│ [+ Add New Doctor]                                               │
├──────────────────────────────────────────────────────────────────┤
│ Doctors List:                                                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Name        │ Spec        │ Available │ Actions              │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ Dr. Siti    │ Dermatology │ ✅ On    │ ✏️ Edit | 🗑️ Delete  │ │
│ │ Dr. Budi    │ Cardiology  │ ✅ On    │ ✏️ Edit | 🗑️ Delete  │ │
│ │ Dr. Ani     │ Spa Therapy │ ❌ Off   │ ✏️ Edit | 🗑️ Delete  │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### Add/Edit Doctor Form
```
┌──────────────────────────────────────────────────────────────────┐
│ 📝 Add Doctor                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User Assignment:                                                 │
│ [Dropdown: Select unassigned user]                              │
│ (Shows: "admin1", "doctor1", "doctor2")                         │
│                                                                  │
│ Specialization:                                                  │
│ [Dropdown: Dermatology]                                          │
│ (Options: Dermatology, Cardiology, General, Spa Therapy, etc)   │
│                                                                  │
│ Availability:                                                    │
│ [Toggle: ✅ ON | OFF]                                           │
│                                                                  │
│ [Save Doctor] [Cancel]                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Schedule Management (Per Doctor)
```
┌──────────────────────────────────────────────────────────────────┐
│ 📅 Manage Schedules - Dr. Siti Nurhaliza                        │
├──────────────────────────────────────────────────────────────────┤
│ [+ Add Schedule]                                                 │
├──────────────────────────────────────────────────────────────────┤
│ Current Schedules:                                               │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Day         │ Time          │ Active │ Actions              │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ Monday      │ 09:00 - 12:00 │ ✅    │ ✏️ Edit | 🗑️ Delete  │ │
│ │ Monday      │ 13:00 - 17:00 │ ✅    │ ✏️ Edit | 🗑️ Delete  │ │
│ │ Wednesday   │ 10:00 - 15:00 │ ✅    │ ✏️ Edit | 🗑️ Delete  │ │
│ │ Friday      │ 14:00 - 18:00 │ ❌    │ ✏️ Edit | 🗑️ Delete  │ │
│ │ Saturday    │ 09:00 - 13:00 │ ✅    │ ✏️ Edit | 🗑️ Delete  │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Add Schedule Form:
┌──────────────────────────────────────────────────────────────────┐
│ Day of Week:     [Monday ▼]                                      │
│ Start Time:      [09:00 ▼]                                       │
│ End Time:        [12:00 ▼]                                       │
│                                                                  │
│ [Add Schedule] [Cancel]                                         │
│                                                                  │
│ Note: System prevents time conflicts on same day                │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- ✅ Assign unassigned users to doctor role
- ✅ Set specialization
- ✅ Toggle availability on/off
- ✅ Per-day scheduling (Monday-Sunday)
- ✅ Time conflict validation (prevents overlap)
- ✅ Edit/Delete schedules
- ✅ Toggle schedule active/inactive

---

### 2. Service Management

#### Dashboard
```
┌──────────────────────────────────────────────────────────────────┐
│ 🏥 Beauty Services                                               │
├──────────────────────────────────────────────────────────────────┤
│ [+ Add Service] 🔍 Search [...] 📂 Filter: All Categories ▼    │
├──────────────────────────────────────────────────────────────────┤
│ Services Table:                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Service     │ Category    │ Price   │ Active │ Actions      │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ Facial      │ Skincare    │ Rp500K  │ ✅    │ ✏️ | 🗑️ | 🔄 │ │
│ │ Hair Style  │ Hair        │ Rp300K  │ ✅    │ ✏️ | 🗑️ | 🔄 │ │
│ │ Massage     │ Wellness    │ Rp400K  │ ❌    │ ✏️ | 🗑️ | 🔄 │ │
│ │ Acupuncture │ Wellness    │ Rp350K  │ ✅    │ ✏️ | 🗑️ | 🔄 │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### Add/Edit Service Form
```
┌──────────────────────────────────────────────────────────────────┐
│ 📝 Add Service                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Service Name: *                                                  │
│ [Facial Treatment]                                               │
│                                                                  │
│ Category: *                                                      │
│ [Skincare ▼]                                                     │
│                                                                  │
│ Description:                                                     │
│ [Deep cleansing facial untuk kulit wajah normal hingga kombinasi] │
│                                                                  │
│ Price: *                                                         │
│ [Rp 500,000]                                                     │
│                                                                  │
│ Unit: *                                                          │
│ [Sesi ▼] (Options: Sesi, Paket, Jam, Piece)                    │
│                                                                  │
│ Active: ☑ (Checkbox)                                            │
│ [✅] Make this service visible to patients                       │
│                                                                  │
│ [Save Service] [Cancel]                                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Category grouping & filtering
- ✅ Search by service name
- ✅ Price & unit management
- ✅ Toggle active/inactive
- ✅ Description field

---

### 3. Booking Management

#### Dashboard with Filters
```
┌──────────────────────────────────────────────────────────────────┐
│ 📋 Booking Supervision                                           │
├──────────────────────────────────────────────────────────────────┤
│ [+ Manual Booking] 🔍 Search patient [.....................]     │
│                                                                  │
│ Filters:                                                         │
│ Status: [All ▼] Doctor: [All ▼] Service: [All ▼]               │
│ Date Range: [From: ......] [To: ......] [Filter]                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Bookings Table (Sortable Columns):                               │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ID   │ Patient  │ Doctor    │ Service │ Date  │ Status     │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ 1201 │ Rina     │ Dr. Siti  │ Facial  │ 06-08 │ Confirmed  │ │
│ │ 1202 │ Budi     │ Dr. Ani   │ Massage │ 06-10 │ Pending    │ │
│ │ 1203 │ Sinta    │ Dr. Budi  │ Hair    │ 06-12 │ Completed  │ │
│ │ 1204 │ Ahmad    │ Dr. Siti  │ Facial  │ 06-15 │ Cancelled  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Pagination: [← ] 1 2 3 [ →]                                     │
└──────────────────────────────────────────────────────────────────┘
```

#### Manual Booking Modal
```
┌──────────────────────────────────────────────────────────────────┐
│ ➕ Create Booking (Walk-in)                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Select Patient: *                                                │
│ [Rina Wijaya ▼] (dropdown of existing patients)                 │
│                                                                  │
│ Select Service: *                                                │
│ [Facial ▼] (filtered by active services)                        │
│                                                                  │
│ Select Doctor: *                                                 │
│ [Dr. Siti ▼] (filtered by available doctors for service)        │
│                                                                  │
│ Select Date & Time: *                                            │
│ ┌────────────────────┐                                          │
│ │ Jun 2026           │                                          │
│ │ M T W T F S S      │                                          │
│ │ 1 2 3 4 5 6 7      │                                          │
│ │ 8 9 10 11 12 ...   │                                          │
│ │ [8 selected]       │                                          │
│ │                                                               │
│ │ Time: [09:00 ▼]    │ ✅ Available                             │
│ └────────────────────┘                                          │
│                                                                  │
│ [Create Booking] [Cancel]                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- ✅ Advanced filtering (status, doctor, service, date range)
- ✅ Search by patient name
- ✅ Sortable columns
- ✅ Manual booking creation for walk-ins
- ✅ 14-day date picker with available slots
- ✅ Real-time slot availability from backend

---

### 4. Product Management (Template)
```
┌──────────────────────────────────────────────────────────────────┐
│ 🛍️ Product Management                                            │
├──────────────────────────────────────────────────────────────────┤
│ [+ Add Product] 🔍 Search [...] 📂 Category: [All ▼]            │
├──────────────────────────────────────────────────────────────────┤
│ Products Table:                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Product     │ SKU    │ Category   │ Price  │ Stock │ Actions │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ Vit C Serum │ VCS-01 │ Skincare   │ 250K   │ ✅    │ ✏️ 🗑️  │ │
│ │ Face Mask   │ FM-02  │ Skincare   │ 150K   │ ⚠️    │ ✏️ 🗑️  │ │
│ │ Hair Oil    │ HO-03  │ Haircare   │ 120K   │ ❌    │ ✏️ 🗑️  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Stock Status: ✅ In Stock | ⚠️ Low Stock | ❌ Out of Stock      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 👤 Patient Portal Overview

### Patient Home (Dashboard)

```
┌──────────────────────────────────────────────────────────────────┐
│                    PATIENT DASHBOARD                             │
├──────────────────────────────────────────────────────────────────┤
│ Selamat Pagi, Rina! 🌤️                                          │
├──────────────────────────────────────────────────────────────────┤
│ Quick Actions:                                                   │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│ │ 📅 Pesan     │  │ 📋 Booking   │  │ 🛍️ Shop     │            │
│ │ Dokter       │  │ Saya         │  │ Produk      │            │
│ └──────────────┘  └──────────────┘  └──────────────┘            │
├──────────────────────────────────────────────────────────────────┤
│ Upcoming Bookings (Next 3):                                      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 📅 2026-06-08 | 10:00 AM                                     │ │
│ │ Dr. Siti Nurhaliza - Facial Treatment                        │ │
│ │ Status: ✅ Confirmed                                         │ │
│ │                                                              │ │
│ │ 📅 2026-06-10 | 02:00 PM                                     │ │
│ │ Dr. Budi Kusuma - Hair Styling                              │ │
│ │ Status: ⏳ Pending                                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ Recent Orders:                                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Order #ORD-20260606-001 | Rp 500,000 | 💰 Paid ✅            │ │
│ │ Order #ORD-20260605-002 | Rp 250,000 | ⏳ Pending            │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 👤 Patient Features Deep Dive

### 1. Booking System (Core Feature)

#### Step 1: Select Service
```
┌──────────────────────────────────────────────────────────────────┐
│ 📅 Book Doctor                                        [Step 1/4] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Left Sidebar Step Tracker:                                       │
│ ✅ 1. Select Service  ← Current                                 │
│ ⭕ 2. Select Doctor                                             │
│ ⭕ 3. Pick Date & Time                                          │
│ ⭕ 4. Confirm & Pay                                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Select a Service:                                                │
│ 🔍 Search [...............]                                      │
│ 📂 Category: [All ▼]                                             │
│                                                                  │
│ Services Grid:                                                   │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│ │ 😊 Facial    │  │ 💇 Hair      │  │ 💆 Massage   │            │
│ │ Treatment    │  │ Styling      │  │ Therapy      │            │
│ │ Rp 500K      │  │ Rp 300K      │  │ Rp 400K      │            │
│ │              │  │              │  │              │            │
│ │ [Select]     │  │ [Select]     │  │ [Select]     │            │
│ └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                  │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│ │ 🧴 Skincare  │  │ 🌿 Herbal    │  │ 💅 Nails    │            │
│ │ Package      │  │ Treatment    │  │ Art          │            │
│ │ Rp 750K      │  │ Rp 350K      │  │ Rp 200K      │            │
│ │              │  │              │  │              │            │
│ │ [Select]     │  │ [Select]     │  │ [Select]     │            │
│ └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Step 2: Select Doctor
```
┌──────────────────────────────────────────────────────────────────┐
│ 👨‍⚕️ Select Doctor                                   [Step 2/4]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Left Sidebar (Updated):                                          │
│ ✅ 1. Select Service       (Facial Treatment selected)          │
│ ✅ 2. Select Doctor  ← Current                                  │
│ ⭕ 3. Pick Date & Time                                          │
│ ⭕ 4. Confirm & Pay                                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Doctors Available for "Facial Treatment":                        │
│ (System automatically filtered doctors based on service)        │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Dr. Siti Nurhaliza        ⭐⭐⭐⭐⭐ (4.8)                      │ │
│ │ Specialization: Dermatology                                  │ │
│ │ Experience: 8 years                                          │ │
│ │ [Select Doctor]                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Dr. Ani Wijaya            ⭐⭐⭐⭐ (4.5)                       │ │
│ │ Specialization: Spa Therapy                                  │ │
│ │ Experience: 5 years                                          │ │
│ │ [Select Doctor]                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Dr. Budi Kusuma           ⭐⭐⭐ (4.2)                         │ │
│ │ Specialization: General Practice                             │ │
│ │ Experience: 3 years                                          │ │
│ │ [Select Doctor] (⚠️ Currently unavailable on your dates)   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Step 3: Pick Date & Time
```
┌──────────────────────────────────────────────────────────────────┐
│ 📆 Pick Date & Time                               [Step 3/4]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Left Sidebar (Updated):                                          │
│ ✅ 1. Select Service       (Facial Treatment)                   │
│ ✅ 2. Select Doctor        (Dr. Siti Nurhaliza)                 │
│ ✅ 3. Pick Date & Time  ← Current                               │
│ ⭕ 4. Confirm & Pay                                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ 14-Day Calendar (Green = Available, Gray = Booked):             │
│                                                                  │
│ ┌──────────────────────────────────────┐                       │
│ │ June 2026                            │                       │
│ │ M   T   W   T   F   S   S            │                       │
│ │ 1   2   3   4   5   6   7            │                       │
│ │ 8✅ 9✅ 10⚫ 11✅ 12✅ 13⚫ 14✅        │                       │
│ │ 15✅ 16✅ 17✅ 18⚫ 19⚫ 20✅ 21✅      │                       │
│ │                                       │                       │
│ │ Legend:                               │                       │
│ │ ✅ Available  ⚫ Fully Booked         │                       │
│ └──────────────────────────────────────┘                       │
│                                                                  │
│ Selected Date: June 8, 2026 (Saturday)                          │
│                                                                  │
│ Available Time Slots:                                           │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│ │ 09:00 AM    │ │ 10:30 AM    │ │ 02:00 PM    │               │
│ │ Available ✅ │ │ Available ✅ │ │ Available ✅ │               │
│ │ [Select]    │ │ [Select]    │ │ [Select]    │               │
│ └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│ ┌─────────────┐ ┌─────────────┐                                │
│ │ 03:30 PM    │ │ 04:00 PM    │                                │
│ │ Available ✅ │ │ Available ✅ │                                │
│ │ [Select]    │ │ [Select]    │                                │
│ └─────────────┘ └─────────────┘                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Step 4: Confirm & Payment
```
┌──────────────────────────────────────────────────────────────────┐
│ ✅ Confirm & Payment                              [Step 4/4]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Left Sidebar (All Complete):                                     │
│ ✅ 1. Select Service       (Facial Treatment)                   │
│ ✅ 2. Select Doctor        (Dr. Siti Nurhaliza)                 │
│ ✅ 3. Pick Date & Time     (June 8, 2026 - 10:30 AM)          │
│ ✅ 4. Confirm & Pay    ← Current                                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ ORDER SUMMARY:                                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Service:     Facial Treatment                               │ │
│ │ Doctor:      Dr. Siti Nurhaliza (Dermatology)               │ │
│ │ Date:        Saturday, June 8, 2026                         │ │
│ │ Time:        10:30 AM                                       │ │
│ │ Price:       Rp 500,000                                     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ PAYMENT METHOD:                                                  │
│ ┌─ Choose Payment ─────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │ ( ) Pay Now                                                 │ │
│ │     Redirect to Midtrans for instant payment                │ │
│ │     Supported: QRIS, GoPay, OVO, DANA, Bank Transfer       │ │
│ │                                                              │ │
│ │ (●) Pay Later                                               │ │
│ │     Create booking now, pay anytime (before appointment)    │ │
│ │                                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [Confirm Booking] [Back to Step 3]                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

🎉 AFTER CONFIRMATION:
   ├─ Booking created in "My Bookings"
   ├─ If "Pay Now": Redirect to Midtrans
   │  └─ Patient scans QRIS or selects e-wallet
   │  └─ Returns to PaymentResultPage
   └─ If "Pay Later": Show success message
      └─ Order appears in "My Orders" with Pending payment
```

---

### 2. My Bookings

```
┌──────────────────────────────────────────────────────────────────┐
│ 📋 My Bookings                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Filter: [All] | [Pending] | [Confirmed] | [Done] | [Cancelled] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 📅 Saturday, June 8 - 10:30 AM                              │ │
│ │ Dr. Siti Nurhaliza (Dermatology)                            │ │
│ │ Facial Treatment - Rp 500,000                               │ │
│ │ Status: ✅ Confirmed                                        │ │
│ │                                                              │ │
│ │ [📞 Request Cancellation] [View Details]                     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 📅 Wednesday, June 12 - 02:00 PM                            │ │
│ │ Dr. Budi Kusuma (General Practice)                          │ │
│ │ Hair Styling - Rp 300,000                                   │ │
│ │ Status: ⏳ Pending                                          │ │
│ │                                                              │ │
│ │ [📞 Request Cancellation] [View Details]                     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 📅 Friday, May 20 - 03:00 PM                                │ │
│ │ Dr. Ani Wijaya (Spa Therapy)                                │ │
│ │ Massage Therapy - Rp 400,000                                │ │
│ │ Status: ✅ Done                                             │ │
│ │ Doctor's Medical Record: [View]                             │ │
│ │                                                              │ │
│ │ [📞 Contact Admin]                                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

REQUEST CANCELLATION MODAL:
┌──────────────────────────────────────────────────────────────────┐
│ 📞 Request Cancellation                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Please contact our admin team to request cancellation:          │
│                                                                  │
│ 📧 Email: support@clinicaura.id                                 │
│ 📞 Phone: +62 812-345-6789                                      │
│ 💬 WhatsApp: Send message via link                              │
│                                                                  │
│ Cancellation must be requested at least 24 hours before date.  │
│                                                                  │
│ [Close] [Open WhatsApp]                                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 3. My Orders

```
┌──────────────────────────────────────────────────────────────────┐
│ 🛍️ My Orders                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Order #ORD-20260606-001                                      │ │
│ │ Created: June 6, 2026                                        │ │
│ │ Total: Rp 500,000                                            │ │
│ │ Status: 💰 Paid ✅                                           │ │
│ │ Payment Method: QRIS                                         │ │
│ │                                                              │ │
│ │ Items:                                                       │ │
│ │ • Facial Treatment × 1 (Rp 500,000)                         │ │
│ │                                                              │ │
│ │ [View Details] [Download Invoice]                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Order #ORD-20260605-002                                      │ │
│ │ Created: June 5, 2026                                        │ │
│ │ Total: Rp 250,000                                            │ │
│ │ Status: ⏳ Pending                                           │ │
│ │ Payment Method: Not yet selected                             │ │
│ │                                                              │ │
│ │ Items:                                                       │ │
│ │ • Hair Styling × 1 (Rp 300,000)                             │ │
│ │                                                              │ │
│ │ [Pay Now] [Download Invoice]                                │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Empty State (if no orders):                                      │
│ "No orders yet. Start booking now!"                             │
│ [Go to Booking] [Shop Products]                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key User Flows

### Flow 1: Patient Books Doctor (Full Journey)

```
1. Patient logs in
   ↓
2. Lands on Patient Dashboard
   ↓
3. Clicks "Pesan Dokter" (Book Doctor)
   ↓
4. Steps through booking form:
   a) Select Service (from catalog)
   b) Select Doctor (auto-filtered by service + availability)
   c) Pick Date & Time (14-day calendar, available slots only)
   d) Choose Payment (Pay Now or Pay Later)
   ↓
5. Confirm booking
   ↓
6. [If Pay Now]:
   - Redirect to Midtrans
   - Scan QRIS / Select e-wallet / Bank transfer
   - Redirected to PaymentResultPage
   - See success/pending/error status
   - Booking confirmed in "My Bookings"
   
   [If Pay Later]:
   - Booking created immediately
   - Order in "My Orders" with Pending status
   - Patient can pay anytime before appointment
   ↓
7. Patient sees booking in:
   - Dashboard (Upcoming Bookings)
   - My Bookings (with status)
   ↓
8. On appointment day:
   - Patient arrives at clinic
   - Doctor completes consultation
   - Doctor writes medical record + prescriptions
   - Booking marked as "Done"
   - Patient can view medical record in "My Bookings"
```

---

### Flow 2: Admin Manages Doctor Schedule

```
1. Admin logs into Admin Dashboard
   ↓
2. Clicks "Doctors" tab
   ↓
3. Selects a doctor from the list
   ↓
4. Clicks "Schedule" sub-tab
   ↓
5. Views existing schedules (Mon-Sun with times)
   ↓
6. Adds new schedule:
   - Pick day of week (e.g., Monday)
   - Set start time (e.g., 09:00)
   - Set end time (e.g., 12:00)
   - System validates no time conflicts
   - Click "Add Schedule"
   ↓
7. Schedule appears in list (live update)
   ↓
8. Schedule automatically available to:
   - Patients when booking (14-day availability)
   - Frontend calendar picker
   ↓
9. Admin can toggle schedule active/inactive
   ↓
10. Admin can delete schedule if needed
```

---

### Flow 3: Patient Makes Payment

```
1. Patient finishes booking form
   ↓
2. Chooses "Pay Now" option
   ↓
3. Clicks "Confirm Booking"
   ↓
4. Redirected to Midtrans payment gateway
   ↓
5. Selects payment method:
   - QRIS (scan with phone)
   - GoPay (OTP)
   - OVO (OTP)
   - DANA (OTP)
   - Bank Transfer (BCA, Mandiri, BNI)
   - Credit Card
   ↓
6. Completes payment
   ↓
7. Midtrans webhook notifies backend
   ↓
8. Backend updates:
   - Payment status: success
   - Booking status: confirmed
   - Creates order record
   ↓
9. Patient redirected to PaymentResultPage
   ↓
10. Shows:
    - ✅ Payment Success
    - Order details
    - Booking confirmation
    - "View My Bookings" link
```

---

## Summary

**Admin Portal** provides complete operational control:
- ✅ Doctor management with scheduling
- ✅ Service catalog management
- ✅ Booking supervision & manual creation
- ✅ Real-time analytics
- ✅ Activity audit trail

**Patient Portal** provides seamless service experience:
- ✅ Multi-step booking with real-time availability
- ✅ Multiple payment methods (Midtrans)
- ✅ Booking management (view, filter, cancel request)
- ✅ Order history tracking
- ✅ Medical records access

Both portals work together to create a **complete clinic management system**.

---

**Last Updated**: June 6, 2026  
**Version**: 1.0
