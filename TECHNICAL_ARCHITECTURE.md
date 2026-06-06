# Booking Clinic Aura - Complete Technical Architecture Analysis

**Date**: June 6, 2026  
**Stack**: Laravel 11 (Backend) + React 18 (Frontend)  
**Project Type**: Full-stack clinic booking and e-pharmacy management system

---

## Table of Contents

1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Data Flow & Integration](#data-flow--integration)
4. [Architectural Decisions & Patterns](#architectural-decisions--patterns)
5. [Risk Assessment & Anti-patterns](#risk-assessment--anti-patterns)

---

# BACKEND ARCHITECTURE

## 1. Database Schema & Relationships

### Core Tables

#### **users** (Identity)
```sql
- user_id (PK) → implicit by Laravel, but custom use of user_id instead of id
- full_name, email, password
- role: ENUM(patient, doctor, admin)
- status: ENUM(active, inactive)
- last_login_at
- soft_deletes
```

**Key Decision**: Custom primary key `user_id` to differentiate from `id()`. This cascades to all related models with explicit naming conventions (patient_id, doctor_id, etc.).

#### **patients** (Patient Profiles)
```sql
- patient_id (PK) → FK references users.user_id
- date_of_birth, gender, blood_type, address
- 1:1 relationship with users (unique FK)
```

**Relationship**: `User::hasOne(Patient)` → Patient is an extension of User identity

#### **doctors** (Doctor Profiles)
```sql
- doctor_id (PK)
- user_id (FK, unique) → references users.user_id
- spec_id (FK) → references specializations.spec_id
- license_no (unique) → STR (Surat Tanda Registrasi) validation
- bio, is_active, is_available (boolean toggles)
```

**Key Design**:
- `is_active`: Admin-controlled (display/hide)
- `is_available`: Availability toggle (can toggle booking eligibility without deleting)
- Soft deletes prevent cascading deletion of related bookings

#### **specializations** (Doctor Specialties)
```sql
- spec_id (PK)
- name: STRING (unique)
```

#### **doctor_schedules** (Weekly Schedules)
```sql
- schedule_id (PK)
- doctor_id (FK)
- day_of_week: ENUM(Monday-Sunday)
- start_time, end_time: TIME
- is_active: BOOLEAN
```

**Critical Pattern**: Doctor can have multiple schedules per day (e.g., morning 08:00-12:00 and afternoon 13:00-17:00). Frontend must resolve schedule_id explicitly from available slots.

#### **bookings** (Appointment Reservations)
```sql
- booking_id (PK)
- patient_id, doctor_id, doctor_schedule_id, service_id (all FKs)
- booked_date: DATE
- start_time, end_time: TIME
- status: ENUM(pending, confirmed, in_progress, completed, cancelled)
- notes: TEXT
- soft_deletes
```

**Status Lifecycle**:
```
pending → confirmed → in_progress → completed
  ↓ (anytime)
  └─────────────── cancelled
```

**Constraints**:
- `restrictOnDelete` on all FKs: booking cannot exist without related entities
- Soft deletes: preserve audit trail

#### **services** (Medical Services)
```sql
- service_id (PK)
- service_name, description
- base_price: DECIMAL(12,2)
- is_active: BOOLEAN
```

#### **orders** & **order_items** (E-pharmacy)
```sql
orders:
- order_id (PK)
- patient_id (FK)
- booking_id (FK, nullable) → booking-only orders don't reference this
- total_amount: DECIMAL(12,2)
- status: ENUM(pending, completed, cancelled)
- order_number: STRING (generated per transaction)

order_items:
- order_item_id (PK)
- order_id (FK)
- product_id (FK)
- quantity, unit_price, subtotal
```

#### **products** & **product_categories**
```sql
products:
- product_id (PK)
- category_id (FK)
- name, description, price, stock
- is_active: BOOLEAN

product_categories:
- category_id (PK)
- name: STRING
```

#### **medical_records** (Patient History)
```sql
- record_id (PK)
- patient_id, doctor_id, booking_id (FKs)
- diagnosis, treatment, notes
```

#### **prescriptions** (Doctor Prescriptions)
```sql
- prescription_id (PK)
- doctor_id, patient_id, medical_record_id (FKs)
- medications: JSON or related table
- instructions: TEXT
```

#### **payments** (Payment Tracking)
```sql
- payment_id (PK)
- order_id (FK, unique) → 1:1 relationship
- midtrans_id (unique) → transaction ID from Midtrans
- amount: DECIMAL(12,2)
- payment_method: STRING (gopay, bca_va, qris, credit_card, etc.)
- payment_channel: STRING (bank_transfer, qris, e-wallet)
- status: ENUM(pending, success, failed, expired)
- paid_at: TIMESTAMP (nullable)
```

**Midtrans Integration Point**: This table bridges internal order management and external payment gateway.

#### **stock_logs** (Inventory Audit)
```sql
- log_id (PK)
- product_id (FK)
- order_item_id (FK, nullable)
- quantity_change: INTEGER (signed)
- reason: STRING
```

### Relationship Graph

```
users (1) ──────── (1) patients
   │
   ├─ (1) ──────── (1) doctors
   │                    │
   │                    ├─ (1) ──────── (N) doctor_schedules
   │                    │
   │                    └─ (N) ──────── (N) bookings
   │
   └─ (N) ──────── (N) orders ──────── (1) payments
                          │
                          ├─ (1) ──────── (1) bookings (nullable)
                          │
                          └─ (N) ──────── (N) order_items ──────── (N) products


bookings:
  (N) patient_id ──→ (1) patients
  (N) doctor_id ──→ (1) doctors
  (N) doctor_schedule_id ──→ (1) doctor_schedules
  (N) service_id ──→ (1) services
  (1) ──────── (1) medical_records
```

---

## 2. Architecture Patterns

### 2.1 Repository Pattern (Data Access Layer)

**BaseRepository** (`app/Repositories/BaseRepository.php`)

```php
abstract class BaseRepository {
    protected Model $model;
    
    public function __construct(Model $model) { ... }
    public function all() { ... }
    public function find(int $id) { ... }
    public function findOrFail(int $id) { ... }
    public function create(array $attributes) { ... }
    public function update(int $id, array $attributes) { ... }
    public function delete(int $id) { ... }
}
```

**Purpose**: Abstract away Eloquent query details, provide consistent CRUD interface.

**Key Decision**: `refresh()` used instead of `fresh()` to preserve custom primary keys (patient_id, doctor_id, etc.) after insert.

**Child Repositories** (15 specialized repositories):
- `BookingRepository`: `allWithRelations()`, `findByPatient()`, `findByDoctor()`, `isSlotTaken()`, `lockSlot()`, `getTakenDatesBySchedule()`
- `DoctorRepository`: `findActive()`, `findWithSchedules()`
- `PatientRepository`: `findByUserId()`
- `PaymentRepository`: `findByOrderId()`
- `OrderRepository`: `updateOrderNumber()`
- `ScheduleRepository`: `findByDoctor()`, `findActive()`
- etc.

**Example: BookingRepository Query Methods**

```php
// Anti-race-condition slot locking
public function lockSlot(int $scheduleId, string $date): bool {
    return $this->model
        ->where('doctor_schedule_id', $scheduleId)
        ->where('booked_date', $date)
        ->whereNotIn('status', [Booking::STATUS_CANCELLED])
        ->lockForUpdate()  // ← SQL FOR UPDATE lock
        ->exists();
}

// Get greyed-out dates for FE date picker
public function getTakenDatesBySchedule(int $scheduleId) {
    return $this->model
        ->where('doctor_schedule_id', $scheduleId)
        ->where('booked_date', '>=', now()->toDateString())
        ->whereNotIn('status', [Booking::STATUS_CANCELLED])
        ->pluck('booked_date');
}
```

### 2.2 Service Layer (Business Logic)

**BaseService** (`app/Services/BaseService.php`)

```php
abstract class BaseService {
    protected BaseRepository $repository;
    
    public function __construct(BaseRepository $repository) { ... }
    // Delegates to repository
    public function all() { ... }
    public function find(int $id) { ... }
    public function create(array $attributes) { ... }
    public function update(int $id, array $attributes) { ... }
    public function delete(int $id) { ... }
}
```

**Services NOT extending BaseService** (Complex logic with multiple repositories):
- `BookingService`: Multiple repositories (BookingRepository, ScheduleRepository)
- `PaymentService`: Multiple repositories (PaymentRepository, OrderRepository)
- `AuthService`: User + Patient repositories
- `DashboardService`: Aggregation queries

**Example: BookingService Core Logic**

```php
public function createBooking(array $data): Model {
    return DB::transaction(function () use ($data) {
        // 1. RESOLVE PATIENT from token or admin input
        $authUser = User::findOrFail(Auth::id());
        if ($authUser->role === 'admin') {
            // Admin can book for other patients
            if (empty($data['patient_id'])) throw new ValidationException(...);
        } else {
            // Patient role → own patient_id from token
            $patient = $authUser->patient ?? throw new ValidationException(...);
            $data['patient_id'] = $patient->patient_id;
        }

        // 2. VALIDATE SCHEDULE OWNERSHIP
        $schedule = Schedule::findOrFail($data['doctor_schedule_id']);
        if ($schedule->doctor_id != $data['doctor_id']) {
            throw new ValidationException('Schedule mismatch');
        }

        // 3. LOCK SLOT (prevent race condition)
        if ($this->bookingRepository->lockSlot($data['doctor_schedule_id'], $data['booked_date'])) {
            throw new ValidationException('Slot already taken');
        }

        // 4. INJECT TIME from doctor_schedule
        $data['start_time'] = $schedule->start_time;
        $data['end_time'] = $schedule->end_time;

        // 5. CREATE BOOKING
        $booking = $this->bookingRepository->create($data);

        // 6. LOAD RELATIONS
        $booking->load(['doctor.user', 'service', 'doctorSchedule']);

        // 7. FIRE EVENT
        BookingCreated::dispatch($booking);

        return $booking;
    });
}
```

**Key Decisions**:
- Use `DB::transaction()` wrapper to ensure atomicity
- Explicit `lockForUpdate()` in repository prevents double-booking
- Schedule validation ensures doctors can't be manipulated
- Event dispatching for async notifications

**Other Notable Services**:

```php
// PaymentService
public function initiate(int $orderId): array {
    // Validates order.status == 'pending'
    // Prevents duplicate payment (single payment per order)
    // Generates unique order_number for Midtrans tracking
    // Requests Snap token from Midtrans
    // Returns payment_url for redirect
}

public function handleWebhook(array $payload): void {
    // Verifies Midtrans signature
    // Updates payment.status based on transaction_status
    // Updates order.status accordingly
    // Idempotent: safe to call multiple times
}

// AuthService
public function register(array $data): array {
    return DB::transaction(function () use ($data) {
        // 1. Check email not already registered
        // 2. Create user with hashed password
        // 3. Create patient profile
        // 4. Generate Sanctum token
        return ['user' => $user, 'token' => $token];
    });
}

public function login(array $credentials): array {
    // 1. Find user by email
    // 2. Verify password with Hash::check()
    // 3. Check account status == 'active'
    // 4. Update last_login_at
    // 5. Generate Sanctum token
}

public function refresh(User $user): array {
    // 1. Revoke old token
    // 2. Generate new token (token rotation)
    // Paired with frontend interceptor for seamless refresh
}
```

### 2.3 Controller Layer (Request Handling)

**BaseController** (implicit structure):
All controllers inherit from `Controller` base class and use `ApiResponseTrait`.

**Controller Pattern**:

```php
class BookingController extends Controller {
    use ApiResponseTrait;
    
    public function __construct(protected BookingService $bookingService) {}
    
    public function index(Request $request): JsonResponse {
        try {
            $bookings = $this->bookingService->getAllWithRelations($request->user());
            return $this->successResponse($bookings);
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil data booking.', 500);
        }
    }
    
    public function store(StoreBookingRequest $request): JsonResponse {
        try {
            $booking = $this->bookingService->createBooking($request->validated());
            return $this->createdResponse($booking, 'Booking berhasil dibuat.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), $e->getMessage());
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal membuat booking.', 500);
        }
    }
}
```

**Key Traits**:
- `ApiResponseTrait`: Consistent JSON response formatting
- Request objects for validation (`StoreBookingRequest`, `UpdateBookingStatusRequest`)

### 2.4 Request Validation Layer

**Example: StoreBookingRequest**

```php
class StoreBookingRequest extends FormRequest {
    public function rules(): array {
        return [
            'patient_id' => 'nullable|exists:patients,patient_id',
            'doctor_id'  => 'required|exists:doctors,doctor_id',
            'service_id' => 'required|exists:services,service_id',
            'doctor_schedule_id' => [
                'required',
                Rule::exists('doctor_schedules', 'schedule_id')->where('is_active', true),
            ],
            'booked_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string|max:500',
        ];
    }
    
    public function messages(): array {
        // Custom localized error messages
    }
}
```

**Validation Flow**:
1. FormRequest validates input
2. If invalid → 422 Validation Error with detailed field errors
3. If valid → `$request->validated()` returns clean data
4. Service layer performs business logic validation (e.g., slot locking)

---

## 3. API Design (RESTful Routes)

### Route Structure (`routes/api.php`)

**Auth Routes** (Public + Private)
```
POST   /auth/register       → register new user (public)
POST   /auth/login          → authenticate & get token (public)
POST   /auth/logout         → revoke current token (private)
GET    /auth/me             → get authenticated user (private)
POST   /auth/refresh        → rotate token (private)
```

**Doctor Routes** (Public for listing, Admin for management)
```
GET    /doctors                                    → list all active doctors (public)
GET    /doctors/{id}                               → single doctor detail (public)
GET    /doctors/available                          → list available doctors (public)
GET    /doctors/{doctorId}/schedules/active        → active schedules for doctor (public)
GET    /doctors/{doctorId}/schedules/{scheduleId}/taken-dates  → booked dates (public)

# Admin only
POST   /doctors                                    → create doctor
PUT    /doctors/{id}                               → update doctor
PATCH  /doctors/{id}/availability                 → toggle availability
DELETE /doctors/{id}                               → soft delete
POST   /doctors/{doctorId}/schedules               → create schedule
PUT    /doctors/{doctorId}/schedules/{scheduleId}  → update schedule
```

**Booking Routes** (Private, role-gated)
```
GET    /bookings              → list (role-filtered)
POST   /bookings              → create (patient only)
GET    /bookings/{id}         → detail
PATCH  /bookings/{id}/status  → update status (role-gated)
DELETE /bookings/{id}         → soft delete (admin only)
```

**Payment Routes** (Private)
```
POST   /payments/initiate           → request Snap token
GET    /payments/order/{orderId}    → check payment status
POST   /payments/webhook            → Midtrans callback (webhook)
```

**Products, Services, Orders** Routes follow same pattern.

### Response Format

**Success Response** (200, 201)
```json
{
  "status": "success",
  "message": "Optional message",
  "data": { /* resource or array */ }
}
```

**Error Response** (400, 404, 422, 500)
```json
{
  "status": "error",
  "message": "Error description",
  "errors": { /* optional field errors */ }
}
```

**Example Validation Error** (422)
```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "booked_date": ["This slot is already taken."],
    "doctor_schedule_id": ["Jadwal tidak tersedia atau sudah dinonaktifkan."]
  }
}
```

---

## 4. Authentication Mechanism (Sanctum Token-Based)

### Architecture

```
User Registration
    ↓
Create User + Patient (transaction)
    ↓
Generate Personal Access Token (Sanctum)
    ↓
Return token to client
    ↓
Client stores in localStorage
    ↓
Client sends via Authorization: Bearer <token> header
    ↓
Sanctum middleware validates token against personal_access_tokens table
    ↓
Inject $request->user() with authenticated User model
```

### Implementation Details

**Custom Primary Key Handling**:

```php
class User extends Authenticatable {
    protected $primaryKey = 'user_id';  // Override default 'id'
    
    // Required: override Sanctum's expectations
    public function getAuthIdentifierName(): string {
        return 'user_id';
    }
    
    public function getAuthIdentifier(): mixed {
        return $this->user_id;
    }
}
```

**Token Generation**:
```php
$token = $user->createToken('auth_token')->plainTextToken;
// Returns hashed token stored in personal_access_tokens table
// plainTextToken = unhashed version sent to client
```

**Middleware Stack**:
```php
Route::middleware(['auth:sanctum'])->group(...)  // Verify token valid
Route::middleware(['auth:sanctum', 'role:admin'])->group(...)  // Verify role
```

**RoleMiddleware** (Custom):
```php
class RoleMiddleware {
    public function handle(Request $request, Closure $next, string ...$roles): Response {
        $user = $request->user();
        
        if (!$user) return response()->json([...], 401);
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have access...',
                'your_role' => $user->role,
                'required_roles' => $roles,
            ], 403);
        }
        return $next($request);
    }
}
```

### Token Lifecycle

1. **Generation** (after login/register): Sanctum creates personal access token record
2. **Transmission**: Plain token sent to client, hashed version stored in DB
3. **Validation**: Each request → verify hashed token matches request header
4. **Rotation** (refresh endpoint): Old token revoked, new token issued
5. **Revocation** (logout): Token record deleted from DB

### Security Considerations

- ✅ **HTTPS Required**: Token transmitted in header (vulnerable over HTTP)
- ✅ **httpOnly Cookies Not Used**: localStorage used instead (XSS vulnerability if app compromised)
- ✅ **Token Expiry**: Not explicitly set, relies on Sanctum's default behavior
- ⚠️ **CORS**: Must be configured to prevent unauthorized origins
- ⚠️ **CSRF**: API uses token auth, not form-based session

---

## 5. Business Logic Layers

### Data Flow: Booking Creation

```
Client (FE)
    ↓ POST /bookings { doctor_id, service_id, doctor_schedule_id, booked_date, notes }
    ↓
BookingController::store(StoreBookingRequest $request)
    ↓ Validates structure: doctor_id exists, schedule is active, date >= today
    ↓
BookingService::createBooking($validated)
    ↓ Inside DB::transaction():
    ├─ Resolve patient_id from token (patient role) or request (admin role)
    ├─ Load schedule + validate ownership (schedule.doctor_id == request.doctor_id)
    ├─ Lock slot: SELECT ... FOR UPDATE (prevents race condition)
    ├─ Inject start_time, end_time from schedule
    ├─ Create booking record
    ├─ Load relationships (doctor, service, schedule, patient)
    └─ Dispatch BookingCreated event
    ↓
BookingRepository::create() → INSERT booking record
    ↓
Event System:
    ├─ BookingCreated event queued
    └─ SendBookingNotificationListener (currently empty stub)
    ↓
Controller returns 201 Created with booking data
    ↓
Client receives and displays success message
```

### Data Flow: Payment Processing

```
Client (FE) Order Created
    ↓
Client: POST /payments/initiate { order_id }
    ↓
PaymentController
    ↓
PaymentService::initiate($orderId)
    ├─ Validate order.status == 'pending'
    ├─ Check not already paid (unique constraint on payment.order_id)
    ├─ Generate order_number: 'ORD-' . timestamp . '-' . random(6)
    ├─ Save order_number to orders table
    ├─ Create payment record (status: pending, midtrans_id: NULL)
    ├─ Build Snap request params from order items
    ├─ Call Midtrans\Snap::getSnapToken($params)
    ├─ Generate payment_url from returned token
    └─ Return payment_url + order_number + amount
    ↓
Client Receives payment_url
    ↓
Client Redirects User to payment_url
    ↓ ───────────────── MIDTRANS GATEWAY ─────────────────
    ↓
User Selects Payment Method (QRIS, GCash, Bank Transfer, etc.)
    ↓
User Completes Payment or Cancels
    ↓
Midtrans Sends Webhook POST /payments/webhook
    │ Payload: { transaction_id, order_id, transaction_status, ... }
    │
    └─→ PaymentService::handleWebhook($payload)
        ├─ Verify Midtrans signature key (security)
        ├─ Lookup order by order_number from payload
        ├─ Update payment.status based on transaction_status:
        │   - 'settlement' → success
        │   - 'deny' → failed
        │   - 'cancel' → failed
        │   - 'expire' → expired
        ├─ Update payment.midtrans_id, payment_method, payment_channel
        ├─ Update payment.paid_at (if successful)
        ├─ Update order.status based on payment.status
        └─ Return 200 OK to Midtrans
    ↓
Midtrans Redirects Client to finish_url configured in backend
    └─ finish_url = /payment/result?order_id=...&status_code=...
    ↓
Client: GET /payment/result (no auth required, uses query params)
    ├─ Fetch order by order_id from query
    ├─ Display success/failure page
    └─ Provide receipt/download invoice
```

### Idempotency & Webhook Safety

**Problem**: Midtrans webhook can be called multiple times (network retry).  
**Solution**: PaymentService designed for idempotent operations:

```php
public function handleWebhook(array $payload): void {
    // All operations are "upsert" or idempotent status updates
    // - Lookup order by order_number (unique)
    // - Update payment.status (same status = no-op)
    // - Update order.status (same status = no-op)
    // Calling twice with same payload = same result
}
```

---

## 6. Event System & Notification Architecture

### Event Definition

**BookingCreated** (`app/Events/Booking/BookingCreated.php`)

```php
class BookingCreated {
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public Booking $booking;
    
    public function __construct(Booking $booking) {
        $this->booking = $booking;
    }
}
```

**Dispatch Point**: `BookingService::createBooking()` at transaction completion:
```php
BookingCreated::dispatch($booking);
```

### Event Listener

**SendBookingNotificationListener** (`app/Listeners/SendBookingNotificationListener.php`)

```php
class SendBookingNotificationListener {
    public function handle(BookingCreated $event): void {
        // Currently: Empty stub
        // Intended behavior (not yet implemented):
        // - Send email notification to patient
        // - Send SMS notification to doctor
        // - Create notification record in notifications table
    }
}
```

**Current Status**: ⚠️ **Event infrastructure exists but listeners are stubs**. The event is dispatched but not consumed.

### Notifications Table

```sql
notifications:
- id (PK)
- user_id (FK)
- type: STRING
- title, body: TEXT
- read_at: TIMESTAMP (nullable)
- created_at
```

**Planned Usage**: Store in-app notifications for each user. Frontend can fetch via `GET /notifications`.

---

## 7. External Integrations

### 7.1 Midtrans Payment Gateway

**Configuration** (`config/midtrans.php`):
```php
'server_key' => env('MIDTRANS_SERVER_KEY'),
'client_key' => env('MIDTRANS_CLIENT_KEY'),
'is_production' => env('MIDTRANS_PRODUCTION', false),
'app_id' => env('MIDTRANS_APP_ID'),
```

**Integration Flow**:

1. **Initialization** (PaymentService):
```php
Config::$serverKey = config('midtrans.server_key');
Config::$clientKey = config('midtrans.client_key');
Config::$isProduction = config('midtrans.is_production');
```

2. **Request Snap Token**:
```php
$snapParams = [
    'transaction_details' => [
        'order_id' => $orderNumber,
        'gross_amount' => $totalAmount,
    ],
    'customer_details' => [
        'first_name' => $patient->user->full_name,
        'email' => $patient->user->email,
        'phone' => $patient->user->phone,
    ],
    'item_details' => [
        ['id' => 'product-1', 'price' => 100000, 'quantity' => 2, 'name' => '...'],
    ],
    'callbacks' => [
        'finish' => url('/payment/result'),
        'error'  => url('/payment/result'),
        'pending' => url('/payment/result'),
    ],
];

$snapToken = Snap::getSnapToken($snapParams);
$paymentUrl = $this->snapUrl($snapToken);  // Returns Midtrans URL
```

3. **Webhook Handling**:
```php
// Payload from Midtrans
$payload = [
    'transaction_id' => 'abc123...',
    'order_id' => 'ORD-20260606...',
    'transaction_status' => 'settlement',  // or 'deny', 'cancel', 'expire'
    'signature_key' => 'hash(...)',
];

// Backend verifies signature
$expectedSignature = hash('sha512', $orderId . $statusCode . $serverKey);
if ($payload['signature_key'] !== $expectedSignature) {
    throw new Exception('Invalid signature');
}

// Update order + payment
payment->update(['status' => 'success', 'paid_at' => now()]);
order->update(['status' => 'completed']);
```

**Status Mapping**:
| Midtrans | Internal | Action |
|----------|----------|--------|
| settlement | success | Mark order as paid |
| pending | pending | Wait for user action |
| deny | failed | Reject payment |
| cancel | failed | User cancelled |
| expire | expired | Payment time window passed |

---

## 8. Database Transaction Handling

### Transaction Safety Pattern

**BookingService::createBooking()**:

```php
return DB::transaction(function () use ($data) {
    // All queries inside this closure are wrapped in TRANSACTION
    
    // If any exception thrown → ROLLBACK entire transaction
    // If all succeed → COMMIT
    
    // Operations:
    // 1. SELECT (with lock)
    // 2. INSERT booking
    // 3. Event dispatch (after commit)
});
```

**Key Points**:
- ✅ **Atomicity**: All-or-nothing guarantee
- ✅ **Race Condition Prevention**: `lockForUpdate()` acquires row-level locks
- ✅ **Consistency**: Foreign key constraints prevent invalid states
- ✅ **Isolation**: Transactions isolated by database (depending on isolation level)

### Race Condition Example

**Problem**: Two users trying to book same slot simultaneously.

```
User A                          User B
SELECT * FROM bookings WHERE    →
  schedule=X AND date=Y             ← SELECT * FROM bookings WHERE
  FOR UPDATE                           schedule=X AND date=Y
                                       FOR UPDATE (waits)
                                   ← (got lock first in some scenarios)
INSERT booking (A)
COMMIT
                                   ← FOR UPDATE now returns 1 row
                                   INSERT booking (B) fails with validation
```

**Solution**: `BookingRepository::lockSlot()` + `isSlotTaken()` check.

---

## Additional Backend Infrastructure

### Error Handling

**ApiResponseTrait** (all controllers):

```php
trait ApiResponseTrait {
    protected function successResponse($data, ?string $message = null, int $code = 200) { ... }
    protected function createdResponse($data, ?string $message = null) { ... }
    protected function errorResponse(string $message, int $code = 400, array $errors = []) { ... }
    protected function validationErrorResponse(array $errors) { ... }
    protected function notFoundResponse(string $message) { ... }
}
```

**Error Hierarchy**:
```
200 OK                  → Operation successful
201 Created             → Resource created
400 Bad Request         → Malformed request
401 Unauthorized        → Token invalid/expired
403 Forbidden           → Token valid, but role not permitted
404 Not Found           → Resource doesn't exist
422 Validation Error    → Input validation failed (detailed errors)
500 Internal Error      → Unhandled exception
```

### Soft Deletes (SoftDeletes Trait)

```php
class Booking extends Model {
    use SoftDeletes;
}

// Queries automatically exclude soft-deleted records
Booking::all();  // Excludes deleted bookings
Booking::withTrashed()->get();  // Includes deleted bookings
Booking::onlyTrashed()->get();  // Only deleted bookings
```

**Benefit**: Preserve audit trail, allow recovery of deleted data.

---

# FRONTEND ARCHITECTURE

## 1. Component Structure & Organization

### Directory Layout

```
src/
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx      (wraps pages with navbar/sidebar)
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Form/
│       ├── Table/
│       └── ...
├── contexts/
│   ├── AuthContext.jsx         (user auth state)
│   ├── BookingContext.jsx      (booking CRUD state)
│   └── CartContext.jsx         (e-pharmacy cart state)
├── api/
│   ├── axios.js                (HTTP client + interceptors)
│   ├── authApi.js
│   ├── bookingApi.js
│   ├── paymentApi.js
│   ├── doctorApi.js
│   ├── productApi.js
│   └── ...
├── pages/
│   ├── HomePage.jsx
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── patient/
│   │   ├── DashboardPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── OrderPage.jsx
│   │   ├── CartPage.jsx
│   │   └── InProductPage.jsx
│   ├── doctor/
│   │   ├── DashboardPage.jsx
│   │   ├── RecordPage.jsx
│   │   └── ...
│   ├── admin/
│   │   ├── DashboardPage.jsx
│   │   ├── DoctorPage.jsx
│   │   ├── ServicePage.jsx
│   │   ├── ProductPage.jsx
│   │   └── AdminBookingPage.jsx
│   ├── PaymentResultPage.jsx
│   └── NotFoundPage.jsx
├── route/
│   ├── index.jsx               (route definitions)
│   └── ProtectedRoute.jsx      (role-based access guard)
├── App.jsx                     (provider composition)
└── main.jsx                    (entry point)
```

### Component Hierarchy Example: Booking Flow

```
App
  ├─ BrowserRouter
  ├─ AuthProvider
  │   └─ BookingProvider
  │       └─ CartProvider
  │           └─ AppRoutes
  │               ├─ ProtectedRoute (allowedRoles: ['patient'])
  │               │   └─ MainLayout
  │               │       └─ BookingPage
  │               │           ├─ DoctorSelector
  │               │           ├─ ServiceSelector
  │               │           ├─ TimeSlotPicker
  │               │           ├─ DatePicker (greyed-out taken dates)
  │               │           └─ BookingForm (confirmation modal)
  │               │
  │               ├─ ProtectedRoute (allowedRoles: ['patient'])
  │               │   └─ MainLayout
  │               │       └─ MyBookingsPage
  │               │           └─ BookingList
  │               │               └─ BookingCard (status, actions)
  │               │
  │               └─ PaymentResultPage (public)
  │                   └─ PaymentStatus (displays Midtrans result)
```

---

## 2. State Management (Context API)

### 2.1 AuthContext

```jsx
// AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount: restore session from localStorage
    try {
      const storedToken = localStorage.getItem('aura_token');
      const storedUser = localStorage.getItem('aura_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Refresh user data from server (get fresh patient_id)
        getMe()
          .then(res => {
            const freshUser = res.data?.data ?? res.data;
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('aura_user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('aura_token');
            localStorage.removeItem('aura_user');
            setUser(null);
            setToken(null);
          })
          .finally(() => setIsLoading(false));
        return;
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
    } finally {
      setIsLoading(false);
    }

    // Listen for unauthorized event (from axios interceptor)
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const persistSession = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('aura_token', tokenValue);
    localStorage.setItem('aura_user', JSON.stringify(userData));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    const { user: userData, token: tokenValue } = res.data.data;
    persistSession(userData, tokenValue);

    // Fetch full user data (includes patient_id)
    try {
      const meRes = await getMe();
      const fullUser = meRes.data?.data ?? meRes.data;
      if (fullUser) persistSession(fullUser, tokenValue);
      return fullUser ?? userData;
    } catch {
      return userData;
    }
  }, [persistSession]);

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    const { user: userData, token: tokenValue } = res.data.data;
    persistSession(userData, tokenValue);
    return userData;
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Token expired — clear anyway
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within <AuthProvider>');
  return ctx;
};
```

**Key Decisions**:
- ✅ Token + user stored in localStorage (persistent across refresh)
- ✅ On app mount → restore from localStorage and validate via /auth/me
- ✅ Manual session restoration (vs automatic hydration) allows control
- ⚠️ localStorage vulnerable to XSS (if attacker injects script, token exposed)

### 2.2 BookingContext

```jsx
export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const extractErrorMessage = (err, fallback = "Terjadi kesalahan.") => {
    const errData = err?.response?.data;
    // Prioritize validation errors (422)
    if (errData?.errors) {
      const firstMsg = Object.values(errData.errors).flat()[0];
      if (firstMsg) return firstMsg;
    }
    return errData?.message ?? err?.normalizedMessage ?? fallback;
  };

  const fetchBookings = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBookings(params);
      const data = res.data?.data ?? res.data;
      setBookings(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal memuat data booking."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBookingById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBookingById(id);
      const data = res.data?.data ?? res.data;
      setActiveBooking(data);
      return data;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data) => {
    setError(null);
    try {
      const res = await apiCreateBooking(data);
      const booking = res.data?.data ?? res.data;
      setBookings(prev => [booking, ...prev]);
      return booking;
    } catch (err) {
      const msg = extractErrorMessage(err, "Gagal membuat booking.");
      setError(msg);
      throw err;  // Re-throw for caller to handle
    }
  }, []);

  const updateBookingStatus = useCallback(async (id, status) => {
    setError(null);
    try {
      const res = await apiUpdateBookingStatus(id, status);
      const updated = res.data?.data ?? res.data;
      setBookings(prev => prev.map(b => b.booking_id === id ? updated : b));
      if (activeBooking?.booking_id === id) setActiveBooking(updated);
      return updated;
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    }
  }, [activeBooking?.booking_id]);

  const value = {
    bookings,
    activeBooking,
    isLoading,
    error,
    clearError,
    fetchBookings,
    fetchBookingById,
    createBooking,
    updateBookingStatus,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
```

**Key Decisions**:
- ⚠️ **No auto-fetch**: Fetch called explicitly by pages (avoids unnecessary requests)
- ✅ **Error extraction**: Handles both 422 validation errors and generic errors
- ✅ **Optimistic updates**: Add booking to list immediately (assume success)
- ✅ **Re-throw errors**: Let components handle errors (show toast, retry, etc.)

### 2.3 CartContext

```jsx
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToCart = (product, quantity) => { ... };
  const removeFromCart = (productId) => { ... };
  const updateQuantity = (productId, quantity) => { ... };
  const clearCart = () => { ... };

  // Persist cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  return <CartContext.Provider value={...}>{children}</CartContext.Provider>;
}
```

---

## 3. API Integration Layer

### 3.1 Axios Configuration

```javascript
// api/axios.js
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const STORAGE_KEY_TOKEN = 'aura_token';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response Interceptor (Token Rotation) ───────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  
  async (error) => {
    const originalRequest = error.config;

    // Retry on 401 if not already retried and not refresh request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get new token
        const res = await api.post('/auth/refresh');
        const newToken = res.data.data.token;

        setToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        
        // Update localStorage user if returned
        if (res.data.data.user) {
          localStorage.setItem('aura_user', JSON.stringify(res.data.data.user));
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear session
        clearAuth();
        window.dispatchEvent(new Event('unauthorized'));
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error format
    error.normalizedMessage = error.response?.data?.message ?? error.message;
    return Promise.reject(error);
  }
);

export const getToken = () => localStorage.getItem(STORAGE_KEY_TOKEN);
export const setToken = (t) => localStorage.setItem(STORAGE_KEY_TOKEN, t);
export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem('aura_user');
};

export default api;
```

**Key Features**:
- ✅ **Automatic token injection**: Every request gets Authorization header
- ✅ **Token rotation**: 401 triggers automatic refresh, retries request
- ✅ **Queue handling**: Multiple 401s don't cause multiple refresh requests
- ✅ **Error normalization**: Consistent error object format
- ⚠️ **Infinite loop prevention**: Skip refresh request itself to avoid recursion

### 3.2 API Modules (Separation of Concerns)

```javascript
// api/authApi.js
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const refreshToken = () => api.post('/auth/refresh');

// api/bookingApi.js
export const getBookings = (params = {}) => api.get('/bookings', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const createBooking = (data) => api.post('/bookings', data);
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status });

// api/paymentApi.js
export const initiatePayment = (orderId) => api.post('/payments/initiate', { order_id: orderId });
export const getPaymentByOrder = (orderId) => api.get(`/payments/order/${orderId}`);

// api/doctorApi.js
export const getDoctors = () => api.get('/doctors');
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const getAvailableDoctors = () => api.get('/doctors/available');
export const getDoctorSchedules = (doctorId) => api.get(`/doctors/${doctorId}/schedules/active`);
export const getTakenDates = (doctorId, scheduleId) => 
  api.get(`/doctors/${doctorId}/schedules/${scheduleId}/taken-dates`);

// Similar for: productApi, serviceApi, orderApi, patientApi, etc.
```

**Architecture Decision**: Each domain has its own API module. Controllers consume these modules, contexts orchestrate them.

---

## 4. Routing Structure

### 4.1 ProtectedRoute Component

```jsx
// route/ProtectedRoute.jsx
const ROLE_HOME = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for auth restoration
  if (isLoading) return null;

  // Not authenticated → redirect to login (with location state for return)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role mismatch → redirect to user's own dashboard
  if (!allowedRoles.includes(user.role)) {
    const fallback = ROLE_HOME[user.role] ?? '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;  // Render nested routes
};
```

**Key Decisions**:
- ✅ `isLoading` guard prevents redirect flash (wait for token restore)
- ✅ Save `location` in state for post-login redirect to original page
- ✅ Role mismatch redirects to role-specific home (not generic "/")
- ✅ `replace` instead of `push` prevents back navigation to protected routes

### 4.2 Route Configuration

```jsx
// route/index.jsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/products" element={<ProductsPage />} />
  <Route path="/payment/result" element={<PaymentResultPage />} />  {/* PUBLIC */}
  
  {/* Protected: Patient */}
  <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
    <Route element={<MainLayout />}>
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/booking" element={<BookingPage />} />
      <Route path="/patient/my-bookings" element={<MyBookingsPage />} />
      <Route path="/patient/order" element={<OrderPage />} />
      <Route path="/patient/cart" element={<CartPage />} />
      <Route path="/patient/products" element={<InProductPage />} />
    </Route>
  </Route>

  {/* Protected: Doctor */}
  <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
    <Route element={<MainLayout />}>
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/records" element={<RecordPage />} />
      <Route path="/doctor/schedule" element={<ComingSoon />} />
    </Route>
  </Route>

  {/* Protected: Admin */}
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route element={<MainLayout />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/doctors" element={<DoctorPage />} />
      <Route path="/admin/services" element={<ServicePage />} />
      <Route path="/admin/products" element={<ProductPage />} />
      <Route path="/admin/bookings" element={<AdminBookingPage />} />
    </Route>
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

**Structure**:
```
Routes
├─ Public pages (not guarded)
├─ ProtectedRoute[patient]
│   └─ MainLayout
│       ├─ Dashboard
│       ├─ Booking
│       └─ ...
├─ ProtectedRoute[doctor]
│   └─ MainLayout
│       └─ ...
└─ ProtectedRoute[admin]
    └─ MainLayout
        └─ ...
```

---

## 5. Form Handling & Validation

### 5.1 Example: BookingForm

```jsx
function BookingForm() {
  const [formData, setFormData] = useState({
    doctor_id: '',
    service_id: '',
    doctor_schedule_id: '',
    booked_date: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createBooking } = useBooking();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const booking = await createBooking(formData);
      toast.success('Booking created successfully!');
      navigate('/patient/my-bookings', { state: { booking } });
    } catch (err) {
      const errData = err.response?.data;
      
      // Handle validation errors (422)
      if (errData?.errors) {
        setErrors(errData.errors);  // { doctor_id: [...], booked_date: [...] }
      } else {
        // Generic error
        toast.error(errData?.message ?? 'Failed to create booking');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        name="doctor_id"
        value={formData.doctor_id}
        onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
      >
        <option value="">Select Doctor</option>
        {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.user.full_name}</option>)}
      </select>
      {errors.doctor_id && <span className="error">{errors.doctor_id[0]}</span>}

      {/* Similar for service_id, doctor_schedule_id, booked_date, notes */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
}
```

**Flow**:
1. User fills form
2. Submit → API call in context
3. If 422 validation error → display field-level errors
4. If success → toast + navigate
5. If generic error → show error message

### 5.2 Frontend Validation (Pre-flight)

```jsx
// Validate before submit
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.doctor_id) newErrors.doctor_id = ['Doctor is required'];
  if (!formData.booked_date) newErrors.booked_date = ['Date is required'];
  if (new Date(formData.booked_date) < new Date().setHours(0,0,0,0)) {
    newErrors.booked_date = ['Cannot book past dates'];
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Validation Strategy**: 
- ✅ Frontend: UX-focused, prevent obviously bad input, disable submit
- ✅ Backend: Security-focused, validate everything (cannot trust FE)

---

## 6. Styling Approach

### Assumed Tailwind CSS (Based on Layout Complexity)

```jsx
function BookingCard({ booking }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {booking.doctor.user.full_name}
          </h3>
          <p className="text-gray-600">{booking.service.service_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {booking.status}
        </span>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-medium">{formatDate(booking.booked_date)}</p>
        </div>
        <div>
          <p className="text-gray-500">Time</p>
          <p className="font-medium">{booking.start_time} - {booking.end_time}</p>
        </div>
        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-medium capitalize">{booking.status}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Authentication Flow (Complete)

### Login Sequence

```
User Input (email, password)
    ↓
LoginPage → AuthContext.login()
    ↓
axios POST /auth/login { email, password }
    ↓
Backend validates credentials, returns { user, token }
    ↓
AuthContext:
  ├─ persistSession(user, token)  // Store in state + localStorage
  ├─ Call GET /auth/me to get fresh user data (with patient_id)
  └─ Update context
    ↓
LoginPage:
  ├─ Navigate to /patient/dashboard (or location.state.from)
    ↓
AppRoutes checks route permissions:
  ├─ ProtectedRoute sees user.authenticated = true
  ├─ Check user.role matches allowedRoles
  └─ Render ProtectedRoute content
```

### Token Refresh Sequence

```
User makes request → axios interceptor injects Bearer token
    ↓
If 401 Unauthorized received:
    ├─ Check if already refreshing (flag: isRefreshing)
    ├─ If yes → queue request, wait for refresh result
    ├─ If no → start refresh:
    │   ├─ POST /auth/refresh
    │   ├─ Get new token from response
    │   ├─ setToken(newToken)
    │   ├─ Update axios default header
    │   ├─ Process queued requests with new token
    │   └─ Retry original request
    ↓
If refresh also fails:
    ├─ clearAuth()
    ├─ Dispatch 'unauthorized' event
    ├─ AuthContext hears event, clears state
    └─ Redirect to /login
```

**Key Feature: Seamless Rotation**
- User doesn't notice token expired (automatic refresh + retry)
- Prevents "session expired" errors from being user-visible
- Multi-request protection: doesn't call refresh 5 times for 5 concurrent 401s

---

## 8. Error Handling & Loading States

### 8.1 API Error Extraction

```jsx
// Consistent error handling pattern
const extractErrorMessage = (err, fallback = "Terjadi kesalahan") => {
  const errData = err?.response?.data;
  
  // Priority 1: Validation errors (422)
  if (errData?.errors) {
    const firstMsg = Object.values(errData.errors).flat()[0];
    if (firstMsg) return firstMsg;
  }
  
  // Priority 2: Error message from backend
  if (errData?.message) return errData.message;
  
  // Priority 3: Normalized message from interceptor
  if (err?.normalizedMessage) return err.normalizedMessage;
  
  // Priority 4: Default fallback
  return fallback;
};
```

### 8.2 Loading States

```jsx
// Example: MyBookingsPage
function MyBookingsPage() {
  const { bookings, isLoading, error, fetchBookings } = useBooking();
  
  useEffect(() => {
    fetchBookings();  // Trigger fetch on mount
  }, []);

  if (isLoading) return <div className="text-center py-8">Loading bookings...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!bookings.length) return <div>No bookings yet</div>;

  return (
    <div>
      {bookings.map(booking => (
        <BookingCard key={booking.booking_id} booking={booking} />
      ))}
    </div>
  );
}
```

**States Handled**:
- ✅ Loading: Show spinner/skeleton
- ✅ Error: Show error message + retry button
- ✅ Empty: Show empty state message
- ✅ Success: Render data

---

## 9. Payment Integration (Frontend Side)

### 9.1 Initiate Payment

```jsx
// OrderPage or CheckoutModal
async function handleCheckout() {
  try {
    setIsProcessing(true);
    
    // 1. Create order (backend)
    const orderRes = await createOrder({
      items: cart,
      booking_id: selectedBooking?.booking_id,
    });
    const orderId = orderRes.data.data.order_id;

    // 2. Initiate payment (backend requests Snap token from Midtrans)
    const paymentRes = await initiatePayment(orderId);
    const { payment_url } = paymentRes.data.data;

    // 3. Redirect to Midtrans payment page
    window.location.href = payment_url;
  } catch (err) {
    toast.error('Failed to initiate payment');
  } finally {
    setIsProcessing(false);
  }
}
```

### 9.2 Handle Payment Result

```jsx
// PaymentResultPage (public route)
function PaymentResultPage() {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  useEffect(() => {
    // Midtrans redirects here with query params:
    // ?order_id=...&status_code=...&transaction_status=...
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    const statusCode = params.get('status_code');
    const txnStatus = params.get('transaction_status');

    // Determine result
    const success = statusCode === '200' && txnStatus === 'settlement';
    
    setPaymentStatus({
      orderId,
      success,
      message: success ? 'Payment successful!' : 'Payment failed or pending'
    });
  }, [location.search]);

  return (
    <div className="text-center py-12">
      {paymentStatus?.success ? (
        <>
          <h1 className="text-green-600">Payment Successful!</h1>
          <p>Order ID: {paymentStatus.orderId}</p>
          <button onClick={() => navigate('/patient/dashboard')}>
            Back to Dashboard
          </button>
        </>
      ) : (
        <>
          <h1 className="text-red-600">Payment Failed</h1>
          <button onClick={() => navigate('/patient/order')}>
            Retry Payment
          </button>
        </>
      )}
    </div>
  );
}
```

---

# DATA FLOW & INTEGRATION

## Complete End-to-End: Booking + Payment

```
FRONTEND                          BACKEND                         MIDTRANS
─────────────────────────────────────────────────────────────────────────

User fills booking form:
- Select doctor
- Select service
- Select time slot (gets schedule_id)
- Pick date
- (Optional) add notes
  ↓
POST /bookings {
  doctor_id: 1,
  service_id: 5,
  doctor_schedule_id: 3,
  booked_date: '2026-06-15',
  notes: 'ada alergi'
}
  ↓                            BookingController::store
                              (validates structure)
                                  ↓
                              BookingService::createBooking
                              (in transaction):
                              • Resolve patient_id from token
                              • Lock slot (SELECT FOR UPDATE)
                              • Inject start_time/end_time
                              • Create booking record
                              • Fire BookingCreated event
                                  ↓
                               Return booking + 201
  ↓
Booking created response
  ↓
User proceeds to checkout
  ↓
CartContext + OrderPage
  ↓
POST /orders {
  items: [{ product_id, qty }, ...],
  booking_id: 123
}
  ↓                            OrderController::store
                              OrderService::createOrder
                              (in transaction):
                              • Create order record
                              • Create order_items for each product
                              • Calculate total_amount
                                  ↓
                               Return order_id
  ↓
GET /products/cart
(confirms pricing)
  ↓
User clicks "Pay Now"
  ↓
POST /payments/initiate {
  order_id: 456
}
  ↓                            PaymentController::initiate
                              PaymentService::initiate
                              (in transaction):
                              • Validate order.status == 'pending'
                              • Check not already paid
                              • Generate order_number
                              • Create payment record (pending)
                              • Build Snap params
                              • Call Midtrans\Snap::getSnapToken()
                                                              ↓
                                                    Return snap_token
                                  ↓
                              Build payment_url
                              Return { payment_url, order_number }
  ↓
Receive payment_url + order_number
  ↓
window.location.href = payment_url
(redirect to Midtrans gateway)
  ↓────────────────────────────────────────────────→ MIDTRANS SNAP
                                                        (Payment page)
                                                            ↓
                                                    User selects method
                                                            ↓
                                                    User completes/fails
                                                            ↓
                                                    Midtrans processes
                                                            ↓
                                                    Send webhook POST
  ↓←────────────────────────────────────────────── /payments/webhook
  
  {
    order_id: 'ORD-...',
    transaction_id: 'abc123',
    transaction_status: 'settlement'  (or deny/cancel/expire)
  }
                              PaymentController::webhook
                              PaymentService::handleWebhook
                              (idempotent):
                              • Verify signature
                              • Lookup order by order_number
                              • Update payment.status
                              • Update order.status
                              • Trigger success event (async)
                              
                              Return 200 OK to Midtrans
  ↓
Midtrans redirects to finish_url:
/payment/result?order_id=456&status_code=200&...
  ↓
PaymentResultPage displays result
  ↓
User sees "Payment Successful" or "Payment Failed"
  ↓
Navigate to dashboard or retry
```

---

# ARCHITECTURAL DECISIONS & PATTERNS

## Design Decisions & Rationale

### 1. Custom Primary Keys (user_id, patient_id, etc.)

**Decision**: Instead of default `id()`, explicitly name primary keys.

**Rationale**:
- ✅ Clarity in relationships (booking.patient_id vs booking.user_id)
- ✅ Consistency across all tables
- ✅ Prevent confusion when joining tables
- ⚠️ Requires `refresh()` instead of `fresh()` in repositories
- ⚠️ Requires `getAuthIdentifierName()` override in User model for Sanctum

**Impact**: Slightly more verbose but much clearer data model.

---

### 2. Repository → Service → Controller Pattern

**Decision**: Three distinct layers for data access, business logic, and request handling.

```
Controller (HTTP + validation)
    ↓
Service (business rules, transactions)
    ↓
Repository (query building, data access)
    ↓
Model (Eloquent ORM)
```

**Rationale**:
- ✅ Separation of concerns
- ✅ Easy to test (mock repositories)
- ✅ Reusable business logic (use service from anywhere)
- ✅ Consistent error handling in controllers
- ⚠️ More classes = more boilerplate
- ⚠️ Can be overkill for CRUD endpoints

**Example**:
```php
// DoctorService uses DoctorRepository
public function getAvailable(): Collection {
    return $this->repository
        ->allActive()
        ->filter(fn($d) => $d->is_available)
        ->sortBy('user.full_name');
}

// DoctorController uses DoctorService
public function available(): JsonResponse {
    return $this->successResponse(
        $this->doctorService->getAvailable()
    );
}
```

---

### 3. Event-Driven Notifications (Infrastructure Ready)

**Decision**: When booking created, dispatch `BookingCreated` event (but not consumed yet).

**Rationale**:
- ✅ Decouples notification logic from booking logic
- ✅ Easy to add listeners (email, SMS, push notification)
- ✅ Supports async processing (queue listeners)
- ⚠️ Currently no listeners implemented (event fired but ignored)

**Future Usage**:
```php
// Future: SendBookingNotificationListener
class SendBookingNotificationListener {
    public function handle(BookingCreated $event) {
        // Queue email to patient
        // Queue SMS to doctor
        // Create in-app notification
    }
}
```

---

### 4. Token Rotation with Interceptor Queue

**Decision**: Frontend automatically refreshes token + retries failed requests.

**Flow**:
```
Request fails with 401
    ↓
If not already refreshing:
  ├─ Mark isRefreshing = true
  ├─ POST /auth/refresh → get new token
  ├─ Retry original request
  └─ Mark isRefreshing = false
Else (already refreshing):
  └─ Queue request, wait for refresh to complete
```

**Rationale**:
- ✅ User doesn't see "session expired" message
- ✅ Works seamlessly during token rotation
- ✅ Handles race condition (5 concurrent 401s don't cause 5 refreshes)
- ⚠️ Complex interceptor logic (state machine)
- ⚠️ If refresh also fails, user gets hard logged out

**Code**:
```javascript
// Pseudocode of token refresh logic
if (401 && !alreadyRetried && !isRefreshRequest) {
  if (isRefreshing) {
    queue.push(request);  // Wait for refresh
  } else {
    isRefreshing = true;
    try {
      newToken = await refresh();
      processQueue(null, newToken);  // Retry all queued requests
    } catch {
      processQueue(error);  // Reject all queued requests
    } finally {
      isRefreshing = false;
    }
  }
}
```

---

### 5. Soft Deletes (Preserve Audit Trail)

**Decision**: Use `SoftDeletes` trait instead of permanent deletion.

**Rationale**:
- ✅ Preserves data for audit/compliance
- ✅ Can recover accidentally deleted records
- ✅ Doesn't break foreign key relationships
- ⚠️ Queries must remember to exclude soft-deleted records
- ⚠️ Can hide data from users (soft-deleted booking still shows in list if not filtered)

**Implementation**:
```php
// Automatic: Eloquent filters soft-deleted by default
Booking::all();  // Excludes deleted bookings

// Explicit: Include deleted records
Booking::withTrashed()->get();

// Only deleted
Booking::onlyTrashed()->get();

// Restore
$booking->restore();  // Undelete
```

---

### 6. Transaction Safety for Slot Booking

**Decision**: Use `DB::transaction() + lockForUpdate()` to prevent double-booking.

**Problem**:
```
Time 1: User A checks slot → empty
Time 2: User B checks slot → empty
Time 3: User A books slot → success
Time 4: User B books slot → should fail but doesn't (race condition)
```

**Solution**:
```php
// All in one transaction:
DB::transaction(function () {
    // Lock the row for update (prevents others from reading)
    if ($this->bookingRepository->lockSlot($scheduleId, $date)) {
        throw new Exception('Slot taken');
    }
    // Slot verified empty, create booking
    $booking = $this->bookingRepository->create($data);
});
```

**SQL Equivalent**:
```sql
BEGIN;
  SELECT * FROM bookings 
  WHERE schedule_id = 3 AND date = '2026-06-15'
  FOR UPDATE;  -- Lock row, prevent others from modifying
  
  -- Check if row exists
  IF EXISTS: THROW ERROR
  
  -- Otherwise create booking
  INSERT INTO bookings (...) VALUES (...);
COMMIT;
```

---

### 7. Explicit Schedule Selection (Avoid Day-of-Week Logic)

**Decision**: Frontend sends `doctor_schedule_id` (not `day_of_week`).

**Rationale**:
- ✅ Handles doctors with multiple schedules same day
- ✅ Backend only needs to validate the ID exists
- ✅ No ambiguity about which schedule user selected
- ⚠️ Frontend must fetch active schedules first (extra query)

**Old Way (problematic)**:
```php
// Backend receives day_of_week, tries to find schedule
$schedule = DoctorSchedule::where('doctor_id', $doctorId)
    ->where('day_of_week', 'Monday')  // Which Monday schedule?
    ->first();  // Ambiguous if doctor has 2 schedules Monday!
```

**New Way (clear)**:
```php
// Frontend receives schedule_id after fetching active schedules
$data = [
    'doctor_schedule_id' => 3,  // Specific schedule record
    'booked_date' => '2026-06-16',  // Must be this day_of_week
];

// Backend validates
$schedule = DoctorSchedule::findOrFail($data['doctor_schedule_id']);
if ($schedule->doctor_id != $data['doctor_id']) {
    throw new Exception('Schedule mismatch');
}
```

---

### 8. Role-Based Access Control (No Explicit Policies)

**Decision**: Use RoleMiddleware to guard routes, service layer for row-level access.

**Rationale**:
- ✅ Route-level: RoleMiddleware blocks unauthorized roles fast
- ✅ Business-level: Service validates ownership (e.g., patient can only see own bookings)
- ⚠️ No Laravel Policy classes (more manual, less elegant)
- ⚠️ Need to guard each endpoint separately

**Pattern**:
```php
// Route level
Route::middleware(['auth:sanctum', 'role:patient'])->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    // Non-patient roles blocked here
});

// Business level (service)
public function getAllWithRelations(User $user) {
    return match ($user->role) {
        'patient' => $user->patient
            ? $this->repository->findByPatient($user->patient->patient_id)
            : collect(),
        'doctor'  => $user->doctor
            ? $this->repository->findByDoctor($user->doctor->doctor_id)
            : collect(),
        'admin'   => $this->repository->allWithRelations(),
    };
}
```

---

### 9. Payment via External Gateway (Idempotent Webhooks)

**Decision**: Midtrans handles payment, sends webhook for updates.

**Rationale**:
- ✅ PCI compliance (don't store card details)
- ✅ Fraud detection (Midtrans handles)
- ✅ Multiple payment methods (Midtrans integrates all)
- ✅ Webhook idempotent (safe to call multiple times)
- ⚠️ Added complexity (webhook signature verification)
- ⚠️ Webhook delivery not guaranteed (rare edge cases)

**Idempotency Strategy**:
```php
// Same webhook payload called twice = same result
$payment = Payment::where('order_id', $orderId)->first();

if ($payment && $payment->status == 'success') {
    // Already processed, return 200 OK
    return response()->json(['status' => 'ok']);
}

// First time: update status
$payment->update(['status' => 'success', 'paid_at' => now()]);
```

---

### 10. Context API for State (vs Redux/Zustand)

**Decision**: Use React Context API instead of Redux for global state.

**Rationale**:
- ✅ Built-in, no dependencies
- ✅ Simple for 3 contexts (Auth, Booking, Cart)
- ✅ Easy to trace (props drilling visible)
- ⚠️ No time-travel debugging (like Redux DevTools)
- ⚠️ No middleware support (like Redux)
- ⚠️ Re-renders entire context consumers on any state change
- ⚠️ Overkill if only 1-2 components use context

**Scale Decision**: If project grows to 10+ contexts, consider Redux/Zustand.

---

## Anti-Patterns & Issues Identified

### 1. ⚠️ Event Listeners Are Stubs

**Issue**: `BookingCreated` event dispatched but `SendBookingNotificationListener` is empty.

```php
// Listener currently does nothing
public function handle(BookingCreated $event): void {
    // Empty!
}
```

**Impact**: No email/SMS sent when booking created.

**Fix**:
```php
public function handle(BookingCreated $event): void {
    Mail::send(new BookingConfirmationMail($event->booking));
    // Or queue async:
    // dispatch(new SendBookingNotificationJob($event->booking));
}
```

---

### 2. ⚠️ localStorage for Auth Tokens

**Issue**: Token stored in `localStorage`, vulnerable to XSS.

```javascript
localStorage.setItem('aura_token', token);
```

**Attack Vector**: If attacker injects script into page, they can read token.

**Risk Level**: High if there are input vulnerabilities (unescaped user content)

**Better Solution**:
```javascript
// httpOnly cookie (cannot be accessed by JavaScript)
// Sent automatically with each request
// Set-Cookie: token=...; httpOnly; Secure; SameSite=Strict
```

**Current Mitigation**: Ensure no user input is directly rendered without escaping.

---

### 3. ⚠️ No Explicit Token Expiry

**Issue**: Sanctum tokens don't have explicit expiry time in code.

```php
// Token created, no ->expiresAt() call
$token = $user->createToken('auth_token')->plainTextToken;
```

**Impact**: Tokens valid forever (until manually revoked).

**Risk**: If token leaked, attacker has permanent access until user logs out.

**Fix**:
```php
$token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;
```

---

### 4. ⚠️ No Rate Limiting on Auth Endpoints

**Issue**: No rate limit on `/auth/login` or `/auth/register`.

**Attack**: Brute force password guessing.

**Fix**:
```php
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');  // 5 attempts per minute
```

---

### 5. ⚠️ No CSRF Protection (API Uses Token Auth)

**Issue**: API uses Bearer token (not cookies), CSRF not applicable.

**Status**: Actually safe! Token auth is CSRF-safe by design.

**Why**: CSRF exploits cookie auto-sent behavior. Tokens must be explicitly sent.

---

### 6. ⚠️ Manual Data Sync Between Local State & Backend

**Issue**: Frontend caches data (bookings, orders) in context, can get stale.

```javascript
// BookingContext caches bookings
const [bookings, setBookings] = useState([]);

// If backend data changes (e.g., doctor updates booking status),
// local state not automatically invalidated
```

**Solution**: Add invalidation triggers.

```javascript
// Refetch on returning to page
useEffect(() => {
    if (location.pathname === '/patient/my-bookings') {
        fetchBookings();  // Refresh stale data
    }
}, [location.pathname]);
```

---

### 7. ⚠️ No Error Boundary in React

**Issue**: Unhandled exceptions can crash entire React app.

**Current**: No error boundary component.

**Fix**:
```jsx
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handler = (event) => {
      setError(event.error);
      // Log to Sentry, etc.
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (error) return <div>Something went wrong</div>;
  return children;
}
```

---

### 8. ⚠️ No Input Sanitization (XSS Risk)

**Issue**: User input (notes, bio) rendered without escaping.

```jsx
// Dangerous if notes contain HTML
<p>{booking.notes}</p>  // If notes = "<img src=x onerror=alert('xss')>"
```

**React Mitigates**: React escapes by default, but `dangerouslySetInnerHTML` bypasses it.

**Fix**: Always use `textContent` for user input.

```jsx
<p>{booking.notes}</p>  // Safe (React escapes)
// Not:
<p dangerouslySetInnerHTML={{__html: booking.notes}} />  // Dangerous
```

---

### 9. ⚠️ Cart State Lost on Refresh

**Issue**: Cart persisted to localStorage but context not updated on hydration.

```javascript
// Cart persisted to localStorage on change
useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}, [cart]);

