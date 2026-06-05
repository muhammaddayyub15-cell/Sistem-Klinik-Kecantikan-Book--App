<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();

            // FK eksplisit ke product_id — karena PK products bukan default 'id'
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')
                  ->references('product_id')
                  ->on('products')
                  ->cascadeOnDelete();

            // Jumlah perubahan stok — selalu positif, arah ditentukan oleh kolom type
            $table->integer('change_qty');

            // increment : stok masuk (restock, koreksi positif)
            // decrement : stok keluar (penjualan manual, write-off)
            // set       : koreksi absolut (stok di-set ke nilai tertentu)
            $table->enum('type', ['increment', 'decrement', 'set']);

            // reference_id: nullable — diisi jika perubahan stok berasal dari order
            $table->unsignedBigInteger('reference_id')->nullable();

            // reason: wajib diisi — keterangan perubahan stok untuk keperluan audit
            $table->string('reason');

            // Tidak pakai softDeletes — log tidak boleh dihapus untuk menjaga audit trail
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};