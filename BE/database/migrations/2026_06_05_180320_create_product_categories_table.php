<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh products.category_id
            $table->id('category_id');

            // category_name: unique — tidak boleh ada dua kategori dengan nama sama
            // contoh: "Obat Bebas", "Vitamin & Suplemen", "Alat Kesehatan"
            $table->string('category_name')->unique();
            $table->string('description')->nullable();

            // softDeletes: kategori tidak di-hardDelete untuk menjaga audit trail
            // produk yang menggunakan kategori ter-softDelete masih tetap valid
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};