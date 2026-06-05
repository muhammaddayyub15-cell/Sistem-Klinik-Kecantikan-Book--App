<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            // PK eksplisit — konsisten dengan naming convention project
            $table->id('order_item_id');

            // FK eksplisit ke order_id — karena PK orders bukan default 'id'
            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')
                  ->references('order_id')
                  ->on('orders')
                  ->cascadeOnDelete(); // order dihapus → semua item ikut terhapus

            // Snapshot data produk — immutable, tidak berubah meski produk di-update atau dihapus
            $table->unsignedBigInteger('product_id_snapshot');
            $table->string('product_name_snapshot');

            // Harga saat transaksi — tidak berubah meski harga produk diupdate kemudian
            $table->decimal('unit_price_snapshot', 12, 2);

            $table->integer('qty')->default(1);

            // Tidak pakai softDeletes — item tidak bisa dibatalkan satuan
            // Untuk membatalkan item, batalkan seluruh order via status order
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};