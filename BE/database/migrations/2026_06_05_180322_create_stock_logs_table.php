<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            // PK eksplisit — konsisten dengan naming convention project ({table_singular}_id)
            // fix dari $table->id() tanpa nama di versi sebelumnya
            $table->id('log_id');

            // cascade: produk dihapus → log stoknya ikut terhapus
            // constrained dengan named PK 'product_id' karena products tidak pakai default 'id'
            $table->foreignId('product_id')
                  ->constrained('products', 'product_id')
                  ->cascadeOnDelete();

            // change_qty: jumlah perubahan stok — selalu positif
            // arah perubahan ditentukan oleh kolom 'type'
            $table->integer('change_qty');

            // type menentukan cara kalkulasi di ProductService::updateStock():
            // increment  → stock_qty + change_qty (restock, koreksi positif)
            // decrement  → stock_qty - change_qty (penjualan manual, write-off)
            // set        → stock_qty = change_qty  (koreksi absolut, stock opname)
            $table->enum('type', ['increment', 'decrement', 'set']);

            // reference_id: nullable — diisi jika perubahan stok berasal dari order
            // contoh: order_id saat checkout pasien berhasil
            $table->unsignedBigInteger('reference_id')->nullable();

            // reason: wajib diisi untuk keperluan audit
            // contoh: "Restock dari supplier", "Penjualan order #123", "Stock opname"
            $table->string('reason');

            // tidak pakai softDeletes — log audit tidak boleh bisa dihapus
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};