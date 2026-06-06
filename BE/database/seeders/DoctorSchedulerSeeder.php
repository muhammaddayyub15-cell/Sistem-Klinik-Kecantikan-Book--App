<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DoctorSchedulerSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // doctor_id 1 → dr. Sari Indah   : Senin–Jumat pagi
        // doctor_id 2 → dr. Budi Santoso  : Selasa–Sabtu siang
        DB::table('doctor_schedules')->insertOrIgnore([

            // ── dr. Sari Indah (doctor_id = 1) ───────────────────────────
            [
                'schedule_id' => 1,
                'doctor_id'   => 1,
                'day_of_week' => 'Monday',
                'start_time'  => '08:00:00',
                'end_time'    => '12:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 2,
                'doctor_id'   => 1,
                'day_of_week' => 'Tuesday',
                'start_time'  => '08:00:00',
                'end_time'    => '12:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 3,
                'doctor_id'   => 1,
                'day_of_week' => 'Wednesday',
                'start_time'  => '08:00:00',
                'end_time'    => '12:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 4,
                'doctor_id'   => 1,
                'day_of_week' => 'Thursday',
                'start_time'  => '08:00:00',
                'end_time'    => '12:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 5,
                'doctor_id'   => 1,
                'day_of_week' => 'Friday',
                'start_time'  => '08:00:00',
                'end_time'    => '12:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],

            // ── dr. Budi Santoso (doctor_id = 2) ─────────────────────────
            [
                'schedule_id' => 6,
                'doctor_id'   => 2,
                'day_of_week' => 'Tuesday',
                'start_time'  => '13:00:00',
                'end_time'    => '17:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 7,
                'doctor_id'   => 2,
                'day_of_week' => 'Wednesday',
                'start_time'  => '13:00:00',
                'end_time'    => '17:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 8,
                'doctor_id'   => 2,
                'day_of_week' => 'Thursday',
                'start_time'  => '13:00:00',
                'end_time'    => '17:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 9,
                'doctor_id'   => 2,
                'day_of_week' => 'Friday',
                'start_time'  => '13:00:00',
                'end_time'    => '17:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'schedule_id' => 10,
                'doctor_id'   => 2,
                'day_of_week' => 'Saturday',
                'start_time'  => '09:00:00',
                'end_time'    => '13:00:00',
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
        ]);
    }
}