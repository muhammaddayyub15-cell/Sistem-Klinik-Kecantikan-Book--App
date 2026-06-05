<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            // PK eksplisit — konsisten dengan naming convention project
            $table->id('payment_id');

            // FK eksplisit ke order_id — relasi 1:1, satu order hanya punya satu payment
            // unique() memastikan tidak ada dua payment untuk order yang sama
            $table->unsignedBigInteger('order_id')->unique();
            $table->foreign('order_id')
                  ->references('order_id')
                  ->on('orders')
                  ->cascadeOnDelete();

            // midtrans_id: diisi saat redirect ke Midtrans berhasil, nullable saat baru diinisiasi
            $table->string('midtrans_id')->nullable()->unique();

            $table->decimal('amount', 12, 2);

            // payment_method: diisi setelah user memilih metode di halaman Midtrans
            // contoh: gopay, bca_va, bni_va, qris, credit_card
            $table->string('payment_method')->nullable();  // singular — rename dari payment_methods

            // payment_channel: channel pembayaran dari Midtrans
            // contoh: bank_transfer, qris, e-wallet
            $table->string('payment_channel')->nullable();

            // Status payment yang disimpan di DB (normalized dari status Midtrans):
            // pending  : menunggu pembayaran dari user
            // success  : pembayaran berhasil (dari webhook Midtrans: settlement)
            // failed   : pembayaran gagal (dari webhook Midtrans: deny / cancel)
            // expired  : batas waktu pembayaran habis (dari webhook Midtrans: expire)
            // Mapping dari status Midtrans ke status ini dilakukan di PaymentService
            $table->enum('status', ['pending', 'success', 'failed', 'expired'])->default('pending');

            // paid_at: diisi saat webhook Midtrans settlement diterima
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};