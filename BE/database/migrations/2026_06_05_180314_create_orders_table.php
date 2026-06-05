<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->string('order_number')->unique();

            // Snapshot data pasien — immutable, tidak berubah meski profil pasien di-update
            $table->unsignedBigInteger('patient_id_snapshot');
            $table->string('patient_name_snapshot');

            // FK hidup ke bookings — nullable karena order bisa dibuat tanpa booking
            // Sebelumnya: booking_id_snapshot (microservice). Sekarang satu DB → FK langsung.
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->foreign('booking_id')
                  ->references('booking_id')
                  ->on('bookings')
                  ->nullOnDelete(); // booking dihapus → booking_id di order jadi null, order tetap ada

            $table->decimal('total_amount', 12, 2)->default(0);

            // pending   : order baru dibuat, menunggu pembayaran
            // paid      : pembayaran berhasil dikonfirmasi via webhook Midtrans
            // cancelled : dibatalkan oleh pasien atau admin
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');

            // Timestamp perubahan status — nullable karena tidak semua status pasti terjadi
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};