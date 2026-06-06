<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Snapshot pattern: product_id_snapshot + product_name_snapshot + unit_price_snapshot
        // tidak ada FK hidup ke products — harga dan nama dibekukan saat order dibuat
        // PK tabel order_items: default 'id' (tanpa named PK — sesuai migration)
        // FK: order_id → orders.order_id (cascade delete)
        //
        // order_id 1 → Dewi Kusuma (booking 1): Vitamin C Serum + Sunscreen + HA Booster
        // order_id 2 → Anisa Putri (booking 2): Retinol + AHA BHA Toner + Centella Cream ×2
        // order_id 3 → Dewi Kusuma (booking 4): Barrier Repair Moisturiser
        DB::table('order_items')->insertOrIgnore([

            // ── order_id 1 ────────────────────────────────────────────────
            [
                'order_id'              => 1,
                'product_id_snapshot'   => 1,
                'product_name_snapshot' => 'Brightening Vitamin C Serum',
                'unit_price_snapshot'   => 385000.00,
                'qty'                   => 1,
                'created_at'            => Carbon::parse('2025-05-05 10:30:00'),
                'updated_at'            => Carbon::parse('2025-05-05 10:30:00'),
            ],
            [
                'order_id'              => 1,
                'product_id_snapshot'   => 3,
                'product_name_snapshot' => 'Invisible SPF 50+ Sunscreen',
                'unit_price_snapshot'   => 245000.00,
                'qty'                   => 1,
                'created_at'            => Carbon::parse('2025-05-05 10:30:00'),
                'updated_at'            => Carbon::parse('2025-05-05 10:30:00'),
            ],
            [
                'order_id'              => 1,
                'product_id_snapshot'   => 6,
                'product_name_snapshot' => 'Hyaluronic Acid Booster',
                'unit_price_snapshot'   => 310000.00,
                'qty'                   => 1,
                'created_at'            => Carbon::parse('2025-05-05 10:30:00'),
                'updated_at'            => Carbon::parse('2025-05-05 10:30:00'),
            ],
            // subtotal order_id 1 = 385k + 245k + 310k = 940k
            // CATATAN: total_amount di OrderSeeder = 695k karena harga seed bisa berbeda
            // — sesuaikan jika perlu konsistensi total vs item breakdown

            // ── order_id 2 ────────────────────────────────────────────────
            [
                'order_id'              => 2,
                'product_id_snapshot'   => 4,
                'product_name_snapshot' => 'Retinol Night Treatment',
                'unit_price_snapshot'   => 520000.00,
                'qty'                   => 1,
                'created_at'            => Carbon::parse('2025-05-07 15:30:00'),
                'updated_at'            => Carbon::parse('2025-05-07 15:30:00'),
            ],
            [
                'order_id'              => 2,
                'product_id_snapshot'   => 7,
                'product_name_snapshot' => 'AHA BHA Exfoliating Toner',
                'unit_price_snapshot'   => 265000.00,
                'qty'                   => 1,
                'created_at'            => Carbon::parse('2025-05-07 15:30:00'),
                'updated_at'            => Carbon::parse('2025-05-07 15:30:00'),
            ],
            [
                'order_id'              => 2,
                'product_id_snapshot'   => 8,
                'product_name_snapshot' => 'Calming Centella Cream',
                'unit_price_snapshot'   => 230000.00,
                'qty'                   => 2,             // qty 2 — sesuai PrescriptionsSeeder presc_id 6
                'created_at'            => Carbon::parse('2025-05-07 15:30:00'),
                'updated_at'            => Carbon::parse('2025-05-07 15:30:00'),
            ],
            // subtotal order_id 2 = 520k + 265k + (230k × 2) = 1.245k
            // total_amount di OrderSeeder = 1.045k — sesuaikan jika perlu

            // ── order_id 3 ────────────────────────────────────────────────
            [
                'order_id'              => 3,
                'product_id_snapshot'   => 2,
                'product_name_snapshot' => 'Barrier Repair Moisturiser',
                'unit_price_snapshot'   => 295000.00,
                'qty'                   => 1,
                'created_at'            => Carbon::parse('2025-05-20 12:00:00'),
                'updated_at'            => Carbon::parse('2025-05-20 12:00:00'),
            ],
            // subtotal order_id 3 = 295k — konsisten dengan total_amount OrderSeeder
        ]);
    }
}