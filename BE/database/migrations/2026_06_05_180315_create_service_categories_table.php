<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh services.category_id
            $table->id('category_id');

            // category_name: unique — tidak boleh ada dua kategori dengan nama sama
            // contoh: "Konsultasi", "Tindakan Medis", "Pemeriksaan Laboratorium"
            $table->string('category_name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_categories');
    }
};