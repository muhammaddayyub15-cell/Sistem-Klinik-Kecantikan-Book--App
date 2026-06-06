<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            // PK eksplisit — konsisten dengan naming convention project
            $table->id('presc_id');

            // cascade: medical record dihapus → semua resepnya ikut terhapus
            $table->foreignId('record_id')
                  ->constrained('medical_records', 'record_id')
                  ->cascadeOnDelete();

            // Snapshot pattern — konsisten dengan order_items
            // product_id: referensi lunak tanpa FK constraint
            // jika produk dihapus (soft delete), resep lama tetap terbaca dengan benar
            $table->unsignedBigInteger('product_id');
            $table->string('product_name_snapshot'); // nama obat saat resep dibuat

            $table->unsignedInteger('qty');

            // dosage_instruction: instruksi pemakaian
            // contoh: "2x sehari sesudah makan", "1 tablet sebelum tidur"
            $table->text('dosage_instruction')->nullable();

            // prescribed_at: waktu resep ditulis, default ke waktu insert
            $table->timestamp('prescribed_at')->useCurrent();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};