// But on page refresh:
// 1. localStorage read (CartProvider.js)
// 2. Context initialized with saved cart
// 3. But component doesn't know it's been populated!
```

**Impact**: Minor (cart still persisted), but could cause duplicate items if not careful.

---

### 10. ✅ Good: Transactional Consistency

**Pattern**: All write operations wrapped in `DB::transaction()`.

```php
// Booking creation is atomic
DB::transaction(function () {
    $booking = $this->create(...);  // INSERT
    BookingCreated::dispatch($booking);  // Event
});

// Payment is atomic
DB::transaction(function () {
    $payment = $this->create(...);  // INSERT
    $order->update(['status' => 'pending']);  // UPDATE
});
```

**Benefit**: Either all operations succeed or all rollback. No partial updates.

---

### 11. ✅ Good: Slot Locking Prevents Race Conditions

**Pattern**: `lockForUpdate()` in transaction prevents double-booking.

```php
$this->bookingRepository->lockSlot($scheduleId, $date);  // SELECT FOR UPDATE
// Only one transaction can hold this lock, others wait/fail
```

---

### 12. ✅ Good: Role-Based Response Filtering

**Pattern**: Service filters results based on user role.

```php
public function getAllWithRelations(User $user) {
    return match ($user->role) {
        'patient' => $user->patient ? ... : collect(),
        'doctor'  => $user->doctor  ? ... : collect(),
        'admin'   => ...,
    };
}
```

**Benefit**: Even if someone accesses endpoint, they only see their own data.

---

# RISK ASSESSMENT & RECOMMENDATIONS

## Security Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Token in localStorage (XSS) | HIGH | Use httpOnly cookies, sanitize input |
| No token expiry | HIGH | Set expiration time on token creation |
| No rate limiting on auth | HIGH | Add throttle middleware |
| Event listeners not implemented | MEDIUM | Implement notification sending |
| No error boundary | MEDIUM | Add React error boundary |
| Manual data sync | LOW | Add automatic cache invalidation |

## Performance Considerations

| Issue | Impact | Fix |
|-------|--------|-----|
| No pagination on /bookings | MEDIUM | Add limit/offset params |
| Context re-renders all consumers | MEDIUM | Split contexts by domain |
| Lazy loading routes | LOW | ✅ Already using lazy() |
| No caching on GET requests | MEDIUM | Add cache headers, SWR |

## Scalability Concerns

| Concern | Current State | Future Path |
|---------|---------------|-------------|
| Single monolith | ✅ Fine for MVP | Consider microservices if booking service scales independently |
| Relational database | ✅ Appropriate | No need to change unless search/analytics needed |
| Token validation | ✅ DB query per request | Add in-memory cache for token blacklist |
| Real-time notifications | ❌ Not implemented | Add WebSocket (Socket.io) for instant updates |

---

## Recommendations

### Priority 1: Security
- [ ] Implement token expiry (24 hours)
- [ ] Use httpOnly cookies instead of localStorage
- [ ] Add rate limiting on auth endpoints (throttle: 5,1)
- [ ] Add input sanitization/validation on all user inputs
- [ ] Add HTTPS enforcement + HSTS headers

### Priority 2: Functionality
- [ ] Implement event listeners (email, SMS notifications)
- [ ] Add pagination to booking lists
- [ ] Implement React Error Boundary
- [ ] Add automatic cache invalidation on route change

### Priority 3: Observability
- [ ] Add logging (Laravel logs, Sentry for frontend errors)
- [ ] Add monitoring (New Relic, DataDog)
- [ ] Add analytics (Google Analytics, Mixpanel)

### Priority 4: Performance
- [ ] Split Auth + Booking contexts (reduce re-renders)
- [ ] Add API response caching (SWR hook)
- [ ] Optimize image loading (lazy load, WebP format)
- [ ] Add database query optimization (indexes on foreign keys)

---

## Conclusion

The Booking Clinic Aura application demonstrates solid architectural patterns with clear separation of concerns, transactional safety, and role-based access control. The main areas for improvement are around security (token handling, rate limiting) and performance (caching, pagination). The event system is infrastructure-ready but not yet utilized, which is a good opportunity for implementing async notifications.

The monolithic architecture is appropriate for the current scale, with potential for migration to microservices if individual services (booking, payments, inventory) grow independently.

**Overall Assessment**: **Well-structured MVP with professional patterns. Ready for production with security and observability improvements.**

---

*End of Technical Architecture Analysis*  
*Generated: June 6, 2026*
