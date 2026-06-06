<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('patients')->insertOrIgnore([
            ['patient_id' => 1, 'user_id' => 5, 'date_of_birth' => '1992-03-14', 'gender' => 'female', 'blood_type' => 'A+', 'address' => 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan', 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['patient_id' => 2, 'user_id' => 6, 'date_of_birth' => '1998-07-22', 'gender' => 'female', 'blood_type' => 'O+', 'address' => 'Jl. Mawar No. 5, Menteng, Jakarta Pusat',              'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['patient_id' => 3, 'user_id' => 7, 'date_of_birth' => '1995-11-08', 'gender' => 'female', 'blood_type' => 'B+', 'address' => 'Jl. Anggrek No. 30, Tanah Abang, Jakarta Pusat',       'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}