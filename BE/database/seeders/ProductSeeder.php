<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // category_id referensi ProductCategorySeeder:
        // 1 = Serum | 2 = Moisturiser | 3 = Sunscreen | 4 = Treatment | 5 = Cleanser
        // image_url: null — diisi via admin panel atau storage upload
        DB::table('products')->insertOrIgnore([
            [
                'product_id'   => 1,
                'product_name' => 'Brightening Vitamin C Serum',
                'SKU'          => 'AUR-SRM-001',
                'category_id'  => 1,
                'description'  => 'High-potency 20% Vitamin C with niacinamide for visible brightening in 2 weeks.',
                'image_url'    => null,
                'price'        => 385000.00,
                'stock_qty'    => 120,
                'unit'         => 'bottle',
                'rating'       => 4.9,
                'tag'          => 'Best Seller',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 2,
                'product_name' => 'Barrier Repair Moisturiser',
                'SKU'          => 'AUR-MST-001',
                'category_id'  => 2,
                'description'  => 'Ceramide-rich formula that restores skin barrier and locks in moisture all day.',
                'image_url'    => null,
                'price'        => 295000.00,
                'stock_qty'    => 95,
                'unit'         => 'bottle',
                'rating'       => 4.8,
                'tag'          => 'Doctor\'s Pick',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 3,
                'product_name' => 'Invisible SPF 50+ Sunscreen',
                'SKU'          => 'AUR-SUN-001',
                'category_id'  => 3,
                'description'  => 'Lightweight, non-greasy broad-spectrum UVA/UVB protection. Zero white cast.',
                'image_url'    => null,
                'price'        => 245000.00,
                'stock_qty'    => 200,
                'unit'         => 'bottle',
                'rating'       => 4.9,
                'tag'          => 'Most Popular',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 4,
                'product_name' => 'Retinol Night Treatment',
                'SKU'          => 'AUR-TRT-001',
                'category_id'  => 4,
                'description'  => '0.3% encapsulated retinol with bakuchiol for visible anti-aging results.',
                'image_url'    => null,
                'price'        => 520000.00,
                'stock_qty'    => 60,
                'unit'         => 'pcs',
                'rating'       => 4.7,
                'tag'          => 'Premium',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 5,
                'product_name' => 'Gentle Foam Cleanser',
                'SKU'          => 'AUR-CLN-001',
                'category_id'  => 5,
                'description'  => 'pH-balanced foaming cleanser that removes impurities without stripping skin.',
                'image_url'    => null,
                'price'        => 175000.00,
                'stock_qty'    => 150,
                'unit'         => 'bottle',
                'rating'       => 4.8,
                'tag'          => 'Daily Essential',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 6,
                'product_name' => 'Hyaluronic Acid Booster',
                'SKU'          => 'AUR-SRM-002',
                'category_id'  => 1,
                'description'  => 'Multi-weight HA complex with 3 molecular sizes for deep and surface hydration.',
                'image_url'    => null,
                'price'        => 310000.00,
                'stock_qty'    => 180,
                'unit'         => 'bottle',
                'rating'       => 4.9,
                'tag'          => 'Hydration Hero',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 7,
                'product_name' => 'AHA BHA Exfoliating Toner',
                'SKU'          => 'AUR-TRT-002',
                'category_id'  => 4,
                'description'  => '10% AHA + 2% BHA blend for smooth texture, unclogged pores and even tone.',
                'image_url'    => null,
                'price'        => 265000.00,
                'stock_qty'    => 80,
                'unit'         => 'bottle',
                'rating'       => 4.6,
                'tag'          => 'Clinic Formula',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'product_id'   => 8,
                'product_name' => 'Calming Centella Cream',
                'SKU'          => 'AUR-MST-002',
                'category_id'  => 2,
                'description'  => 'Cica-powered formula that soothes redness and strengthens compromised skin.',
                'image_url'    => null,
                'price'        => 230000.00,
                'stock_qty'    => 110,
                'unit'         => 'bottle',
                'rating'       => 4.8,
                'tag'          => 'Sensitive Skin',
                'deleted_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
        ]);
    }
}