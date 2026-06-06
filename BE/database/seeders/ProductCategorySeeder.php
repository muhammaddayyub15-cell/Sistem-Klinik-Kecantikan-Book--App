<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // PK: category_id — sesuai migration create_product_categories_table
        // $table->id('category_id') — bukan 'id' (fix dari versi microservice lama)
        DB::table('product_categories')->insertOrIgnore([
            ['category_id' => 1, 'category_name' => 'Serum',       'description' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 2, 'category_name' => 'Moisturiser', 'description' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 3, 'category_name' => 'Sunscreen',   'description' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 4, 'category_name' => 'Treatment',   'description' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 5, 'category_name' => 'Cleanser',    'description' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}