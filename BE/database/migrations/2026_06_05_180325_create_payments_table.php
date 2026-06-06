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

            // FK ke orders — relasi 1:1
            // unique() memastikan tidak ada dua payment untuk satu order
            // cascade: order dihapus → payment ikut terhapus
            $table->foreignId('order_id')
                  ->unique()
                  ->constrained('orders', 'order_id')
                  ->cascadeOnDelete();

            // midtrans_id: transaction_id dari Midtrans
            // nullable saat payment baru diinisiasi, diisi setelah redirect berhasil
            // unique: satu midtrans_id hanya boleh ada di satu payment record
            $table->string('midtrans_id')->nullable()->unique();

            $table->decimal('amount', 12, 2);

            // payment_method: diisi setelah user memilih metode di halaman Midtrans
            // contoh: "gopay", "bca_va", "bni_va", "qris", "credit_card"
            $table->string('payment_method')->nullable();

            // payment_channel: channel dari Midtrans
            // contoh: "bank_transfer", "qris", "e-wallet"
            $table->string('payment_channel')->nullable();

            // Status mapping dari webhook Midtrans ke status internal:
            // pending  → menunggu pembayaran (default saat payment diinisiasi)
            // success  → webhook 'settlement' diterima
            // failed   → webhook 'deny' atau 'cancel' diterima
            // expired  → webhook 'expire' diterima (batas waktu habis)
            // mapping dilakukan di PaymentService::handleWebhook()
            $table->enum('status', ['pending', 'success', 'failed', 'expired'])->default('pending');

            // paid_at: diisi saat webhook settlement diterima, bukan saat inisiasi
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};