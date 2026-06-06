<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // PK eksplisit — seluruh project pakai named PK, bukan default 'id'
            $table->id('user_id');
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');

            // role: menentukan akses via RoleMiddleware
            // admin, doctor, patient → dashboard berbeda
            // staff → reserved untuk keperluan internal klinik
            $table->enum('role', ['admin', 'doctor', 'patient', 'staff'])->default('patient');

            // status: kontrol akses tanpa hard delete
            // banned → login ditolak di AuthService
            $table->enum('status', ['active', 'inactive', 'banned'])->default('active');

            $table->timestamp('email_verified_at')->nullable();

            // last_login_at: diupdate di UserService::updateLastLogin() setiap login berhasil
            $table->timestamp('last_login_at')->nullable();

            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();

            // FK eksplisit ke user_id — karena PK users bukan default 'id'
            // nullOnDelete: session tetap ada walau user dihapus (soft delete aman)
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->nullOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        // drop child tables dulu sebelum parent untuk hindari FK constraint error
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};