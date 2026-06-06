<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('bookings')->insertOrIgnore([
            ['booking_id' => 1, 'patient_id' => 1, 'doctor_id' => 1, 'doctor_schedule_id' => 1,  'service_id' => 1, 'booked_date' => '2025-05-05', 'start_time' => '09:00:00', 'end_time' => '10:00:00', 'status' => 'completed', 'notes' => 'Pasien ingin perawatan wajah rutin bulanan.',              'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-01 10:00:00'), 'updated_at' => Carbon::parse('2025-05-05 10:15:00')],
            ['booking_id' => 2, 'patient_id' => 2, 'doctor_id' => 2, 'doctor_schedule_id' => 7,  'service_id' => 3, 'booked_date' => '2025-05-07', 'start_time' => '14:00:00', 'end_time' => '14:45:00', 'status' => 'completed', 'notes' => 'Terapi laser untuk bekas jerawat di area pipi.',            'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-03 14:00:00'), 'updated_at' => Carbon::parse('2025-05-07 15:00:00')],
            ['booking_id' => 3, 'patient_id' => 3, 'doctor_id' => 1, 'doctor_schedule_id' => 5,  'service_id' => 7, 'booked_date' => '2025-05-09', 'start_time' => '10:00:00', 'end_time' => '10:30:00', 'status' => 'completed', 'notes' => 'Konsultasi pertama, pasien baru.',                          'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-06 09:00:00'), 'updated_at' => Carbon::parse('2025-05-09 10:35:00')],
            ['booking_id' => 4, 'patient_id' => 1, 'doctor_id' => 2, 'doctor_schedule_id' => 10, 'service_id' => 5, 'booked_date' => '2025-06-07', 'start_time' => '10:00:00', 'end_time' => '10:30:00', 'status' => 'confirmed', 'notes' => 'Pasien sudah pernah melakukan botox sebelumnya.',           'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-20 11:00:00'), 'updated_at' => Carbon::parse('2025-05-20 11:30:00')],
            ['booking_id' => 5, 'patient_id' => 2, 'doctor_id' => 1, 'doctor_schedule_id' => 2,  'service_id' => 2, 'booked_date' => '2025-05-13', 'start_time' => '09:00:00', 'end_time' => '10:15:00', 'status' => 'cancelled', 'notes' => 'Pasien membatalkan karena ada keperluan mendadak.',         'deleted_at' => null, 'created_at' => Carbon::parse('2025-05-08 08:00:00'), 'updated_at' => Carbon::parse('2025-05-12 16:00:00')],
        ]);
    }
}