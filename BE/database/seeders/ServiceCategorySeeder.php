<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('service_categories')->insertOrIgnore([
            ['category_id' => 1, 'category_name' => 'Facial',       'description' => 'Face Skins Treatments',                          'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 2, 'category_name' => 'Laser',        'description' => 'Laser Acne Therapy Beams',                       'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 3, 'category_name' => 'Injection',    'description' => 'Body Skins Booster and Fat Reducer Injection',   'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 4, 'category_name' => 'Consultation', 'description' => 'Skin Consultations',                            'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 5, 'category_name' => 'Body',         'description' => 'Full Body Treatments',                          'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}