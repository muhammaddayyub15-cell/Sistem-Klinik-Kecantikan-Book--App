<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Urutan seeder mengikuti dependency FK antar tabel:
     *
     * Layer 0 — tidak ada FK (standalone)
     *   users, specializations, service_categories, product_categories
     *
     * Layer 1 — FK ke Layer 0
     *   doctors (→ users, specializations)
     *   patients (→ users)
     *   services (→ service_categories)
     *   products (→ product_categories)
     *
     * Layer 2 — FK ke Layer 1
     *   doctor_schedules (→ doctors)
     *
     * Layer 3 — FK ke Layer 1 & 2
     *   bookings (→ patients, doctors, doctor_schedules, services)
     *
     * Layer 4 — FK ke Layer 3
     *   medical_records (→ bookings, patients, doctors)
     *   orders (→ bookings — nullable)
     *
     * Layer 5 — FK ke Layer 4
     *   prescriptions (→ medical_records)
     *   order_items (→ orders)
     *   payments (→ orders)
     */
    public function run(): void
    {
        // ── Layer 0: Master data tanpa FK ────────────────────────────────
        $this->call([
            UserSeeder::class,               // tabel: users
            SpecializationSeeder::class,     // tabel: specializations
            ServiceCategorySeeder::class,    // tabel: service_categories
            ProductCategorySeeder::class,    // tabel: product_categories
        ]);

        // ── Layer 1: FK ke users / master data ───────────────────────────
        $this->call([
            DoctorSeeder::class,             // tabel: doctors       → users, specializations
            PatientSeeder::class,            // tabel: patients      → users
            ServiceSeeder::class,            // tabel: services      → service_categories
            ProductSeeder::class,            // tabel: products      → product_categories
        ]);

        // ── Layer 2: FK ke doctors ────────────────────────────────────────
        $this->call([
            DoctorSchedulerSeeder::class,     // tabel: doctor_schedules → doctors
        ]);

        // ── Layer 3: FK ke patients, doctors, doctor_schedules, services ──
        $this->call([
            BookingSeeder::class,            // tabel: bookings → patients, doctors, doctor_schedules, services
        ]);

        // ── Layer 4: FK ke bookings ───────────────────────────────────────
        $this->call([
            MedicalRecordsSeeder::class,     // tabel: medical_records → bookings, patients, doctors
            OrderSeeder::class,              // tabel: orders          → bookings (nullable FK)
        ]);

        // ── Layer 5: FK ke medical_records / orders ───────────────────────
        $this->call([
            PrescriptionsSeeder::class,      // tabel: prescriptions → medical_records
            OrderItemSeeder::class,          // tabel: order_items   → orders
            PaymentSeeder::class,            // tabel: payments      → orders
        ]);
    }
}