<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel standar Laravel Notification system
        // dipakai oleh BookingCreated event via SendBookingNotificationListener
        // morphable ke model apapun — dalam kasus ini ke User
        Schema::create('notifications', function (Blueprint $table) {
            // UUID sebagai PK — standar Laravel notifications, bukan bigInt
            $table->uuid('id')->primary();

            // type: fully-qualified class name notification
            // contoh: "App\Notifications\BookingConfirmed"
            $table->string('type');

            // notifiable: polymorphic — mengarah ke model penerima notifikasi
            // notifiable_type = "App\Models\User", notifiable_id = user_id
            $table->morphs('notifiable');

            // data: JSON payload notifikasi — isi bebas per tipe notifikasi
            $table->text('data');

            // read_at: null = belum dibaca, diisi timestamp saat user baca
            $table->timestamp('read_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};