<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('services')->insertOrIgnore([
            ['service_id' => 1, 'category_id' => 1, 'service_name' => 'Facial Treatment',      'description' => 'A comprehensive facial treatment for healthy and radiant skin.',       'base_price' => 350000,  'unit' => '60 menit', 'is_active' => true,  'created_at' => $now, 'updated_at' => $now],
            ['service_id' => 2, 'category_id' => 1, 'service_name' => 'Brightening Facial',    'description' => 'A skin-brightening facial using advanced technology.',                 'base_price' => 420000,  'unit' => '75 menit', 'is_active' => true,  'created_at' => $now, 'updated_at' => $now],
            ['service_id' => 3, 'category_id' => 2, 'service_name' => 'Laser Therapy',         'description' => 'Laser therapy for skin concerns and rejuvenation.',                    'base_price' => 750000,  'unit' => '45 menit', 'is_active' => true,  'created_at' => $now, 'updated_at' => $now],
            ['service_id' => 4, 'category_id' => 2, 'service_name' => 'CO2 Laser Resurfacing', 'description' => 'CO2 laser skin resurfacing for smoother skin texture.',                'base_price' => 1500000, 'unit' => '60 menit', 'is_active' => false, 'created_at' => $now, 'updated_at' => $now],
            ['service_id' => 5, 'category_id' => 3, 'service_name' => 'Botox Injection',       'description' => 'Botox injection to reduce wrinkles and fine lines.',                   'base_price' => 1200000, 'unit' => '30 menit', 'is_active' => true,  'created_at' => $now, 'updated_at' => $now],
            ['service_id' => 6, 'category_id' => 3, 'service_name' => 'Dermal Filler',         'description' => 'Dermal filler to restore volume and enhance facial contours.',         'base_price' => 2500000, 'unit' => '45 menit', 'is_active' => true,  'created_at' => $now, 'updated_at' => $now],
            ['service_id' => 7, 'category_id' => 4, 'service_name' => 'Skin Consultation',     'description' => 'Free skin consultation with a specialist doctor.',                     'base_price' => 0,       'unit' => '30 menit', 'is_active' => true,  'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}