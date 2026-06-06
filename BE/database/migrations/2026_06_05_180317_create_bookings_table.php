<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh medical_records, orders
            $table->id('booking_id');

            // restrict: booking tidak bisa dibuat jika pasien/dokter/jadwal/layanan tidak ada
            // restrict juga mencegah hapus entitas yang masih punya booking aktif
            $table->foreignId('patient_id')
                  ->constrained('patients', 'patient_id')
                  ->restrictOnDelete();

            $table->foreignId('doctor_id')
                  ->constrained('doctors', 'doctor_id')
                  ->restrictOnDelete();

            // doctor_schedule_id: slot jadwal yang dipilih pasien saat booking
            // divalidasi di BookingService::createBooking() — cek slot tidak bentrok
            $table->foreignId('doctor_schedule_id')
                  ->constrained('doctor_schedules', 'schedule_id')
                  ->restrictOnDelete();

            $table->foreignId('service_id')
                  ->constrained('services', 'service_id')
                  ->restrictOnDelete();

            $table->date('booked_date');
            $table->time('start_time');
            $table->time('end_time');

            // Status lifecycle:
            // pending   → confirmed → done
            //                      ↘ cancelled (oleh patient/doctor/admin)
            // Dikonfirmasi dengan frontend docs — tidak pakai 'in_progress'/'completed'
            $table->enum('status', ['pending', 'confirmed', 'done', 'cancelled'])->default('pending');

            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};