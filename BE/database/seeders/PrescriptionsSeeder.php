<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PrescriptionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('prescriptions')->insertOrIgnore([
            ['presc_id' => 1, 'record_id' => 1, 'product_id' => 1, 'product_name_snapshot' => 'Brightening Vitamin C Serum', 'qty' => 1, 'dosage_instruction' => 'Aplikasikan 3-4 tetes pada wajah setiap pagi.',          'prescribed_at' => Carbon::parse('2025-05-05 10:10:00'), 'created_at' => Carbon::parse('2025-05-05 10:10:00'), 'updated_at' => Carbon::parse('2025-05-05 10:10:00')],
            ['presc_id' => 2, 'record_id' => 1, 'product_id' => 6, 'product_name_snapshot' => 'Hyaluronic Acid Booster',     'qty' => 1, 'dosage_instruction' => 'Gunakan 4-5 tetes pada kulit pagi dan malam.',              'prescribed_at' => Carbon::parse('2025-05-05 10:10:00'), 'created_at' => Carbon::parse('2025-05-05 10:10:00'), 'updated_at' => Carbon::parse('2025-05-05 10:10:00')],
            ['presc_id' => 3, 'record_id' => 1, 'product_id' => 3, 'product_name_snapshot' => 'Invisible SPF 50+ Sunscreen',  'qty' => 1, 'dosage_instruction' => 'Aplikasikan setiap pagi sebagai tahap terakhir skincare.', 'prescribed_at' => Carbon::parse('2025-05-05 10:10:00'), 'created_at' => Carbon::parse('2025-05-05 10:10:00'), 'updated_at' => Carbon::parse('2025-05-05 10:10:00')],
            ['presc_id' => 4, 'record_id' => 2, 'product_id' => 4, 'product_name_snapshot' => 'Retinol Night Treatment',      'qty' => 1, 'dosage_instruction' => 'Gunakan malam hari 3x seminggu.',                         'prescribed_at' => Carbon::parse('2025-05-07 14:55:00'), 'created_at' => Carbon::parse('2025-05-07 14:55:00'), 'updated_at' => Carbon::parse('2025-05-07 14:55:00')],
            ['presc_id' => 5, 'record_id' => 2, 'product_id' => 7, 'product_name_snapshot' => 'AHA BHA Exfoliating Toner',    'qty' => 1, 'dosage_instruction' => 'Gunakan 2x seminggu malam hari.',                         'prescribed_at' => Carbon::parse('2025-05-07 14:55:00'), 'created_at' => Carbon::parse('2025-05-07 14:55:00'), 'updated_at' => Carbon::parse('2025-05-07 14:55:00')],
            ['presc_id' => 6, 'record_id' => 2, 'product_id' => 8, 'product_name_snapshot' => 'Calming Centella Cream',       'qty' => 2, 'dosage_instruction' => 'Aplikasikan tipis pada area kemerahan setiap pagi dan malam.', 'prescribed_at' => Carbon::parse('2025-05-07 14:55:00'), 'created_at' => Carbon::parse('2025-05-07 14:55:00'), 'updated_at' => Carbon::parse('2025-05-07 14:55:00')],
        ]);
    }
}