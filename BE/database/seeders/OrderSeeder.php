<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // order_number: format ORD-{YYYYMMDD}-{sequence}
        // patient_id_snapshot + patient_name_snapshot: immutable copy saat order dibuat
        // booking_id: FK nullable ke bookings — order bisa ada tanpa booking
        //
        // Mapping ke booking yang sudah 'completed':
        //   order_id 1 → booking_id 1 (patient_id 1 — Dewi Kusuma)
        //   order_id 2 → booking_id 2 (patient_id 2 — Anisa Putri)
        //   order_id 3 → booking_id 4 (patient_id 1 — Dewi Kusuma, status confirmed)
        DB::table('orders')->insertOrIgnore([
            [
                'order_id'               => 1,
                'order_number'           => 'ORD-20250505-0001',
                'patient_id_snapshot'    => 1,
                'patient_name_snapshot'  => 'Dewi Kusuma',
                'booking_id'             => 1,
                'total_amount'           => 695000.00,  // product_id 1 (385k) + product_id 3 (245k) + product_id 6 (310k) → lihat OrderItemSeeder
                'status'                 => 'paid',
                'paid_at'                => Carbon::parse('2025-05-05 11:00:00'),
                'cancelled_at'           => null,
                'deleted_at'             => null,
                'created_at'             => Carbon::parse('2025-05-05 10:30:00'),
                'updated_at'             => Carbon::parse('2025-05-05 11:00:00'),
            ],
            [
                'order_id'               => 2,
                'order_number'           => 'ORD-20250507-0001',
                'patient_id_snapshot'    => 2,
                'patient_name_snapshot'  => 'Anisa Putri',
                'booking_id'             => 2,
                'total_amount'           => 1045000.00, // product_id 4 (520k) + product_id 7 (265k) + product_id 8 (230k) × 2 → lihat OrderItemSeeder
                'status'                 => 'paid',
                'paid_at'                => Carbon::parse('2025-05-07 16:00:00'),
                'cancelled_at'           => null,
                'deleted_at'             => null,
                'created_at'             => Carbon::parse('2025-05-07 15:30:00'),
                'updated_at'             => Carbon::parse('2025-05-07 16:00:00'),
            ],
            [
                'order_id'               => 3,
                'order_number'           => 'ORD-20250520-0001',
                'patient_id_snapshot'    => 1,
                'patient_name_snapshot'  => 'Dewi Kusuma',
                'booking_id'             => 4,          // booking confirmed — pasien beli produk sebelum kunjungan
                'total_amount'           => 295000.00,  // product_id 2 (295k) → lihat OrderItemSeeder
                'status'                 => 'pending',  // belum bayar
                'paid_at'                => null,
                'cancelled_at'           => null,
                'deleted_at'             => null,
                'created_at'             => Carbon::parse('2025-05-20 12:00:00'),
                'updated_at'             => Carbon::parse('2025-05-20 12:00:00'),
            ],
        ]);
    }
}