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
            $table->id('item_id');

            // FK ke orders — cascade: order dihapus → semua item-nya ikut terhapus
            // constrained dengan named PK 'order_id' karena orders tidak pakai default 'id'
            $table->foreignId('order_id')
                  ->constrained('orders', 'order_id')
                  ->cascadeOnDelete();

            // Snapshot pattern — tidak ada FK hidup ke products
            // data dibekukan saat order dibuat, tidak berubah meski produk di-update/hapus
            $table->unsignedBigInteger('product_id_snapshot');
            $table->string('product_name_snapshot');

            // unit_price_snapshot: harga saat transaksi — immutable
            $table->decimal('unit_price_snapshot', 12, 2);

            $table->integer('qty')->default(1);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};