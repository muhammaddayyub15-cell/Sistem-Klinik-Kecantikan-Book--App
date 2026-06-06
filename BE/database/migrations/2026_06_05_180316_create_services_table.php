<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh bookings.service_id
            $table->id('service_id');

            // restrict: kategori tidak bisa dihapus selama masih ada service yang menggunakannya
            $table->foreignId('category_id')
                  ->constrained('service_categories', 'category_id')
                  ->restrictOnDelete();

            $table->string('service_name');
            $table->text('description')->nullable();

            // base_price: harga dasar layanan — bisa berbeda per dokter di masa depan
            $table->decimal('base_price', 12, 2)->default(0);

            // unit: satuan layanan untuk tampilan di frontend
            // contoh: "sesi", "30 menit", "per kunjungan"
            $table->string('unit')->nullable();

            // is_active: layanan bisa di-nonaktifkan tanpa dihapus
            // hanya layanan aktif yang muncul di BookingPage patient
            $table->boolean('is_active')->default(true);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};