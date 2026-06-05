<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            // PK eksplisit — konsisten dengan product_id, patient_id, order_id
            $table->id('category_id');
            $table->string('category_name')->unique();
            $table->string('description')->nullable(); // keterangan singkat kategori
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};