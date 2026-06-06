<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh prescriptions.record_id
            $table->id('record_id');

            // booking_id: nullable — record bisa dibuat tanpa booking (walk-in / historis)
            // nullOnDelete: booking dihapus → booking_id jadi null, record tetap ada
            // duplikat per booking dijaga di MedicalService, bukan DB constraint
            $table->foreignId('booking_id')
                  ->nullable()
                  ->constrained('bookings', 'booking_id')
                  ->nullOnDelete();

            // restrict: record tidak boleh ada tanpa pasien/dokter yang valid
            $table->foreignId('patient_id')
                  ->constrained('patients', 'patient_id')
                  ->restrictOnDelete();

            $table->foreignId('doctor_id')
                  ->constrained('doctors', 'doctor_id')
                  ->restrictOnDelete();

            // diagnosis: wajib diisi — inti dari medical record
            $table->text('diagnosis');

            // prescription_text: ringkasan resep dalam teks bebas
            // detail resep per-item ada di tabel prescriptions
            $table->text('prescription_text')->nullable();

            // recorded_at: waktu record dibuat, default ke waktu insert
            $table->timestamp('recorded_at')->useCurrent();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};