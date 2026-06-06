<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh bookings, medical_records, orders (snapshot)
            $table->id('patient_id');

            // FK ke users — unique karena 1 akun hanya bisa jadi 1 pasien
            // dibuat di AuthService::register() bersamaan dengan User
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users', 'user_id')
                  ->cascadeOnDelete();

            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->text('address')->nullable();

            // medical_history: riwayat medis statis yang diisi pasien
            // berbeda dari medical_records (catatan per kunjungan oleh dokter)
            // contoh: "alergi penisilin", "diabetes tipe 2", "riwayat operasi usus buntu"
            // nullable — tidak wajib diisi saat registrasi, bisa dilengkapi kemudian
            $table->text('medical_history')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};