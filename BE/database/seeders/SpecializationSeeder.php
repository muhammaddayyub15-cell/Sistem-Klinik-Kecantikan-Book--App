<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('specializations')->insertOrIgnore([
            ['spec_id' => 1, 'spec_name' => 'Aesthetic Dermatology', 'description' => 'Perawatan kulit estetik dan dermatologi',    'created_at' => $now, 'updated_at' => $now],
            ['spec_id' => 2, 'spec_name' => 'Laser & Skin Expert',   'description' => 'Terapi laser dan peremajaan kulit',          'created_at' => $now, 'updated_at' => $now],
            ['spec_id' => 3, 'spec_name' => 'Cosmetic Physician',    'description' => 'Dokter kosmetik dan perawatan wajah',        'created_at' => $now, 'updated_at' => $now],
            ['spec_id' => 4, 'spec_name' => 'General Skincare',      'description' => 'Perawatan kulit umum dan konsultasi',        'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}