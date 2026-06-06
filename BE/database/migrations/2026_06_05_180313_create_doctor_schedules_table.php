<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh bookings.doctor_schedule_id
            $table->id('schedule_id');

            // cascade: dokter dihapus → semua jadwalnya ikut terhapus
            $table->foreignId('doctor_id')
                  ->constrained('doctors', 'doctor_id')
                  ->cascadeOnDelete();

            // day_of_week: string untuk fleksibilitas — "Monday", "Tuesday", dst.
            // tidak pakai enum agar lebih mudah di-seed dan di-display
            $table->string('day_of_week');

            $table->time('start_time');
            $table->time('end_time');

            // is_active: jadwal bisa di-nonaktifkan tanpa dihapus
            // dipakai di ScheduleService::getActive() untuk filter booking slot
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};