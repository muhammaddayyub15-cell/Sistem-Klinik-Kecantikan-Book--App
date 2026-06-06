<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class MedicalRecordsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('medical_records')->insertOrIgnore([
            ['record_id' => 1, 'booking_id' => 1, 'patient_id' => 1, 'doctor_id' => 1, 'diagnosis' => 'Kulit kusam dengan hiperpigmentasi ringan di area pipi dan dahi.', 'prescription_text' => 'Vitamin C Serum 20% — aplikasikan pagi hari setelah cuci muka.',         'recorded_at' => Carbon::parse('2025-05-05 10:05:00'), 'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-05 10:05:00'), 'updated_at' => Carbon::parse('2025-05-05 10:15:00')],
            ['record_id' => 2, 'booking_id' => 2, 'patient_id' => 2, 'doctor_id' => 2, 'diagnosis' => 'Post-acne hyperpigmentation grade II di area pipi kiri dan kanan.',  'prescription_text' => 'Retinol Night Treatment 0.3% — gunakan malam hari 3x seminggu.', 'recorded_at' => Carbon::parse('2025-05-07 14:50:00'), 'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-07 14:50:00'), 'updated_at' => Carbon::parse('2025-05-07 15:00:00')],
            ['record_id' => 3, 'booking_id' => 3, 'patient_id' => 3, 'doctor_id' => 1, 'diagnosis' => 'Kulit sensitif dengan kecenderungan kemerahan (rosacea ringan).',      'prescription_text' => null,                                                                   'recorded_at' => Carbon::parse('2025-05-09 10:20:00'), 'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-09 10:20:00'), 'updated_at' => Carbon::parse('2025-05-09 10:30:00')],
        ]);
    }
}