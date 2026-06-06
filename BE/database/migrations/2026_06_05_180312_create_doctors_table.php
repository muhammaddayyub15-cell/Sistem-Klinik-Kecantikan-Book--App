<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh bookings, doctor_schedules, medical_records
            $table->id('doctor_id');

            // FK ke users — unique karena 1 akun hanya bisa jadi 1 dokter
            // cascade: user dihapus → profil dokter ikut terhapus
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users', 'user_id')
                  ->cascadeOnDelete();

            // FK ke specializations — restrict: spesialisasi tidak bisa dihapus
            // selama masih ada dokter yang menggunakannya
            $table->foreignId('spec_id')
                  ->constrained('specializations', 'spec_id')
                  ->restrictOnDelete();

            // license_no: nomor STR (Surat Tanda Registrasi) dokter — harus unik
            $table->string('license_no')->unique();
            $table->text('bio')->nullable();

            // is_active: kontrol tampil/tidak di sistem (admin toggle)
            // is_available: kontrol bisa dibooking atau tidak (bisa di-toggle dokter sendiri)
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available')->default(true);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};